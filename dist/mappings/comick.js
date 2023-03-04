"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const extensions_1 = require("@consumet/extensions");
const string_similarity_1 = __importDefault(require("string-similarity"));
const chalk_1 = __importDefault(require("chalk"));
const comick = async (title) => {
    const mangadex = new extensions_1.MANGA.ComicK();
    return await mangadex.search(title).then((resp) => {
        const bestMatch = string_similarity_1.default.findBestMatch(title.toLowerCase(), resp.results.map((item) => item.title.toLowerCase()));
        return resp.results[bestMatch.bestMatchIndex].id;
    }).catch(() => {
        console.log(chalk_1.default.red(`[-] Failed to get mappings for ${title} on ComicK`));
        return undefined;
    });
};
exports.default = comick;
//# sourceMappingURL=comick.js.map