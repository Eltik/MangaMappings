import { MANGA } from '@consumet/extensions';
import stringsim from 'string-similarity';
import chalk from 'chalk';

const mangadex = async (title: string) => {
  const mangadex = new MANGA.MangaDex();
  console.log(`[+] Getting MangaDex mappings for ${chalk.cyan(title)}`);

  return await mangadex.search(title).then((resp: any) => {
      const bestMatch = stringsim.findBestMatch(
        title.toLowerCase(),
        resp.results.map((item: any) => (item.title as string).toLowerCase()),
      );

      return resp.results[bestMatch.bestMatchIndex].id;
    }).catch(() => {
      console.log(chalk.red(`[-] Failed to get mappings for ${title} on MangaDex`));
      return undefined;
    });
};

export default mangadex;