"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@actions/core");
const simple_git_1 = require("simple-git");
core.info(`Reading from ${process.env.GITHUB_WORKSPACE}`);
const git = simple_git_1.default({
    baseDir: process.env.GITHUB_WORKSPACE,
});
exports.default = git;
