import { prisma } from './db/client';
import { getMappings, init, search } from './getMappings';
import fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import { META } from '@consumet/extensions';
import chalk from 'chalk';

(async () => {
  const app = fastify({ logger: false });

  app.register(fastifyCors);

  app.get('/', async () => {
    return {
      message: 'Welcome to the MangaMappings API!',
      routes: {
        '/': 'This page',
        '/anilist/:anilistId': 'Get the Mappings for the given AniList ID',
        '/mal/:malId': 'Get the Mappings for the given Mal ID',
        '/trending':
          'an example integration with a popular manga library consumet - https://github.com/consumet/consumet.ts',
        '/popular': 'another example integration with consumet',
      },
    };
  });

  app.get('/anilist/:id', async (req, res) => {
    const id: number = (req.params as { id: number }).id;
    if (isNaN(id)) {
      return res.status(400).send({
        message: 'Please provide a valid AniList ID',
      });
    }
    try {
      res.send(await getMappings(id));
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        message: 'An error occurred while processing your request',
      });
    }
  });

  app.get('/mal/:id', async (req, res) => {
    const id: number = (req.params as { id: number }).id;
    if (!id) {
      res.status(400);
      return res.send({ message: 'Provide a MAL id' });
    }
    try {
      const data = await prisma.manga.findUnique({
        where: {
          malId: Number(id),
        },
      });

      return data
        ? res.send(data)
        : res.status(404).send({
            message: 'Sorry, Couldnt find the MAL id in the database',
          });
    } catch (error) {
      console.log(error);
    }
  });

  app.get('/info/:id', async (req, res) => {
    const id: number = (req.params as { id: number }).id;

    try {
      const anilist = new META.Anilist.Manga();
      const info = await anilist.fetchMangaInfo(String(id));
      const mappings = await getMappings(id);
      info.mappings && delete info.mappings;
      res.status(200).send({
        ...info,
        mappings: mappings,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .send(
          'Ran into an error trying to request that info. Please try again later',
        );
    }
  });

  app.get('/search/:query', async (req, res) => {
    const query: string = (req.params as { query: string }).query;
    // console.log(`searching ${query}`);
    try {
      const result = await search(query);
      res.send(result);
    } catch (error) {
      console.log(error);
    }
  });

  app.get('/stats', async (req, res) => {
    try {
      res.send({
        Total: await prisma.manga.count(),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        message: 'An error occurred while processing your request',
      });
    }
  });

  app.listen({
    port: 3000,
  }, async(err, address) => {
    if (err) throw new Error(err.message);
    await init();
    console.log(chalk.cyanBright(`Running on `) + chalk.blueBright(`${address}`));
  });
})();
