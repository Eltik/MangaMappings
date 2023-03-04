"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawl = exports.getMangaIDs = void 0;
const axios_1 = __importDefault(require("axios"));
const getMappings_1 = require("./getMappings");
const chalk_1 = __importDefault(require("chalk"));
/**
 * @description Fetches all manga AniList ID's from AniList's sitemap
 * @returns Promise<string[]>
 */
const getMangaIDs = async () => {
    const req1 = await axios_1.default.get("https://anilist.co/sitemap/manga-0.xml");
    const data1 = req1.data;
    const req2 = await axios_1.default.get("https://anilist.co/sitemap/manga-1.xml");
    const data2 = req2.data;
    const ids1 = data1.match(/manga\/([0-9]+)/g).map((id) => {
        return id.replace("manga/", "");
    });
    const ids2 = data2.match(/manga\/([0-9]+)/g).map((id) => {
        return id.replace("manga/", "");
    });
    return ids1.concat(ids2);
};
exports.getMangaIDs = getMangaIDs;
/**
 * @description Crawls AniList's sitemap and fetches all manga mappings
 */
const crawl = async () => {
    const ids = await (0, exports.getMangaIDs)();
    for (const id of ids) {
        await (0, getMappings_1.getMappings)(Number(id)).catch((err) => {
            console.log(chalk_1.default.redBright("Unable to fetch mappings for ID: ") + chalk_1.default.cyanBright(id) + chalk_1.default.redBright("."));
        });
    }
};
exports.crawl = crawl;
//# sourceMappingURL=crawl.js.map