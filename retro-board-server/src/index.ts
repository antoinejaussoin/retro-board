import express from 'express';
import * as socketIo from 'socket.io';
import { createAdapter } from 'socket.io-redis';
import redis from 'redis';
import connectRedis from 'connect-redis';
import http from 'http';
import chalk from 'chalk';
import db from './db';
import config from './db/config';
import passport from 'passport';
import passportInit from './auth/passport';
import authRouter from './auth/router';
import stripeRouter from './stripe/router';
import session from 'express-session';
import game from './game';
import {
  hashPassword,
  getUserFromRequest,
  getUserViewFromRequest,
  getUserQuota,
} from './utils';
import {
  initSentry,
  setupSentryErrorHandler,
  setupSentryRequestHandler,
  setScope,
  reportQueryError,
  throttledManualReport,
} from './sentry';
import {
  RegisterPayload,
  ValidateEmailPayload,
  ResetPasswordPayload,
  ResetChangePasswordPayload,
  CreateSessionPayload,
} from '@retrospected/common';
import registerUser from './auth/register/register-user';
import { sendVerificationEmail, sendResetPassword } from './email/emailSender';
import { v4 } from 'uuid';
import {
  createSession,
  previousSessions,
  deleteSessions,
  getDefaultTemplate,
} from './db/actions/sessions';
import { updateUser, getUserByUsername, getUserView } from './db/actions/users';
import isLicenced from './security/is-licenced';
import rateLimit from 'express-rate-limit';
import { Cache, inMemoryCache, redisCache } from './cache/cache';

const realIpHeader = 'X-Forwarded-For';

if (!isLicenced()) {
  console.log(chalk`{red ----------------------------------------------- }`);
  console.log(
    chalk`⚠️  {red This software is not licenced. Please contact
support@retrospected.com to get a licence.} ⚠️`
  );
  console.log(chalk`{red ----------------------------------------------- }`);
}

initSentry();

const app = express();

function getActualIp(req: express.Request): string {
  const headerValue = req.header(realIpHeader);
  if (headerValue) {
    return headerValue.split(',')[0];
  }
  return req.ip;
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

// Stripe
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

// saveUninitialized: true allows us to attach the socket id to the session
// before we have athenticated the user
let sessionMiddleware: express.RequestHandler;

const httpServer = new http.Server(app);
const io = new socketIo.Server(httpServer, {
  maxHttpBufferSize: config.WS_MAX_BUFFER_SIZE,
});
let cache: Cache;

if (config.REDIS_ENABLED) {
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
  });
  const subClient = redisClient.duplicate();
  sessionMiddleware = session({
    secret: `${process.env.SESSION_SECRET!}-2`, // Increment to force re-auth
    resave: true,
    saveUninitialized: true,
    store: new RedisStore({ client: redisClient }),
    cookie: {
      secure: false,
    },
  });
  io.adapter(createAdapter({ pubClient: redisClient, subClient }));
  cache = redisCache(redisClient);
  console.log(chalk`{red Redis} was properly activated`);
} else {
  sessionMiddleware = session({
    secret: `${process.env.SESSION_SECRET!}-2`, // Increment to force re-auth
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false,
    },
  });
  cache = inMemoryCache();
}

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// app.use(
//   mung.json((body, req, res) => {
//     if (body) {
//       const hasPassword = hasField('password', body);
//       if (hasPassword) {
//         console.error('The following object has a password property: ', body);
//       }
//     }
//   })
// );

app.get('/api/ping', (req, res) => {
  res.send('pong');
});

// Liveliness Probe
app.get('/healthz', async (_, res) => {
  res.status(200).send();
});

app.use('/api/auth', heavyLoadLimiter, authRouter);

io.use(function (socket, next) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sessionMiddleware(socket.request as any, {} as any, next as any);
});

app.set('io', io);
const port = config.BACKEND_PORT || 8081;

db().then(() => {
  passportInit();
  game(io);

  // Stripe
  app.use('/api/stripe', stripeRouter());

  // Create session
  app.post('/api/create', heavyLoadLimiter, async (req, res) => {
    const user = await getUserFromRequest(req);
    const payload: CreateSessionPayload = req.body;
    setScope(async (scope) => {
      if (user) {
        try {
          const session = await createSession(user, payload.encryptedCheck);
          await cache.invalidate(user.id);
          res.status(200).send(session);
        } catch (err) {
          reportQueryError(scope, err);
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
    req.logout();
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
      res.status(200).send(user.toJson());
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
    const user = await getUserFromRequest(req);
    if (user) {
      const cached = await cache.get(user.id);
      if (cached) {
        return res.status(200).send(cached);
      }

      const sessions = await previousSessions(user.id);
      await cache.set(user.id, sessions, 60 * 1000);
      res.status(200).send(sessions);
    } else {
      res.status(200).send([]);
    }
  });

  app.delete('/api/session/:sessionId', heavyLoadLimiter, async (req, res) => {
    const sessionId = req.params.sessionId;
    const user = await getUserFromRequest(req);
    if (user && user.accountType !== 'anonymous') {
      const success = await deleteSessions(user.id, sessionId);
      cache.invalidate(user.id);
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
    if (req.user) {
      await updateUser(req.user, {
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
    if (req.user) {
      const defaultTemplate = await getDefaultTemplate(req.user);
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
    if (req.user) {
      res.status(500).send('You are already logged in');
      return;
    }
    const registerPayload = req.body as RegisterPayload;
    if ((await getUserByUsername(registerPayload.username)) !== null) {
      res.status(403).send('User already exists');
      return;
    }
    const user = await registerUser(registerPayload);
    if (!user) {
      res.status(500).send();
    } else {
      await sendVerificationEmail(
        registerPayload.username,
        registerPayload.name,
        user.emailVerification!
      );
      const userView = await getUserView(user.id);
      if (userView) {
        res.status(200).send(userView.toJson());
      } else {
        res.status(500).send();
      }
    }
  });

  app.post('/api/validate', heavyLoadLimiter, async (req, res) => {
    const validatePayload = req.body as ValidateEmailPayload;
    const user = await getUserByUsername(validatePayload.email);
    if (!user) {
      res.status(404).send('Email not found');
      return;
    }
    if (
      user.emailVerification &&
      user.emailVerification === validatePayload.code
    ) {
      const updatedUser = await updateUser(user.id, {
        emailVerification: null,
      });
      req.logIn(user.id, (err) => {
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
    const user = await getUserByUsername(resetPayload.email);
    if (!user) {
      res.status(404).send('Email not found');
      return;
    }
    const code = v4();
    await updateUser(user.id, {
      emailVerification: code,
    });
    await sendResetPassword(resetPayload.email, user.name, code);
    res.status(200).send();
  });

  app.get('/api/licenced', async (_, res) => {
    res.status(200).send(isLicenced());
  });

  app.post('/api/reset-password', heavyLoadLimiter, async (req, res) => {
    const validatePayload = req.body as ResetChangePasswordPayload;
    const user = await getUserByUsername(validatePayload.email);
    if (!user) {
      res.status(404).send('Email not found');
      return;
    }
    if (
      user.emailVerification &&
      user.emailVerification === validatePayload.code
    ) {
      const hashedPassword = await hashPassword(validatePayload.password);
      const updatedUser = await updateUser(user.id, {
        emailVerification: null,
        password: hashedPassword,
      });
      req.logIn(user.id, (err) => {
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

  setupSentryErrorHandler(app);
});

httpServer.listen(port);
const env = process.env.NODE_ENV || 'dev';
console.log(
  chalk`Server started on port {red ${port.toString()}}, environment: {blue ${env}}`
);
