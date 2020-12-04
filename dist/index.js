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
/* eslint-disable no-restricted-syntax, no-await-in-loop */
const core = require("@actions/core");
const axios_1 = require("axios");
const CommitsBetweenTags_1 = require("./CommitsBetweenTags");
const GetTags_1 = require("./GetTags");
const Git_1 = require("./Git");
const { env } = process;
if (!env.CHANGELOG_SERVICE_URL || !env.CHANGELOG_SYSTEM_ID || !env.GITHUB_WORKSPACE) {
    core.error('Missing Environment Variables.');
    core.error(`CHANGELOG_SERVICE_URL is ${process.env.CHANGELOG_SERVICE_URL}`);
    core.error(`CHANGELOG_SYSTEM_ID is ${process.env.CHANGELOG_SYSTEM_ID}`);
    core.error(`GITHUB_WORKSPACE is ${process.env.GITHUB_WORKSPACE}`);
    process.exit(process.env.BAIL ? 1 : 0);
}
(function f() {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        core.info('Pulling git history');
        yield Git_1.default.raw('pull', '--tags');
        core.info('History pulled');
        const changelog = [];
        const tags = yield GetTags_1.default();
        core.info(`Found ${tags.length} Tags.`);
        for (const tag of tags) {
            const lastTag = tags[tags.indexOf(tag) - 1];
            tag.commits = yield CommitsBetweenTags_1.default(lastTag, tag);
            changelog.push(tag);
        }
        const response = {
            changelog,
            version: ((_a = tags.pop()) === null || _a === void 0 ? void 0 : _a.name) || '',
            title: ((_c = (_b = tags.pop()) === null || _b === void 0 ? void 0 : _b.commits.pop()) === null || _c === void 0 ? void 0 : _c.message) || '',
        };
        try {
            yield axios_1.default({
                baseURL: env.CHANGELOG_SERVICE_URL,
                url: `/changelog/systems/${env.CHANGELOG_SYSTEM_ID}`,
                data: response,
                method: 'POST',
            });
            core.setOutput('jsonchangelog', JSON.stringify(changelog));
        }
        catch (e) {
            core.error(e);
            process.exit(process.env.BAIL ? 1 : 0);
        }
    });
})();
