export type UnixIsoDate = {
  iso: string;
  unix: number;
};

export type Commit = {
  hash: string;
  message: string;
  created: UnixIsoDate;
};

export type Tag = {
  name: string;
  created: UnixIsoDate;
  commits: Commit[];
};

export type ChangelogServicePayload = {
  changelog: Tag[];
  version: string;
  title: string;
};
