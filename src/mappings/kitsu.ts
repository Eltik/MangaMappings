import axios from 'axios';
import chalk from 'chalk';
import * as stringsim from 'string-similarity';

const kitsu = async (title: string) => {
  try {
    console.log(`[+] Getting Kitsu mappings for ${chalk.cyan(title)}`);
    const { data: kData } = await axios.get(
      `https://kitsu.io/api/edge/manga?filter[text]=${title}`,
    );
    const bestMatch = stringsim.findBestMatch(
      String(title),
      kData.data.map(
        (d: any) => d.attributes.titles.en_jp ?? d.attributes.titles.en ?? '',
      ),
    );
    return kData.data[bestMatch.bestMatchIndex];
  } catch (error) {
    console.log(chalk.red(`[-] Failed to get mappings for ${title} on Kitsu`));
    return undefined;
  }
};

export default kitsu;
