/* eslint-disable @typescript-eslint/ban-ts-comment, no-restricted-syntax, no-await-in-loop */
import * as core from '@actions/core';
import simpleGit from 'simple-git';

const git = simpleGit();

type UnixIsoDate = {
  iso: string;
  unix: number;
};

type Commit = {
  hash: string;
  message: string;
  created: UnixIsoDate;
};

type Tag = {
  name: string;
  created: UnixIsoDate;
  commits: Commit[];
};

/**
 * Returns all Tags sorted by Creation Date
 */
async function getTags(): Promise<Tag[]> {
  const response: Tag[] = [];
  const tagTask = git.tags({
    '--format': '%(creatordate:iso) ? %(creatordate:unix) ? %(refname:short)',
  });
  const tags = await tagTask;
  tags.all.forEach((tag) => {
    const [tagCreatorDateIso, tagCreatorDateUnix, tagRefname] = tag.split(' ? ');
    response.push({
      name: tagRefname,
      created: {
        iso: tagCreatorDateIso,
        unix: Number.parseInt(tagCreatorDateUnix, 10),
      },
      commits: [],
    });
  });
  response.sort((a, b) => {
    if (a.created.unix < b.created.unix) return -1;
    if (a.created.unix > b.created.unix) return 1;
    return 0;
  });
  return response;
}

async function getCommitsBetweenTags(start: Tag, end: Tag): Promise<Commit[]> {
  const response: Commit[] = [];
  let commitTask;
  if (!start) {
    commitTask = git.log({
      to: end.name,
    });
  } else {
    commitTask = git.log({
      from: start.name,
      to: end.name,
    });
  }
  const commits = await commitTask;
  commits.all.forEach((commit) => {
    if (commit.message.startsWith('chore(release)') || commit.message === end.name) return;
    response.push({
      message: commit.message,
      hash: commit.hash,
      created: {
        iso: commit.date,
        unix: new Date(commit.date).getTime() / 1000,
      },
    });
  });
  response.sort((a, b) => {
    if (a.created.unix < b.created.unix) return -1;
    if (a.created.unix > b.created.unix) return 1;
    return 0;
  });
  return response;
}

(async function f() {
  const changelog: Tag[] = [];
  const tags = await getTags();
  core.info(`Found ${tags.length} Tags.`);
  for (const tag of tags) {
    const lastTag = tags[tags.indexOf(tag) - 1];
    tag.commits = await getCommitsBetweenTags(lastTag, tag);
    core.debug(`Found ${tag.commits.length} Commits for Tag ${tag.name}`);
    changelog.push(tag);
  }
  console.log(changelog);
  core.setOutput('jsonchangelog', JSON.stringify(changelog));
})();
