const OpenAI = require('openai').default;

let client;

function getClient() {
  if (!client) {
    // GITHUB_MODELS_TOKEN if set, otherwise falls back to GITHUB_TOKEN
    client = new OpenAI({
      baseURL: 'https://models.inference.ai.azure.com',
      apiKey: process.env.GITHUB_MODELS_TOKEN || process.env.GITHUB_TOKEN,
    });
  }
  return client;
}

/**
 * Takes a raw Slack message and returns { title, body } for a GitHub issue.
 * Uses GitHub Models (gpt-4o-mini) — no extra API key needed beyond GITHUB_TOKEN.
 */
async function enhanceIssue(rawText, authorName) {
  const prompt = `You are a senior software engineer writing a GitHub issue.
A teammate (${authorName}) sent this message in Slack:

---
${rawText}
---

Your task:
1. Write a SHORT, specific issue title (≤ 72 chars, imperative mood, no period).
2. Write a technical issue body in GitHub Markdown with these sections:
   ## Problem
   (What is broken or missing — be precise)

   ## Steps to Reproduce / Context
   (Infer from the message; mark unknowns with "TBD")

   ## Expected Behavior
   (What should happen)

   ## Acceptance Criteria
   (Bullet checklist of what "done" looks like)

   ## Notes
   (Any extra context, edge cases, or links that seem relevant)

Keep the tone technical and concise. Do NOT invent facts not implied by the message.
Respond with JSON only:
{
  "title": "...",
  "body": "..."
}`;

  const response = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 1024,
  });

  return JSON.parse(response.choices[0].message.content);
}

module.exports = { enhanceIssue };
