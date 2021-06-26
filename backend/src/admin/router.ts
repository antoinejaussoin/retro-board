import express from 'express';
import { getAllPasswordUsers, updateUser, getUser } from '../db/actions/users';
import config from '../config';
import { AdminChangePasswordPayload } from '@retrospected/common';
import { getUserFromRequest, hashPassword } from '../utils';

const router = express.Router();

router.get('/email', (_, res) => {
  if (config.SELF_HOSTED_ADMIN) {
    res.status(200).send(config.SELF_HOSTED_ADMIN);
  } else {
    res.status(404).send('No admin email set.');
  }
});

router.get('/users', async (req, res) => {
  const authUser = await getUserFromRequest(req);
  if (!authUser || authUser.email !== config.SELF_HOSTED_ADMIN) {
    return res.status(403).send('You are not allowed to do this');
  }
  const users = await getAllPasswordUsers();
  res.send(users.map((u) => u.toJson()));
});

router.patch('/user', async (req, res) => {
  const authUser = await getUserFromRequest(req);
  if (!authUser || authUser.email !== config.SELF_HOSTED_ADMIN) {
    return res.status(403).send('You are not allowed to do this');
  }
  const payload = req.body as AdminChangePasswordPayload;
  const user = await getUser(payload.userId);
  if (user) {
    const hashedPassword = await hashPassword(payload.password);
    const updatedUser = await updateUser(user.id, {
      password: hashedPassword,
    });
    if (updatedUser) {
      return res.status(200).send(updatedUser.toJson());
    }
  }
  res.status(403).send('Cannot update users password');
});

export default router;
