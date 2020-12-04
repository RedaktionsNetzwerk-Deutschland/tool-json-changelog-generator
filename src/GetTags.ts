import git from './Git';
import { Tag } from './types';

/**
 * Returns all Tags sorted by Creation Date
 */
export default async function getTags(): Promise<Tag[]> {
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
