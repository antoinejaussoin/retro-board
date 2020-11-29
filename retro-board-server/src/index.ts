import express from 'express';
import socketIo from 'socket.io';
import socketIoRedisAdapter from 'socket.io-redis';
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
} from './utils';
import {
  initSentry,
  setupSentryErrorHandler,
  setupSentryRequestHandler,
  setScope,
  reportQueryError,
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
  createCustom,
  previousSessions,
  deleteSessions,
  getDefaultTemplate,
} from './db/actions/sessions';
import { updateUser, getUserByUsername, getUserView } from './db/actions/users';
import isLicenced from './security/is-licenced';

if (!isLicenced()) {
  console.log(chalk`{red ----------------------------------------------- }`);
  console.log(
    chalk`⚠️ {red This software is not licenced. Please contact
support@retrospected.com to obtain a licence.} ⚠️`
  );
  console.log(chalk`{red ----------------------------------------------- }`);
}

initSentry();

const app = express();
setupSentryRequestHandler(app);
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

if (config.REDIS_ENABLED) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const RedisStore = connectRedis((session as unknown) as any);
  const redisClient = redis.createClient({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
  });
  sessionMiddleware = session({
    secret: `${process.env.SESSION_SECRET!}-1`, // Increment to force re-auth
    resave: true,
    saveUninitialized: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store: (new RedisStore({ client: redisClient as any }) as unknown) as any,
    cookie: {
      secure: false,
    },
  });
} else {
  sessionMiddleware = session({
    secret: `${process.env.SESSION_SECRET!}-2`, // Increment to force re-auth
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false,
    },
  });
}

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

const httpServer = new http.Server(app);

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

app.use('/api/auth', authRouter);

const io = socketIo(httpServer);

io.use(function (socket, next) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sessionMiddleware(socket.request, {} as any, next);
});

app.set('io', io);
const port = config.BACKEND_PORT || 8081;

if (config.REDIS_ENABLED) {
  io.adapter(
    socketIoRedisAdapter({ host: config.REDIS_HOST, port: config.REDIS_PORT })
  );
  console.log(chalk`{red Redis} was properly activated`);
}

db().then((connection) => {
  passportInit(connection);
  game(connection, io);

  // Stripe
  app.use('/api/stripe', stripeRouter(connection));

  // Create session
  app.post('/api/create', async (req, res) => {
    const user = await getUserFromRequest(connection, req);
    const payload: CreateSessionPayload = req.body;
    setScope(async (scope) => {
      if (user) {
        try {
          const session = await createSession(
            connection,
            user,
            payload.encryptedCheck
          );
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

  app.post('/api/create-custom', async (req, res) => {
    const user = await getUserFromRequest(connection, req);
    setScope(async (scope) => {
      if (user) {
        try {
          const session = await createCustom(
            connection,
            req.body.options,
            req.body.columns,
            req.body.setDefault,
            user
          );
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
    req.session?.destroy((err) => {
      if (err) {
        return next(err);
      }
      return res.send({ authenticated: req.isAuthenticated() });
    });
  });

  app.get('/api/me', async (req, res) => {
    const user = await getUserViewFromRequest(connection, req);
    if (user) {
      res.status(200).send(user.toJson());
    } else {
      res.status(401).send('Not logged in');
    }
  });

  app.get('/api/previous', async (req, res) => {
    const user = await getUserFromRequest(connection, req);
    if (user) {
      const sessions = await previousSessions(connection, user.id);
      res.status(200).send(sessions);
    } else {
      res.status(200).send([]);
    }
  });

  app.delete('/api/session/:sessionId', async (req, res) => {
    const sessionId = req.params.sessionId;
    const user = await getUserFromRequest(connection, req);
    if (user && user.accountType !== 'anonymous') {
      const success = await deleteSessions(connection, user.id, sessionId);
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
      await updateUser(connection, req.user, {
        language: req.body.language,
      });
      const updatedUser = await getUserViewFromRequest(connection, req);
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
      const defaultTemplate = await getDefaultTemplate(connection, req.user);
      if (defaultTemplate) {
        res.status(200).send(defaultTemplate);
      } else {
        res.status(404);
      }
    } else {
      res.status(401).send();
    }
  });

  app.post('/api/register', async (req, res) => {
    if (req.user) {
      res.status(500).send('You are already logged in');
      return;
    }
    const registerPayload = req.body as RegisterPayload;
    if (
      (await getUserByUsername(connection, registerPayload.username)) !== null
    ) {
      res.status(403).send('User already exists');
      return;
    }
    const user = await registerUser(connection, registerPayload);
    if (!user) {
      res.status(500).send();
    } else {
      await sendVerificationEmail(
        registerPayload.username,
        registerPayload.name,
        user.emailVerification!
      );
      const userView = await getUserView(connection, user.id);
      if (userView) {
        res.status(200).send(userView.toJson());
      } else {
        res.status(500).send();
      }
    }
  });

  app.post('/api/validate', async (req, res) => {
    const validatePayload = req.body as ValidateEmailPayload;
    const user = await getUserByUsername(connection, validatePayload.email);
    if (!user) {
      res.status(404).send('Email not found');
      return;
    }
    if (
      user.emailVerification &&
      user.emailVerification === validatePayload.code
    ) {
      const updatedUser = await updateUser(connection, user.id, {
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

  app.post('/api/reset', async (req, res) => {
    const resetPayload = req.body as ResetPasswordPayload;
    const user = await getUserByUsername(connection, resetPayload.email);
    if (!user) {
      res.status(404).send('Email not found');
      return;
    }
    const code = v4();
    await updateUser(connection, user.id, {
      emailVerification: code,
    });
    await sendResetPassword(resetPayload.email, user.name, code);
    res.status(200).send();
  });

  app.get('/api/licenced', async (_, res) => {
    res.status(200).send(isLicenced());
  });

  app.post('/api/reset-password', async (req, res) => {
    const validatePayload = req.body as ResetChangePasswordPayload;
    const user = await getUserByUsername(connection, validatePayload.email);
    if (!user) {
      res.status(404).send('Email not found');
      return;
    }
    if (
      user.emailVerification &&
      user.emailVerification === validatePayload.code
    ) {
      const hashedPassword = await hashPassword(validatePayload.password);
      const updatedUser = await updateUser(connection, user.id, {
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
