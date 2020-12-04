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
/**
 * Returns all Tags sorted by Creation Date
 */
function getTags() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = [];
        const tagTask = Git_1.default.tags({
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
exports.default = getTags;
