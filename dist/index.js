"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/ban-ts-comment, no-restricted-syntax, no-await-in-loop */
const core = require("@actions/core");
const simple_git_1 = require("simple-git");
const git = simple_git_1.default({
    baseDir: '/Users/tom/PhpstormProjects/cop-admin-interface/',
});
/**
 * Returns all Tags sorted by Creation Date
 */
function getTags() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = [];
        const tagTask = git.tags({
            '--format': '%(creatordate:iso) ? %(creatordate:unix) ? %(refname:short)',
        });
        const tags = yield tagTask;
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
            if (a.created.unix < b.created.unix)
                return -1;
            if (a.created.unix > b.created.unix)
                return 1;
            return 0;
        });
        return response;
    });
}
function getCommitsBetweenTags(start, end) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = [];
        let commitTask;
        if (!start) {
            commitTask = git.log({
                to: end.name,
            });
        }
        else {
            commitTask = git.log({
                from: start.name,
                to: end.name,
            });
        }
        const commits = yield commitTask;
        commits.all.forEach((commit) => {
            if (commit.message.startsWith('chore(release)') || commit.message === end.name)
                return;
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
            if (a.created.unix < b.created.unix)
                return -1;
            if (a.created.unix > b.created.unix)
                return 1;
            return 0;
        });
        return response;
    });
}
(function f() {
    return __awaiter(this, void 0, void 0, function* () {
        const changelog = [];
        const tags = yield getTags();
        for (const tag of tags) {
            const lastTag = tags[tags.indexOf(tag) - 1];
            tag.commits = yield getCommitsBetweenTags(lastTag, tag);
            changelog.push(tag);
        }
        core.setOutput('jsonchangelog', JSON.stringify(changelog));
    });
})();
