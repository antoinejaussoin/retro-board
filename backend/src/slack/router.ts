import express, { Router } from 'express';
import fetch from 'node-fetch';
import shortid from 'shortid';

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
    console.log('Request: ', msg);
    try {
      const response = await fetch(msg.response_url, {
        method: 'POST',
        body: JSON.stringify({
          response_type: 'in_channel',
          text: `Hey great! let's create a new retrospective: https://localhost:3000/game/${shortid()}`,
        }),
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.text();
      console.log('response: ', result);
    } catch (err) {
      console.error(err);
    }

    return res.status(200).send();
  });

  router.post('/shortcut', async (req, res) => {
    const msg: SlackSlashCommand = req.body;
    console.log('Request: ', msg);
    // try {
    //   const response = await fetch(msg.response_url, {
    //     method: 'POST',
    //     body: JSON.stringify({
    //       response_type: 'in_channel',
    //       text: `Hey great! let's create a new retrospective: https://localhost:3000/game/${shortid()}`,
    //     }),
    //     headers: { 'Content-Type': 'application/json' },
    //   });
    //   const result = await response.text();
    //   console.log('response: ', result);
    // } catch (err) {
    //   console.error(err);
    // }

    return res.status(200).send();
  });

  return router;
}
