import * as core from '@actions/core';
import simpleGit from 'simple-git';

core.info(`Reading from ${process.env.GITHUB_WORKSPACE}`);

const git = simpleGit({
  baseDir: process.env.GITHUB_WORKSPACE,
});

export default git;
