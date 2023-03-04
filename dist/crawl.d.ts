/**
 * @description Fetches all manga AniList ID's from AniList's sitemap
 * @returns Promise<string[]>
 */
export declare const getMangaIDs: () => Promise<any>;
/**
 * @description Crawls AniList's sitemap and fetches all manga mappings
 */
export declare const crawl: () => Promise<void>;
