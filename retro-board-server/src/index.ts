import express from 'express';
import bodyParser from 'body-parser';
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
import session from 'express-session';
import game from './game';
import { getUser } from './utils';
import {
  initSentry,
  setupSentryErrorHandler,
  setupSentryRequestHandler,
  setScope,
  reportQueryError,
} from './sentry';
import { RegisterPayload, ValidateEmailPayload, ResetPasswordPayload, ResetChangePasswordPayload } from 'retro-board-common';
import registerUser from './auth/register/register-user';
import { sendVerificationEmail, sendResetPassword } from './email/emailSender';
import { v4 } from 'uuid';

initSentry();

const app = express();
setupSentryRequestHandler(app);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// saveUninitialized: true allows us to attach the socket id to the session
// before we have athenticated the user
let sessionMiddleware: express.RequestHandler;

if (config.REDIS_ENABLED) {
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
  });
  sessionMiddleware = session({
    secret: `${process.env.SESSION_SECRET!}-1`, // Increment to force re-auth
    resave: true,
    saveUninitialized: true,
    store: new RedisStore({ client: redisClient as any }),
    cookie: {
      secure: false,
    },
  });
} else {
  sessionMiddleware = session({
    secret: `${process.env.SESSION_SECRET!}-1`, // Increment to force re-auth
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

db().then((store) => {
  passportInit(store);
  game(store, io);

  // Create session
  app.post('/api/create', async (req, res) => {
    const user = await getUser(store, req);
    setScope(async (scope) => {
      if (user) {
        try {
          const session = await store.create(user);
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
    const user = await getUser(store, req);
    setScope(async (scope) => {
      if (user) {
        try {
          const session = await store.createCustom(
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
    const user = await getUser(store, req);
    if (user) {
      res.status(200).send(user);
    } else {
      res.status(401).send('Not logged in');
    }
  });

  app.get('/api/previous', async (req, res) => {
    const user = await getUser(store, req);
    if (user) {
      const sessions = await store.previousSessions(user.id);
      res.status(200).send(sessions);
    } else {
      res.status(200).send([]);
    }
  });

  app.delete('/api/session/:sessionId', async (req, res) => {
    const sessionId = req.params.sessionId;
    const user = await getUser(store, req);
    if (user && user.accountType !== 'anonymous') {
      const success = await store.deleteSession(user.id, sessionId);
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
      const updatedUser = await store.updateUser(req.user, {
        language: req.body.language,
      });
      res.status(200).send(updatedUser);
    } else {
      res.status(401).send();
    }
  });

  app.get('/api/me/default-template', async (req, res) => {
    if (req.user) {
      const defaultTemplate = await store.getDefaultTemplate(req.user);
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
    if (await store.getUserByUsername(registerPayload.username) !== null) {
      res.status(403).send("User already exists");
      return;
    }
    const user = await registerUser(store, registerPayload);
    if (!user) {
      res.status(500).send();
    } else {
      await sendVerificationEmail(registerPayload.username, registerPayload.name, user.emailVerification!);
      res.status(200).send(user);
    }
  });

  app.post('/api/validate', async (req, res) => {
    const validatePayload = req.body as ValidateEmailPayload;
    const user = await store.getUserByUsername(validatePayload.email);
    if (!user) {
      res.status(404).send("Email not found");
      return;
    }
    if (user.emailVerification && user.emailVerification === validatePayload.code) {
      const updatedUser = await store.updateUser(user.id, {
        emailVerification: null,
      });
      req.logIn(user.id, (err) => {
        if (err) {
          console.log('Cannot login Error: ', err);
          res.status(500).send('Cannot login');
        } else {
          res.status(200).send(updatedUser);
        }
      });
    } else {
      res.status(403).send('Code not valid');
    }
  });

  app.post('/api/reset', async (req, res) => {
    const resetPayload = req.body as ResetPasswordPayload;
    const user = await store.getUserByUsername(resetPayload.email);
    if (!user) {
      res.status(404).send("Email not found");
      return;
    }
    const code = v4();
    await store.updateUser(user.id, {
      emailVerification: code,
    });
    await sendResetPassword(resetPayload.email, user.name, code);
    res.status(200).send();
  });

  app.post('/api/reset-password', async (req, res) => {
    const validatePayload = req.body as ResetChangePasswordPayload;
    const user = await store.getUserByUsername(validatePayload.email);
    if (!user) {
      res.status(404).send("Email not found");
      return;
    }
    if (user.emailVerification && user.emailVerification === validatePayload.code) {
      const updatedUser = await store.updateUser(user.id, {
        emailVerification: null,
        password: validatePayload.password,
      });
      req.logIn(user.id, (err) => {
        if (err) {
          console.log('Cannot login Error: ', err);
          res.status(500).send('Cannot login');
        } else {
          res.status(200).send(updatedUser);
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
