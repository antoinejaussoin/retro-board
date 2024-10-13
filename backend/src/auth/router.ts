import { mergeAnonymous } from '../db/actions/merge.js';
import express, {
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import passport from 'passport';
import type { UserIds } from '../utils.js';

const router = express.Router();
// Setting up the passport middleware for each of the OAuth providers
const twitterAuth = passport.authenticate('twitter');
const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});
const facebookAuth = passport.authenticate('facebook');
const githubAuth = passport.authenticate('github', { scope: ['user:email'] });
const slackAuth = passport.authenticate('Slack');
const microsoftAuth = passport.authenticate('microsoft');
const oktaAuth = passport.authenticate('okta');

function anonAuth(req: Request, res: Response, next: NextFunction) {
  passport.authenticate('local', async (err, user: UserIds | null) => {
    res.setHeader('Content-Type', 'application/json');

    if (err) {
      return res.status(403).send().end();
    }
    if (!user) {
      return res.status(403).send().end();
    }

    await mergeAnonymous(req, user.identityId);

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).send().end();
    });
  })(req, res, next);
}

export const endOAuthHandler = (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');

  const io = req.app.get('io');
  io.in(req.session.socketId).emit('auth', req.user);
  req.logIn(req.user as UserIds, (err: unknown) => {
    if (err) {
      res.status(403).send().end();
    } else {
      res.status(200).send().end();
    }
  });
};

export const endAnonHandler = (req: Request, res: Response) => {
  res.send(req.user);
};

// Routes that are triggered by the callbacks from each OAuth provider once
// the user has authenticated successfully
router.get('/twitter/callback', twitterAuth, endOAuthHandler);
router.get('/google/callback', googleAuth, endOAuthHandler);
router.get('/github/callback', githubAuth, endOAuthHandler);
router.get('/slack/callback', slackAuth, endOAuthHandler);
router.get('/microsoft/callback', microsoftAuth, endOAuthHandler);
router.get('/okta/callback', oktaAuth, endOAuthHandler);
router.post('/anonymous/login', anonAuth, endAnonHandler);
router.post('/login', anonAuth, endAnonHandler);

// This custom middleware allows us to attach the socket id to the session
// With that socket id we can send back the right user info to the right
// socket
router.use((req, _, next) => {
  if (req.session) {
    req.session.socketId = req.query.socketId as string;
  }

  next();
});

// Routes that are triggered on the client
router.get('/twitter', twitterAuth);
router.get('/google', googleAuth);
router.get('/facebook', facebookAuth);
router.get('/github', githubAuth);
router.get('/slack', slackAuth);
router.get('/microsoft', microsoftAuth);
router.get('/okta', oktaAuth);

export default router;
