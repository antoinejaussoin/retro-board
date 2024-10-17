import express, { type Router } from 'express';
import fetch from 'node-fetch';
import { createSessionFromSlack } from '../db/actions/sessions.js';
import config from '../config.js';

type SlackSlashCommand = {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  api_app_id: string;
  is_entreprise_install: string;
  response_url: string;
  trigger_id: string;
};

export default function slackRouter(): Router {
  const router = express.Router();

  router.post('/create', async (req, res) => {
    const msg: SlackSlashCommand = req.body;
    const session = await createSessionFromSlack(msg.user_id, msg.text);
    try {
      if (session) {
        await sendToSlack(
          msg.response_url,
          `All done! You can start retrospecting here: ${config.BASE_URL}/game/${session.id}`,
        );
      } else {
        await sendToSlack(
          msg.response_url,
          'Unfortunately, we could not identify you on Retrospected. Try logging in with your Slack account at least once on Retrospected, so we can link your Retrospected account with your Slack account.',
        );
      }
    } catch (err) {
      console.error(err);
    }

    return res.status(200).send();
  });

  async function sendToSlack(url: string, message: string) {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        response_type: 'in_channel',
        text: message,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.text();
    console.log('response: ', result);
  }

  return router;
}
