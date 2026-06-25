# gh-issues-slack-bot

![Node](https://img.shields.io/badge/Node.js-22-green)
![License](https://img.shields.io/badge/license-AGPL%203.0-blue)
![Docker](https://img.shields.io/badge/docker-supported-blue)
![Platform](https://img.shields.io/badge/platform-self--hosted-lightgrey)

Slack bot that turns @mentions into GitHub issues. Mention the bot with a description, and it files a structured issue using GitHub Models AI — no extra API keys beyond the GitHub PAT you already need.

## How it works

1. User @mentions the bot in any channel it's in
2. The bot sends the message to GitHub Models (`gpt-4o-mini`)
3. AI expands it into a structured issue (Problem / Repro / Expected / Acceptance Criteria / Notes)
4. Issue is created in GitHub and the bot replies in-thread with the link

## Requirements

- Node.js 22+ (or Docker)
- A Slack app with Socket Mode enabled
- A GitHub fine-grained PAT scoped to the target repo

## Setup

### 1. Create the Slack app

Go to [api.slack.com/apps](https://api.slack.com/apps) → Create App → From Scratch.

**OAuth & Permissions** → Bot Token Scopes:
- `app_mentions:read`
- `chat:write`
- `users:read`

**Event Subscriptions** → Enable → Bot Events → `app_mention`

**Socket Mode** → Enable → Create App-Level Token with `connections:write` scope

Install the app to your workspace.

### 2. Create a GitHub PAT

[github.com/settings/tokens](https://github.com/settings/tokens) → Fine-grained tokens → Generate new token

| Setting | Value |
|---|---|
| Repository access | Only select repositories → your target repo |
| Repository permissions | Issues → Read and Write |
| Account permissions | Models → Read-only |

### 3. Configure environment

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `SLACK_BOT_TOKEN` | Bot User OAuth Token (`xoxb-...`) |
| `SLACK_APP_TOKEN` | App-Level Token for Socket Mode (`xapp-...`) |
| `SLACK_SIGNING_SECRET` | From Basic Information page |
| `GITHUB_TOKEN` | Fine-grained PAT |
| `GITHUB_OWNER` | GitHub org or username |
| `GITHUB_REPO` | Repository name |
| `GITHUB_DEFAULT_ASSIGNEE` | (optional) GitHub username to auto-assign |
| `GITHUB_DEFAULT_LABELS` | (optional) Comma-separated labels, e.g. `bug,needs-triage` |
| `AI_ENHANCE` | Set to `false` to skip AI and file issues verbatim |

### 4. Run

```bash
npm install
npm start
```

Or with Docker:

```bash
docker compose up -d
```

Then invite the bot to a channel: `/invite @<botname>`

## Usage

```
@gh-issues-bot Login button crashes on iOS 17 when using SSO
```

The bot replies in-thread with the filed issue link.

## License

AGPL 3.0. See [LICENSE](LICENSE).
