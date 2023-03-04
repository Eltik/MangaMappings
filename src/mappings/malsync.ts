import axios from 'axios';
import chalk from 'chalk';
const Malsync = async (malId: number) => {
  try {
    console.log(chalk.yellow`[!] Getting Mappings for ${malId} via Malsync`);

    const { data } = await axios.get(
      `https://api.malsync.moe/mal/manga/${malId}`,
    );
    console.log(chalk.green`[+] Got Mappings for ${malId} via Malsync`);
    return data.Sites;
  } catch (error) {
    console.log(
      chalk.red('Failed to get mappings for ') +
        chalk.redBright('MalSync ') +
        chalk.red(`for ID ${malId}`),
    );
    return null;
  }
};

export default Malsync;