# Testing Slack

https://slack.dev/node-slack-sdk/tutorials/local-development

## Using ngrok

- Install ngrok: `brew install ngrok`
- Setup token: login to https://dashboard.ngrok.com/get-started/setup and run the `ngrok authtoken XXX` command
- Run ngrok and proxy to the locally running backend: `ngrok http 8081`
- On slack, update the URL: https://api.slack.com/apps/A01G1U9DP17/interactive-messages?
