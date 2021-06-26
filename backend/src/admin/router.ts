import express from 'express';
import config from '../config';

const router = express.Router();

router.get('/email', (_, res) => {
  if (config.SELF_HOSTED_ADMIN) {
    res.status(200).send(config.SELF_HOSTED_ADMIN);
  } else {
    res.status(404).send('No admin email set.');
  }
});

export default router;
