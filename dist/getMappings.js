"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearDatabase = exports.exportDatabase = exports.getMappings = exports.search = exports.init = void 0;
const client_1 = require("./db/client");
const axios_1 = __importDefault(require("axios"));
const mappings_1 = require("./mappings");
const chalk_1 = __importDefault(require("chalk"));
const client_2 = require("@prisma/client");
const path_1 = require("path");
const fs_1 = require("fs");
const init = async () => {
    await client_1.prisma.$executeRaw `
      CREATE EXTENSION IF NOT EXISTS "pg_trgm";
  `;
    await client_1.prisma.$executeRaw `
      create or replace function most_similar(text, text[]) returns double precision
      language sql as $$
          select max(similarity($1,x)) from unnest($2) f(x)
      $$;
  `;
    await client_1.prisma.$connect();
    return;
};
exports.init = init;
const search = async (query, page, perPage) => {
    if (!page || page <= 0)
        page = 1;
    if (!perPage || perPage <= 0)
        perPage = 20;
    perPage = Math.min(100, perPage);
    const skip = page > 0 ? perPage * (page - 1) : 0;
    const where = client_2.Prisma.sql `
  WHERE
  (
      ${"%" + query + "%"}        ILIKE ANY("Manga".synonyms)
      OR  ${"%" + query + "%"}    % ANY("Manga".synonyms)
      OR  "Manga".titles->>'english' ILIKE ${"%" + query + "%"}
      OR  "Manga".titles->>'romaji'  ILIKE ${"%" + query + "%"}
      OR  "Manga".titles->>'native'  ILIKE ${"%" + query + "%"}
  )
  `;
    const [count, results] = await client_1.prisma.$transaction([
        client_1.prisma.$queryRaw `
              SELECT COUNT(*) FROM "Manga"
              ${where}
          `,
        client_1.prisma.$queryRaw `
              SELECT * FROM "Manga"
              ${where}
              ORDER BY
                  (CASE WHEN "Manga".title->>'english' IS NOT NULL THEN similarity(LOWER("Manga".title->>'english'), LOWER(${query})) ELSE 0 END,
                  + CASE WHEN "Manga".title->>'romaji' IS NOT NULL THEN similarity(LOWER("Manga".title->>'romaji'), LOWER(${query})) ELSE 0 END,
                  + CASE WHEN "Manga".title->>'native' IS NOT NULL THEN similarity(LOWER("Manga".title->>'native'), LOWER(${query})) ELSE 0 END,
                  + CASE WHEN synonyms IS NOT NULL THEN most_similar(LOWER(${query}), synonyms) ELSE 0 END)
                      DESC
              LIMIT    ${perPage}
              OFFSET   ${skip}
          `,
    ]);
    return results;
};
exports.search = search;
const getMappings = async (anilistId) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (await client_1.prisma.manga.findUnique({ where: { anilistId: Number(anilistId) } })) {
        return await client_1.prisma.manga.findFirst({
            where: { anilistId: Number(anilistId) },
        });
    }
    try {
        const { data } = await axios_1.default.post('https://graphql.anilist.co/', {
            query: `{
  Media(id:${anilistId}) {
    id
    idMal
    format
    startDate{
			year
    }
    title {
      romaji
      english
      native
      userPreferred
    }
    
  }
}`,
        });
        const manga = data.data.Media;
        const aniId = Number(manga.id);
        const malsync = await (0, mappings_1.Malsync)(manga.idMal);
        await client_1.prisma.manga
            .create({
            data: {
                anilistId: aniId,
                title: (_b = (_a = manga.title.english) !== null && _a !== void 0 ? _a : manga.title.romaji) !== null && _b !== void 0 ? _b : manga.title.native,
                titles: manga.title,
                synonyms: (_c = manga.synonyms) !== null && _c !== void 0 ? _c : [],
                malId: manga.idMal,
                mangadexId: manga.idMal !== undefined && malsync && malsync.MangaDex
                    ? Object.values(malsync.MangaDex)[0].identifier
                    : await (0, mappings_1.mangadex)((_d = manga.title.english) !== null && _d !== void 0 ? _d : manga.title.romaji),
                mangaseeId: manga.idMal !== undefined && malsync && malsync.MangaSee ? Object.values(malsync.MangaSee)[0].identifier : undefined,
                mangafoxId: manga.idMal !== undefined && malsync && malsync.MangaFox ? Object.values(malsync.MangaFox)[0].identifier : undefined,
                manganatoId: manga.idMal !== undefined && malsync && malsync.MangaNato ? Object.values(malsync.MangaNato)[0].identifier : undefined,
                mangaplusId: manga.idMal !== undefined && malsync && malsync.MangaPlus ? Object.values(malsync.MangaPlus)[0].identifier : undefined,
                mangareaderId: manga.idMal !== undefined && malsync && malsync.MangaReader ? Object.values(malsync.MangaReader)[0].identifier : undefined,
                comickId: manga.idMal !== undefined && malsync && malsync.Comick ?
                    Object.values(malsync.Comick)[0].url.split('https://comick.app')[1] :
                    await (0, mappings_1.comick)((_e = manga.title.english) !== null && _e !== void 0 ? _e : manga.title.romaji),
                anilist: manga,
                mangapillId: await (0, mappings_1.mangapill)((_f = manga.title.english) !== null && _f !== void 0 ? _f : manga.title.romaji),
                kitsu: await (0, mappings_1.kitsu)((_g = manga.title.romaji) !== null && _g !== void 0 ? _g : manga.title.english),
                mangahereId: await (0, mappings_1.mangahere)((_h = manga.title.english) !== null && _h !== void 0 ? _h : manga.title.romaji)
            },
        })
            .then(() => {
            var _a;
            console.log(chalk_1.default.green `[+] Mappings for ${(_a = manga.title.romaji) !== null && _a !== void 0 ? _a : manga.title.english} have been added`);
        });
        return await client_1.prisma.manga.findUnique({ where: { anilistId: aniId } });
    }
    catch (error) {
        console.error(error.message);
        if (error.message === 'Media not found') {
            return {
                message: 'An error occurred while processing your request. Please make sure this is a valid AniList ID',
                error: error.message,
            };
        }
        console.log(error);
        return {
            message: 'An error occurred while processing your request. Please make sure this is a valid AniList ID',
        };
    }
};
exports.getMappings = getMappings;
const exportDatabase = async () => {
    let data = [];
    const dateAsString = new Date(Date.now()).toISOString().replace(/:/g, "-");
    const toExport = (0, path_1.join)(__dirname, "../../" + dateAsString + "-export.json");
    const manga = await client_1.prisma.manga.findMany();
    data = {
        manga
    };
    (0, fs_1.writeFileSync)(toExport, JSON.stringify(data, null, 4), "utf8");
    console.log(chalk_1.default.whiteBright("Exported database to ") + chalk_1.default.blueBright(toExport) + chalk_1.default.white("."));
};
exports.exportDatabase = exportDatabase;
const clearDatabase = async () => {
    await client_1.prisma.manga.deleteMany();
    console.log(chalk_1.default.whiteBright("Cleared database."));
};
exports.clearDatabase = clearDatabase;
//# sourceMappingURL=getMappings.js.map