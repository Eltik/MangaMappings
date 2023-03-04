"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const extensions_1 = require("@consumet/extensions");
const string_similarity_1 = __importDefault(require("string-similarity"));
const chalk_1 = __importDefault(require("chalk"));
const mangadex = async (title) => {
    const mangadex = new extensions_1.MANGA.MangaDex();
    console.log(`[+] Getting MangaDex mappings for ${chalk_1.default.cyan(title)}`);
    return await mangadex.search(title).then((resp) => {
        const bestMatch = string_similarity_1.default.findBestMatch(title.toLowerCase(), resp.results.map((item) => item.title.toLowerCase()));
        return resp.results[bestMatch.bestMatchIndex].id;
    }).catch(() => {
        console.log(chalk_1.default.red(`[-] Failed to get mappings for ${title} on MangaDex`));
        return undefined;
    });
};
exports.default = mangadex;
//# sourceMappingURL=mangadex.js.map