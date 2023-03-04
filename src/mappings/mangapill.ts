import { MANGA } from '@consumet/extensions';
import stringsim from 'string-similarity';
import chalk from 'chalk';

const mangapill = async (title: string) => {
  const mangapill = new MANGA.MangaPill();
  console.log(`[+] Getting MangaPill mappings for ${chalk.cyan(title)}`);

  return await mangapill.search(title).then((resp: any) => {
      const bestMatch = stringsim.findBestMatch(
        title.toLowerCase(),
        resp.results.map((item: any) => (item.title as string).toLowerCase()),
      );

      return resp.results[bestMatch.bestMatchIndex].id;
    }).catch(() => {
      console.log(chalk.red(`[-] Failed to get mappings for ${title} on MangaPill`));
      return undefined;
    });
};

export default mangapill;