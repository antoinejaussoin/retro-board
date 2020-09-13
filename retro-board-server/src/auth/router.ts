import express, { Request, Response } from 'express';
import passport from 'passport';
import { readSync } from 'fs';
import { request } from 'http';

interface Request2 extends Request {}

const router = express.Router();
// Setting up the passport middleware for each of the OAuth providers
const twitterAuth = passport.authenticate('twitter');
const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});
const facebookAuth = passport.authenticate('facebook');
const githubAuth = passport.authenticate('github');
const anonAuth = passport.authenticate('local');

export const endOAuthHandler = (req: Request2, res: Response) => {
  const io = req.app.get('io');
  io.in(req.session!.socketId).emit('auth', req.user);
  console.log('endOAuthHandler', req.user);
  req.logIn(req.user!, (err) => {
    res.end();
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
router.post('/anonymous/login', anonAuth, endAnonHandler);

// This custom middleware allows us to attach the socket id to the session
// With that socket id we can send back the right user info to the right
// socket
router.use((req, _, next) => {
  req.session!.socketId = req.query.socketId;
  next();
});

// Routes that are triggered on the client
router.get('/twitter', twitterAuth);
router.get('/google', googleAuth);
router.get('/facebook', facebookAuth);
router.get('/github', githubAuth);

export default router;
