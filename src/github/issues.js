const { Octokit } = require('@octokit/rest');

let octokit;

function getOctokit() {
  if (!octokit) {
    octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  }
  return octokit;
}

/**
 * Creates a GitHub issue and returns the issue object.
 * @param {{ title: string, body: string }} issueData
 * @param {string} [assignee] - GitHub username to assign (overrides env default)
 */
async function createIssue({ title, body }, assignee) {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;

  if (!owner || !repo) {
    throw new Error('GITHUB_OWNER and GITHUB_REPO must be set in .env');
  }

  const assignees = [];
  const resolved = assignee || process.env.GITHUB_DEFAULT_ASSIGNEE;
  if (resolved) assignees.push(resolved);

  const labels = process.env.GITHUB_DEFAULT_LABELS
    ? process.env.GITHUB_DEFAULT_LABELS.split(',').map((l) => l.trim()).filter(Boolean)
    : [];

  const { data } = await getOctokit().issues.create({
    owner,
    repo,
    title,
    body,
    assignees: assignees.length ? assignees : undefined,
    labels: labels.length ? labels : undefined,
  });

  return data;
}

module.exports = { createIssue };
