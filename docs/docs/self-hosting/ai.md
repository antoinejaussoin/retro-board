---
sidebar_position: 5
---

# 🤖 AI

To enable AI capabilities (the Agile Coach, for instance), create an Anthropic API key. You can get one [here](https://platform.claude.com/settings/keys).

This is a paid service. You can find more information about pricing [here](https://www.anthropic.com/pricing).

## How to configure

Once you have your API key, add it to your `docker-compose.yml` file, under the backend section.

```yaml
ANTHROPIC_API_KEY: sk-ant-... # API key from https://platform.claude.com/settings/keys
ANTHROPIC_MODEL: claude-haiku-5-5 # Optional. This is the default when the variable is unset.
AI_FREE_LIMIT: 5 # Number of AI calls per rolling month, per user, for non-Pro accounts
AI_PAID_LIMIT: 1000 # Number of AI calls per rolling month, per user, for Pro accounts
```

`ANTHROPIC_MODEL` can be any Claude model id your account can call. The default, `claude-haiku-5-5`, is sent with thinking turned off, so the coach stays a plain text chat. `claude-sonnet-5-5` is sent with thinking limited to between tool calls instead, because that model rejects a fully disabled thinking setting.

If `AI_FREE_LIMIT` or `AI_PAID_LIMIT` is unset, the server still reads `OPEN_AI_FREE_LIMIT` and `OPEN_AI_PAID_LIMIT`.

## Retrospective summary

On an unencrypted board, a logged-in participant can press **Summarise with AI** on the summary page. The browser sends only the board id. The server loads that board, refuses encrypted and blurred boards, and asks the configured model for a short write-up. The write-up appears on the page and is included when the summary is copied as Markdown.
