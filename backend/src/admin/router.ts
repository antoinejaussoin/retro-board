import express from 'express';
import {
  getAllPasswordUsers,
  getPasswordIdentityByUserId,
  updateIdentity,
} from '../db/actions/users';
import config from '../config';
import { isLicenced } from '../security/is-licenced';
import { AdminChangePasswordPayload, BackendCapabilities } from '../common';
import { getIdentityFromRequest, hashPassword } from '../utils';
import { canSendEmails } from '../email/utils';

const router = express.Router();

router.get('/self-hosting', async (_, res) => {
  const licence = await isLicenced();
  const payload: BackendCapabilities = {
    adminEmail: config.SELF_HOSTED_ADMIN,
    selfHosted: config.SELF_HOSTED,
    licenced: !!licence,
    emailAvailable: canSendEmails(),
    slackClientId:
      config.SLACK_BOT_ENABLE && config.SLACK_KEY
        ? config.SLACK_KEY
        : undefined,
    disableAnonymous: config.DISABLE_ANONYMOUS_LOGIN,
    disablePasswords: config.DISABLE_PASSWORD_LOGIN,
    disablePasswordRegistration: config.DISABLE_PASSWORD_REGISTRATION,
    oAuth: {
      google: !!config.GOOGLE_KEY && !!config.GOOGLE_SECRET,
      github: !!config.GITHUB_KEY && !!config.GITHUB_SECRET,
      microsoft: !!config.MICROSOFT_KEY && !!config.MICROSOFT_SECRET,
      slack: !!config.SLACK_KEY && !!config.SLACK_SECRET,
      twitter: !!config.TWITTER_KEY && !!config.TWITTER_SECRET,
      okta: !!config.OKTA_AUDIENCE && !!config.OKTA_KEY && !!config.OKTA_SECRET,
    },
  };
  res.status(200).send(payload);
});

router.get('/users', async (req, res) => {
  const identity = await getIdentityFromRequest(req);
  if (!identity || identity.user.email !== config.SELF_HOSTED_ADMIN) {
    return res.status(403).send('You are not allowed to do this');
  }
  const users = await getAllPasswordUsers();
  res.send(users.map((u) => u.toJson()));
});

router.patch('/user', async (req, res) => {
  const authIdentity = await getIdentityFromRequest(req);
  if (!authIdentity || authIdentity.user.email !== config.SELF_HOSTED_ADMIN) {
    return res.status(403).send('You are not allowed to do this');
  }
  const payload = req.body as AdminChangePasswordPayload;
  const identity = await getPasswordIdentityByUserId(payload.userId);
  if (identity) {
    const hashedPassword = await hashPassword(payload.password);
    const updatedUser = await updateIdentity(identity.id, {
      password: hashedPassword,
    });
    if (updatedUser) {
      return res.status(200).send(updatedUser.toJson());
    }
  }
  res.status(403).send('Cannot update users password');
});

export default router;
