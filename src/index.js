require('dotenv').config();

const { App } = require('@slack/bolt');
const { registerHandlers } = require('./slack/handlers');

const required = ['SLACK_BOT_TOKEN', 'SLACK_APP_TOKEN', 'SLACK_SIGNING_SECRET', 'GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  console.error('Copy .env.example to .env and fill in the values.');
  process.exit(1);
}

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,              // Socket Mode — no public URL needed
  appToken: process.env.SLACK_APP_TOKEN,
});

registerHandlers(app);

(async () => {
  await app.start();
  console.log(`gh-issues-slack-bot running (Socket Mode)`);
  console.log(`Repo: ${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}`);
  console.log(`AI enhancement: ${process.env.AI_ENHANCE !== 'false' && process.env.ANTHROPIC_API_KEY ? 'on' : 'off'}`);
})();
