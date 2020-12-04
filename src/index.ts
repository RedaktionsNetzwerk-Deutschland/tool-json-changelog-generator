/* eslint-disable no-restricted-syntax, no-await-in-loop */
import * as core from '@actions/core';
import axios from 'axios';
import getCommitsBetweenTags from './CommitsBetweenTags';
import getTags from './GetTags';
import git from './Git';
import { ChangelogServicePayload, Tag } from './types';

const { env } = process;

if (!env.CHANGELOG_SERVICE_URL || !env.CHANGELOG_SYSTEM_ID || !env.GITHUB_WORKSPACE) {
  core.error('Missing Environment Variables.');
  core.error(`CHANGELOG_SERVICE_URL is ${process.env.CHANGELOG_SERVICE_URL}`);
  core.error(`CHANGELOG_SYSTEM_ID is ${process.env.CHANGELOG_SYSTEM_ID}`);
  core.error(`GITHUB_WORKSPACE is ${process.env.GITHUB_WORKSPACE}`);
  process.exit(process.env.BAIL ? 1 : 0);
}

(async function f() {
  core.info('Pulling git history');
  await git.raw('pull', '--tags');
  core.info('History pulled');
  const changelog: Tag[] = [];
  const tags = await getTags();
  core.info(`Found ${tags.length} Tags.`);
  for (const tag of tags) {
    const lastTag = tags[tags.indexOf(tag) - 1];
    tag.commits = await getCommitsBetweenTags(lastTag, tag);
    changelog.push(tag);
  }
  const response: ChangelogServicePayload = {
    changelog,
    version: tags.pop()?.name || 'unknown',
    title: tags.pop()?.commits.pop()?.message || 'unknown',
  };
  try {
    await axios({
      baseURL: env.CHANGELOG_SERVICE_URL,
      url: `/changelog/systems/${env.CHANGELOG_SYSTEM_ID}`,
      data: response,
      method: 'POST',
    });
    core.setOutput('jsonchangelog', JSON.stringify(changelog));
  } catch (e) {
    core.error(e);
    process.exit(process.env.BAIL ? 1 : 0);
  }
})();
