import axios from "axios";
import { getMappings } from "./getMappings";
import chalk from "chalk";

/**
 * @description Fetches all manga AniList ID's from AniList's sitemap
 * @returns Promise<string[]>
 */
 export const getMangaIDs = async () => {
    const req1 = await axios.get("https://anilist.co/sitemap/manga-0.xml");
    const data1 = req1.data;
    const req2 = await axios.get("https://anilist.co/sitemap/manga-1.xml");
    const data2 = req2.data;

    const ids1 = data1.match(/manga\/([0-9]+)/g).map((id:string) => {
        return id.replace("manga/", "");
    });

    const ids2 = data2.match(/manga\/([0-9]+)/g).map((id:string) => {
        return id.replace("manga/", "");
    });
    return ids1.concat(ids2);
}

/**
 * @description Crawls AniList's sitemap and fetches all manga mappings
 */
export const crawl = async() => {
    const ids = await getMangaIDs();
    for (const id of ids) {
        await getMappings(Number(id)).catch((err) => {
            console.log(chalk.redBright("Unable to fetch mappings for ID: ") + chalk.cyanBright(id) + chalk.redBright("."));
        });
    }
}