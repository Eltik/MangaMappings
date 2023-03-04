import { prisma } from './db/client';
import axios from 'axios';
import { ITitle } from '@consumet/extensions/dist/models';

import {
  kitsu,
  mangadex,
  mangahere,
  mangapill,
  comick,
  Malsync,
} from './mappings';
import chalk from 'chalk';
import { Prisma } from '@prisma/client';

export const init = async () => {
  await prisma.$executeRaw`
      CREATE EXTENSION IF NOT EXISTS "pg_trgm";
  `;
  await prisma.$executeRaw`
      create or replace function most_similar(text, text[]) returns double precision
      language sql as $$
          select max(similarity($1,x)) from unnest($2) f(x)
      $$;
  `;
  await prisma.$connect();
  return;
};

export const search = async(query:string, page?:number, perPage?:number) => {
  if (!page || page <= 0) page = 1;
  if (!perPage || perPage <= 0) perPage = 20;
  perPage = Math.min(100, perPage);

  const skip = page > 0 ? perPage * (page - 1) : 0;

  const where = Prisma.sql`
  WHERE
  (
      ${"%" + query + "%"}        ILIKE ANY("Manga".synonyms)
      OR  ${"%" + query + "%"}    % ANY("Manga".synonyms)
      OR  "Manga".titles->>'english' ILIKE ${"%" + query + "%"}
      OR  "Manga".titles->>'romaji'  ILIKE ${"%" + query + "%"}
      OR  "Manga".titles->>'native'  ILIKE ${"%" + query + "%"}
  )
  `;

  const [count, results] = await prisma.$transaction([
      prisma.$queryRaw`
              SELECT COUNT(*) FROM "Manga"
              ${where}
          `,
      prisma.$queryRaw`
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
}

export const getMappings = async (anilistId: number) => {
  if (
    await prisma.manga.findUnique({ where: { anilistId: Number(anilistId) } })
  ) {
    return await prisma.manga.findFirst({
      where: { anilistId: Number(anilistId) },
    });
  }
  try {
    const { data } = await axios.post('https://graphql.anilist.co/', {
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
    const malsync = await Malsync(manga.idMal as number);
    await prisma.manga
      .create({
        data: {
          anilistId: aniId,
          title:
            manga.title.english ?? manga.title.romaji ?? manga.title.native,
          titles: manga.title,
          synonyms: manga.synonyms ?? [],
          malId: manga.idMal,
          mangadexId:
            manga.idMal !== undefined && malsync && malsync.MangaDex
              ? (Object.values(malsync.MangaDex)[0] as any).identifier
              : await mangadex(
                  ((manga.title as ITitle).english as string) ??
                    (manga.title as ITitle).romaji,
                ),
          mangaseeId:
            manga.idMal !== undefined && malsync && malsync.MangaSee ? (Object.values(malsync.MangaSee)[0] as any).identifier : undefined,
          mangafoxId:
            manga.idMal !== undefined && malsync && malsync.MangaFox ? (Object.values(malsync.MangaFox)[0] as any).identifier : undefined,
          manganatoId:
            manga.idMal !== undefined && malsync && malsync.MangaNato ? (Object.values(malsync.MangaNato)[0] as any).identifier : undefined,
          mangaplusId:
            manga.idMal !== undefined && malsync && malsync.MangaPlus ? (Object.values(malsync.MangaPlus)[0] as any).identifier : undefined,
          mangareaderId:
            manga.idMal !== undefined && malsync && malsync.MangaReader ? (Object.values(malsync.Mangareader)[0] as any).identifier : undefined,
          comickId:
            manga.idMal !== undefined && malsync && malsync.Comick ?
            (Object.values(malsync.Comick)[0] as any).url.split('https://comick.app')[1] :
            await comick(((manga.title as ITitle).english as string) ?? (manga.title as ITitle).romaji),
          anilist: manga,
          mangapillId: await mangapill(((manga.title as ITitle).english as string) ?? (manga.title as ITitle).romaji),
          kitsu: await kitsu(
            ((manga.title as ITitle).romaji as string) ??
              (manga.title as ITitle).english,
          ),
          mangahereId: await mangahere(((manga.title as ITitle).english as string) ?? (manga.title as ITitle).romaji)
        },
      })
      .then(() => {
        console.log(
          chalk.green`[+] Mappings for ${
            ((manga.title as ITitle).romaji as string) ??
            (manga.title as ITitle).english
          } have been added`,
        );
      });
    return await prisma.manga.findUnique({ where: { anilistId: aniId } });
  } catch (error: any) {
    console.error(error.message);
    if (error.message === 'Media not found') {
      return {
        message:
          'An error occurred while processing your request. Please make sure this is a valid AniList ID',
        error: error.message,
      };
    }
    console.log(error);
    return {
      message:
        'An error occurred while processing your request. Please make sure this is a valid AniList ID',
    };
  }
};

//(async() => {
//	await prisma.anime.deleteMany()
//	await getMappings(21)
//	console.log(await getMappings(21))

//})()
