import git from './Git';
import { Commit, Tag } from './types';

export default async function getCommitsBetweenTags(start: Tag, end: Tag): Promise<Commit[]> {
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
