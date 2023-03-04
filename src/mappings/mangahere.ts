import { MANGA } from '@consumet/extensions';
import stringsim from 'string-similarity';
import chalk from 'chalk';

const mangahere = async (title: string) => {
  const mangahere = new MANGA.MangaHere();
  console.log(`[+] Getting MangaHere mappings for ${chalk.cyan(title)}`);

  return await mangahere.search(title).then((resp: any) => {
      const bestMatch = stringsim.findBestMatch(
        title.toLowerCase(),
        resp.results.map((item: any) => (item.title as string).toLowerCase()),
      );

      return resp.results[bestMatch.bestMatchIndex].id;
    }).catch(() => {
      console.log(chalk.red(`[-] Failed to get mappings for ${title} on MangaHere`));
      return undefined;
    });
};

export default mangahere;