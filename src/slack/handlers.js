const { enhanceIssue } = require('../ai/enhance');
const { createIssue } = require('../github/issues');

const AI_ENHANCE = process.env.AI_ENHANCE !== 'false';

/**
 * Strips the leading @bot mention token from the message text.
 * Slack sends mentions as "<@U12345>" at the start.
 */
function stripMention(text) {
  return text.replace(/^<@[A-Z0-9]+>\s*/i, '').trim();
}

/**
 * Registers all Slack event handlers on the given Bolt app instance.
 */
function registerHandlers(app) {
  // app_mention fires when the bot is @mentioned in any channel it's in
  app.event('app_mention', async ({ event, client, say }) => {
    const raw = stripMention(event.text);

    if (!raw) {
      await say({
        text: "Hey! Mention me with an issue description and I'll file it in GitHub. Example:\n`@me The login button crashes on iOS 17`",
        thread_ts: event.ts,
      });
      return;
    }

    // Acknowledge immediately so the user sees progress
    const ackMsg = await say({
      text: AI_ENHANCE
        ? ':hourglass_flowing_sand: Got it — enhancing with AI and filing the issue...'
        : ':hourglass_flowing_sand: Filing the issue...',
      thread_ts: event.ts,
    });

    try {
      // Resolve the Slack author's display name for the AI prompt
      let authorName = 'a teammate';
      try {
        const userInfo = await client.users.info({ user: event.user });
        authorName = userInfo.user?.real_name || userInfo.user?.name || authorName;
      } catch (_) {
        // non-fatal
      }

      let issueData;
      if (AI_ENHANCE) {
        issueData = await enhanceIssue(raw, authorName);
      } else {
        // Fallback: first line is title, rest is body
        const lines = raw.split('\n');
        issueData = {
          title: lines[0].slice(0, 255),
          body: lines.slice(1).join('\n').trim() || raw,
        };
      }

      const issue = await createIssue(issueData);

      await say({
        text:
          `:white_check_mark: Issue filed by ${authorName}!\n` +
          `*<${issue.html_url}|#${issue.number}: ${issue.title}>*\n` +
          (issue.assignees?.length
            ? `:bust_in_silhouette: Assigned to: ${issue.assignees.map((a) => a.login).join(', ')}`
            : ''),
        thread_ts: event.ts,
      });
    } catch (err) {
      console.error('Error creating issue:', err);
      await say({
        text: `:x: Failed to create the issue: \`${err.message}\``,
        thread_ts: event.ts,
      });
    }
  });
}

module.exports = { registerHandlers };
