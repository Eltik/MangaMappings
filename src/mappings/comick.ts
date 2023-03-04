import { MANGA } from '@consumet/extensions';
import stringsim from 'string-similarity';
import chalk from 'chalk';

const comick = async (title: string) => {
  const mangadex = new MANGA.ComicK();

  return await mangadex.search(title).then((resp: any) => {
      const bestMatch = stringsim.findBestMatch(
        title.toLowerCase(),
        resp.results.map((item: any) => (item.title as string).toLowerCase()),
      );

      return resp.results[bestMatch.bestMatchIndex].id;
    }).catch(() => {
      console.log(chalk.red(`[-] Failed to get mappings for ${title} on ComicK`));
      return undefined;
    });
};

export default comick;