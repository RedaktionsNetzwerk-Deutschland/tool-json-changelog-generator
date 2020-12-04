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
const Git_1 = require("./Git");
function getCommitsBetweenTags(start, end) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = [];
        let commitTask;
        if (!start) {
            commitTask = Git_1.default.log({
                to: end.name,
            });
        }
        else {
            commitTask = Git_1.default.log({
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
exports.default = getCommitsBetweenTags;
