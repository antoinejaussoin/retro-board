import express from 'express';
import * as socketIo from 'socket.io';
import { createAdapter } from 'socket.io-redis';
import { createClient } from 'redis';
import connectRedis from 'connect-redis';
import http from 'http';
import chalk from 'chalk-template';
import session from 'express-session';
import passport from 'passport';
import db from './db/index.js';
import config from './config.js';
import passportInit from './auth/passport.js';
import authRouter from './auth/router.js';
import adminRouter from './admin/router.js';
import stripeRouter from './stripe/router.js';
import slackRouter from './slack/router.js';
import game from './game.js';
import {
  getIdentityFromRequest,
  getUserViewFromRequest,
  getUserQuota,
} from './utils.js';
import { hashPassword } from './encryption.js';
import {
  initSentry,
  setupSentryErrorHandler,
  setupSentryRequestHandler,
  setScope,
  reportQueryError,
  throttledManualReport,
} from './sentry.js';
import {
  RegisterPayload,
  ValidateEmailPayload,
  ResetPasswordPayload,
  ResetChangePasswordPayload,
  CreateSessionPayload,
  SelfHostedCheckPayload,
  DeleteAccountPayload,
  ChangeUserNamePayload,
} from './common/index.js';
import registerPasswordUser from './auth/register/register-user.js';
import {
  sendVerificationEmail,
  sendResetPassword,
} from './email/emailSender.js';
import { v4 } from 'uuid';
import {
  createSession,
  previousSessions,
  deleteSessions,
  getDefaultTemplate,
} from './db/actions/sessions.js';
import {
  updateUser,
  getUserView,
  getPasswordIdentity,
  updateIdentity,
  getIdentityByUsername,
  associateUserWithAdWordsCampaign,
  TrackingInfo,
  getRelatedUsers,
} from './db/actions/users.js';
import { isLicenced } from './security/is-licenced.js';
import rateLimit from 'express-rate-limit';
import { fetchLicence, validateLicence } from './db/actions/licences.js';
import { hasField } from './security/payload-checker.js';
import mung from 'express-mung';
import { QueryFailedError } from 'typeorm';
import { deleteAccount } from './db/actions/delete.js';
import { noop } from 'lodash-es';
import { createDemoSession } from './db/actions/demo.js';
import cookieParser from 'cookie-parser';
import { mergeAnonymous } from './db/actions/merge.js';
import aiRouter from './ai/router.js';

const realIpHeader = 'X-Forwarded-For';
const sessionSecret = `${config.SESSION_SECRET!}-4.11.5`; // Increment to force re-auth

isLicenced().then((hasLicence) => {
  if (!hasLicence) {
    console.log(
      chalk`{red ------------------------------------------------------------- }`
    );
    console.log(
      chalk`⚠️  {red This software is not licenced.
   You can obtain a licence here:
   https://app.retrospected.com/subscribe?product=self-hosted}`
    );
    console.log(
      chalk`{red ------------------------------------------------------------- }`
    );
  } else {
    console.log(
      chalk`{green ----------------------------------------------- }`
    );
    console.log(chalk`👍  {green This software is licenced.} `);
    console.log(
      chalk`🔑  {green This licence belongs to ${hasLicence.owner}.} `
    );
    console.log(
      chalk`{green ----------------------------------------------- }`
    );
  }
});

if (config.SELF_HOSTED) {
  console.log(
    chalk`🤳  {cyan This software is {bold self-hosted}. All users are {bold Pro}.}`
  );
}

initSentry();

const app = express();
app.use(cookieParser(sessionSecret));
app.use(
  express.json({
    // This is a trick to get the raw buffer on the request, for Stripe
    verify: (req, _, buf) => {
      const request = req as express.Request;
      request.buf = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));

function getActualIp(req: express.Request): string {
  const headerValue = req.header(realIpHeader);
  if (headerValue) {
    return headerValue.split(',')[0];
  }
  return req.ip || '';
}

// Rate Limiter
app.set('trust proxy', 1);
const heavyLoadLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW,
  max: config.RATE_LIMIT_MAX,
  message:
    'Your request has been rate-limited. Please try again in a few seconds.',
  keyGenerator: getActualIp,
  onLimitReached: (req, _, options) => {
    console.error(
      chalk`{red High load request has been rate limited for {blue ${getActualIp(
        req
      )}} with options {yellow ${options.windowMs}/${options.max}}}`
    );
    throttledManualReport('A heavy load request has been rate limited', req);
  },
});

// Sentry
setupSentryRequestHandler(app);

// saveUninitialized: true allows us to attach the socket id to the session
// before we have authenticated the user
let sessionMiddleware: express.RequestHandler;

const httpServer = new http.Server(app);
const io = new socketIo.Server(httpServer, {
  maxHttpBufferSize: config.WS_MAX_BUFFER_SIZE,
});

if (config.REDIS_ENABLED) {
  const RedisStore = connectRedis(session);
  const redisClient = createClient({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
  });

  sessionMiddleware = session({
    secret: sessionSecret,
    resave: true,
    saveUninitialized: false,
    store: new RedisStore({ client: redisClient }),
    cookie: {
      secure: config.SECURE_COOKIES,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    },
  });

  if (config.REDIS_FOR_SOCKETIO_ENABLED) {
    const subClient = redisClient.duplicate();
    io.adapter(createAdapter({ pubClient: redisClient, subClient }));
    console.log(
      chalk`💾  {red Redis} for {yellow Socket.IO} was {blue activated}`
    );
  }

  console.log(chalk`💾  {red Redis} for {yellow Express} was {blue activated}`);
} else {
  sessionMiddleware = session({
    secret: sessionSecret,
    resave: true,
    saveUninitialized: false,
    cookie: {
      secure: config.SECURE_COOKIES,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    },
  });
}

if (config.OPEN_AI_API_KEY) {
  console.log(
    chalk`🤖  {red AI / ChatGPT} from {yellow OpenAI} has been {blue activated}`
  );
} else {
  console.log(
    chalk`🤖  {red AI / ChatGPT} from {yellow OpenAI} was {red not activated}.\n    Please set the {yellow OPEN_AI_API_KEY} environment variable.`
  );
}

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV !== 'production') {
  app.use(
    mung.json((body) => {
      if (body) {
        const hasPassword = hasField('password', body);
        if (hasPassword) {
          console.error('The following object has a password property: ', body);
        }
        const hasStripeId =
          hasField('stripeId', body) && !hasField('identityId', body);
        if (hasStripeId) {
          console.error(
            'The following object has a stripe ID property: ',
            body
          );
        }
      }
    })
  );
}

app.get('/api/ping', (req, res) => {
  res.send('pong');
});

// Liveliness Probe
app.get('/healthz', async (_, res) => {
  res.status(200).send();
});

io.use(function (socket, next) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sessionMiddleware(socket.request as any, {} as any, next as any);
});

app.set('io', io);
const port = config.BACKEND_PORT || 8081;

db().then(() => {
  passportInit();
  game(io);

  // Auth
  app.use('/api/auth', heavyLoadLimiter, authRouter);

  // Stripe
  app.use('/api/stripe', stripeRouter());

  // Admin
  app.use('/api/admin', adminRouter(io));

  // Slack
  app.use('/api/slack', slackRouter());

  // AI
  app.use('/api/ai', aiRouter());

  // Create session
  app.post('/api/create', heavyLoadLimiter, async (req, res) => {
    const identity = await getIdentityFromRequest(req);
    const payload: CreateSessionPayload = req.body;
    setScope(async (scope) => {
      if (identity) {
        try {
          const session = await createSession(
            identity.user,
            payload.encryptedCheck
          );
          res.status(200).send(session);
        } catch (err: unknown) {
          if (err instanceof QueryFailedError) {
            reportQueryError(scope, err);
          }
          res.status(500).send();
          throw err;
        }
      } else {
        res
          .status(401)
          .send('You must be logged in in order to create a session');
      }
    });
  });

  // Create a demo session
  app.post('/api/demo', heavyLoadLimiter, async (req, res) => {
    const identity = await getIdentityFromRequest(req);
    setScope(async (scope) => {
      if (identity) {
        try {
          const session = await createDemoSession(identity.user);
          res.status(200).send(session);
        } catch (err: unknown) {
          if (err instanceof QueryFailedError) {
            reportQueryError(scope, err);
          }
          res.status(500).send();
          throw err;
        }
      } else {
        res
          .status(401)
          .send('You must be logged in in order to create a session');
      }
    });
  });

  app.post('/api/logout', async (req, res, next) => {
    req.logout({ keepSessionInfo: false }, noop);
    req.session?.destroy((err: string) => {
      if (err) {
        return next(err);
      }
      return res.send({ authenticated: req.isAuthenticated() });
    });
  });

  app.get('/api/me', async (req, res) => {
    const user = await getUserViewFromRequest(req);

    if (user) {
      const trackingString: string = req.cookies['retro_aw'];
      if (trackingString) {
        const tracking: Partial<TrackingInfo> = JSON.parse(trackingString);
        // We don't await this because we don't want to block the response
        associateUserWithAdWordsCampaign(user, tracking);
      }

      res.status(200).send(user.toJson());
    } else {
      res.status(401).send('Not logged in');
    }
  });

  app.post('/api/me/username', async (req, res) => {
    const user = await getUserViewFromRequest(req);
    if (!user) {
      return res.status(401).send('Please login');
    }
    const payload = req.body as ChangeUserNamePayload;
    const success = await updateUser(user.id, { name: payload.name });
    if (success) {
      const updated = await getUserView(user.identityId);
      if (updated) {
        return res.send(updated.toJson());
      }
    }
    return res
      .status(500)
      .send('Something went wrong while updating the user name');
  });

  app.delete('/api/me', heavyLoadLimiter, async (req, res) => {
    const user = await getUserViewFromRequest(req);
    if (user) {
      const result = await deleteAccount(
        user,
        req.body as DeleteAccountPayload
      );
      res.status(200).send(result);
    } else {
      res.status(401).send('Not logged in');
    }
  });

  app.get('/api/quota', async (req, res) => {
    const quota = await getUserQuota(req);
    if (quota) {
      res.status(200).send(quota);
    } else {
      res.status(401).send('Not logged in');
    }
  });

  app.get('/api/previous', heavyLoadLimiter, async (req, res) => {
    const identity = await getIdentityFromRequest(req);
    if (identity) {
      const sessions = await previousSessions(identity.user.id);
      res.status(200).send(sessions);
    } else {
      res.status(200).send([]);
    }
  });

  app.delete('/api/session/:sessionId', heavyLoadLimiter, async (req, res) => {
    const sessionId = req.params.sessionId;
    const identity = await getIdentityFromRequest(req);
    if (identity) {
      const success = await deleteSessions(identity.id, sessionId);
      if (success) {
        res.status(200).send();
      } else {
        res.status(403).send();
      }
    } else {
      res.status(403).send();
    }
  });

  app.post('/api/me/language', async (req, res) => {
    const user = await getUserViewFromRequest(req);
    if (user) {
      await updateUser(user.id, {
        language: req.body.language,
      });
      const updatedUser = await getUserViewFromRequest(req);

      if (updatedUser) {
        res.status(200).send(updatedUser.toJson());
      } else {
        res.status(401).send();
      }
    } else {
      res.status(401).send();
    }
  });

  app.get('/api/me/default-template', async (req, res) => {
    const user = await getUserViewFromRequest(req);
    if (user) {
      const defaultTemplate = await getDefaultTemplate(user.id);
      if (defaultTemplate) {
        res.status(200).send(defaultTemplate);
      } else {
        res.status(404);
      }
    } else {
      res.status(401).send();
    }
  });

  app.post('/api/register', heavyLoadLimiter, async (req, res) => {
    const previousUser = await getUserViewFromRequest(req);
    if (previousUser) {
      if (previousUser?.accountType !== 'anonymous') {
        res.status(500).send('You are already logged in');
        return;
      }
    }
    if (config.DISABLE_PASSWORD_REGISTRATION) {
      res.status(403).send('Password accounts registration is disabled.');
      return;
    }
    const registerPayload = req.body as RegisterPayload;
    if (
      (await getIdentityByUsername('password', registerPayload.username)) !==
      null
    ) {
      res.status(403).send('User already exists');
      return;
    }
    const identity = await registerPasswordUser(registerPayload);

    if (!identity) {
      res.status(500).send();
    } else {
      await mergeAnonymous(req, identity.id);
      if (identity.emailVerification) {
        await sendVerificationEmail(
          registerPayload.username,
          registerPayload.name,
          identity.emailVerification!
        );
        const userView = await getUserView(identity.id);
        if (userView) {
          res.status(200).send({
            loggedIn: false,
            user: userView.toJson(),
          });
        } else {
          res.status(500).send();
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        req.logIn(identity.toIds(), async (err: any) => {
          if (err) {
            console.log('Cannot login Error: ', err);
            res.status(500).send('Cannot login');
          }
          const userView = await getUserView(identity.id);
          if (userView) {
            res.status(200).send({
              loggedIn: true,
              user: userView.toJson(),
            });
          } else {
            res.status(500).send();
          }
        });
      }
    }
  });

  app.delete('/api/user/:identityId', heavyLoadLimiter, async (req, res) => {
    const user = await getUserViewFromRequest(req);
    if (!user || user.email !== config.SELF_HOSTED_ADMIN) {
      res
        .status(403)
        .send('Deleting a user is only allowed for the self-hosted admin.');
      return;
    }
    const userToDelete = await getUserView(req.params.identityId);
    if (userToDelete) {
      const result = await deleteAccount(
        userToDelete,
        req.body as DeleteAccountPayload
      );
      res.status(200).send(result);
    } else {
      res.status(404).send('User not found');
    }
  });

  app.post('/api/user', heavyLoadLimiter, async (req, res) => {
    const user = await getUserViewFromRequest(req);
    if (!user || user.email !== config.SELF_HOSTED_ADMIN) {
      res
        .status(403)
        .send('Adding a user is only allowed for the self-hosted admin.');
      return;
    }
    if (config.DISABLE_PASSWORD_REGISTRATION) {
      res.status(403).send('Password accounts registration is disabled.');
      return;
    }

    const registerPayload = req.body as RegisterPayload;
    if (
      (await getIdentityByUsername('password', registerPayload.username)) !==
      null
    ) {
      res.status(403).send('User already exists');
      return;
    }
    const identity = await registerPasswordUser(registerPayload, true);
    if (!identity) {
      res.status(500).send();
    } else {
      const userView = await getUserView(identity.id);
      if (userView) {
        res.status(200).send({
          loggedIn: false,
          user: userView.toJson(),
        });
      } else {
        res.status(500).send();
      }
    }
  });

  app.get('/api/users', heavyLoadLimiter, async (req, res) => {
    const user = await getUserViewFromRequest(req);
    if (user) {
      const users = await getRelatedUsers(user.id);
      return res.status(200).send(users);
    }
    return res.status(401).send('Not logged in');
  });

  app.post('/api/validate', heavyLoadLimiter, async (req, res) => {
    const validatePayload = req.body as ValidateEmailPayload;
    const identity = await getPasswordIdentity(validatePayload.email);
    if (!identity) {
      res.status(404).send('Email not found');
      return;
    }
    if (
      identity.emailVerification &&
      identity.emailVerification === validatePayload.code
    ) {
      const updatedUser = await updateIdentity(identity.id, {
        emailVerification: null,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      req.logIn(identity.toIds(), (err: any) => {
        if (err) {
          console.log('Cannot login Error: ', err);
          res.status(500).send('Cannot login');
        } else if (updatedUser) {
          res.status(200).send(updatedUser.toJson());
        } else {
          res.status(500).send('Unspecified error');
        }
      });
    } else {
      res.status(403).send('Code not valid');
    }
  });

  app.post('/api/reset', heavyLoadLimiter, async (req, res) => {
    const resetPayload = req.body as ResetPasswordPayload;
    const identity = await getPasswordIdentity(resetPayload.email);
    if (!identity) {
      res.status(404).send('Email not found');
      return;
    }
    const code = v4();
    await updateIdentity(identity.id, {
      emailVerification: code,
    });
    await sendResetPassword(resetPayload.email, identity.user.name, code);
    res.status(200).send();
  });

  app.post('/api/reset-password', heavyLoadLimiter, async (req, res) => {
    const resetPayload = req.body as ResetChangePasswordPayload;
    const identity = await getPasswordIdentity(resetPayload.email);
    if (!identity) {
      res.status(404).send('Email not found');
      return;
    }
    if (
      identity.emailVerification &&
      identity.emailVerification === resetPayload.code
    ) {
      const hashedPassword = await hashPassword(resetPayload.password);
      const updatedUser = await updateIdentity(identity.id, {
        emailVerification: null,
        password: hashedPassword,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      req.logIn(identity.toIds(), (err: any) => {
        if (err) {
          console.log('Cannot login Error: ', err);
          res.status(500).send('Cannot login');
        } else if (updatedUser) {
          res.status(200).send(updatedUser.toJson());
        } else {
          res.status(500).send('Unspecified error');
        }
      });
    } else {
      res.status(403).send('Code not valid');
    }
  });

  // Keep this for backward compatibility
  app.post('/api/self-hosted', heavyLoadLimiter, async (req, res) => {
    const payload = req.body as SelfHostedCheckPayload;
    console.log('Attempting to verify self-hosted licence for ', payload.key);
    try {
      const isValid = await validateLicence(payload.key);
      if (isValid) {
        console.log(' ==> Self hosted licence granted.');
        res.status(200).send(true);
      } else {
        console.log(' ==> Self hosted licence INVALID.');
        res.status(200).send(false);
      }
    } catch {
      console.log(' ==> Could not check for self-hosted licence.');
      res.status(500).send('Something went wrong');
    }
  });

  app.post('/api/self-hosted-licence', heavyLoadLimiter, async (req, res) => {
    const payload = req.body as SelfHostedCheckPayload;
    console.log('Attempting to verify self-hosted licence for ', payload.key);
    try {
      const licence = await fetchLicence(payload.key);
      if (licence) {
        console.log(' ==> Self hosted licence granted.');
        res.status(200).send(licence);
      } else {
        console.log(' ==> Self hosted licence INVALID.');
        res.status(403).send(null);
      }
    } catch {
      console.log(' ==> Could not check for self-hosted licence.');
      res.status(500).send('Something went wrong');
    }
  });

  setupSentryErrorHandler(app);
});

httpServer.listen(port);
const env = process.env.NODE_ENV || 'dev';
console.log(
  chalk`Server started on port {red ${port.toString()}}, environment: {blue ${env}}`
);
