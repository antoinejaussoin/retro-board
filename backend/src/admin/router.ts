import express from 'express';
import type { NextFunction, Response, Request } from 'express';
import type { Server } from 'socket.io';
import {
  getAllNonDeletedUsers,
  getPasswordIdentityByUserId,
  updateIdentity,
} from '../db/actions/users.js';
import config from '../config.js';
import { isLicenced } from '../security/is-licenced.js';
import type {
  AdminChangePasswordPayload,
  AdminStats,
  BackendCapabilities,
  MergeUsersPayload,
} from '../common/index.js';
import { getIdentityFromRequest } from '../utils.js';
import { hashPassword } from '../encryption.js';
import { canSendEmails } from '../email/utils.js';
import { mergeUsers } from '../db/actions/merge.js';

export default function getRouter(io: Server) {
  const router = express.Router();

  async function isSelfHostAdmin(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const authIdentity = await getIdentityFromRequest(req);
    if (!authIdentity || authIdentity.user.email !== config.SELF_HOSTED_ADMIN) {
      return res.status(403).send('You are not allowed to do this');
    }
    next();
  }

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
      disableAccountDeletion: config.DISABLE_ACCOUNT_DELETION,
      disableShowAuthor: config.DISABLE_SHOW_AUTHOR,
      ai: !!config.OPEN_AI_API_KEY,
      oAuth: {
        google: !!config.GOOGLE_KEY && !!config.GOOGLE_SECRET,
        github: !!config.GITHUB_KEY && !!config.GITHUB_SECRET,
        microsoft: !!config.MICROSOFT_KEY && !!config.MICROSOFT_SECRET,
        slack: !!config.SLACK_KEY && !!config.SLACK_SECRET,
        twitter: !!config.TWITTER_KEY && !!config.TWITTER_SECRET,
        okta:
          !!config.OKTA_AUDIENCE && !!config.OKTA_KEY && !!config.OKTA_SECRET,
      },
    };
    res.status(200).send(payload);
  });

  router.get('/users', isSelfHostAdmin, async (_req, res) => {
    const users = await getAllNonDeletedUsers();
    res.send(users.map((u) => u.toJson()));
  });

  router.patch('/user', isSelfHostAdmin, async (req, res) => {
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

  router.post('/merge', isSelfHostAdmin, async (req, res) => {
    const payload = req.body as MergeUsersPayload;
    const worked = await mergeUsers(payload.main, payload.merged);
    if (!worked) {
      return res.status(403).send('Cannot merge users. Something went wrong');
    }
    res.status(200).send();
  });

  router.get('/stats', isSelfHostAdmin, async (_, res) => {
    const stats: AdminStats = {
      clients: io.engine.clientsCount,
    };
    res.status(200).send(stats);
  });

  return router;
}
