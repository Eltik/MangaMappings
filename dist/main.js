"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./db/client");
const getMappings_1 = require("./getMappings");
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const extensions_1 = require("@consumet/extensions");
const chalk_1 = __importDefault(require("chalk"));
(async () => {
    const app = (0, fastify_1.default)({ logger: false });
    app.register(cors_1.default);
    app.get('/', async () => {
        return {
            message: 'Welcome to the MangaMappings API!',
            routes: {
                '/': 'This page',
                '/anilist/:anilistId': 'Get the Mappings for the given AniList ID',
                '/mal/:malId': 'Get the Mappings for the given Mal ID',
                '/trending': 'an example integration with a popular manga library consumet - https://github.com/consumet/consumet.ts',
                '/popular': 'another example integration with consumet',
            },
        };
    });
    app.get('/anilist/:id', async (req, res) => {
        const id = req.params.id;
        if (isNaN(id)) {
            return res.status(400).send({
                message: 'Please provide a valid AniList ID',
            });
        }
        try {
            res.send(await (0, getMappings_1.getMappings)(id));
        }
        catch (error) {
            console.error(error);
            return res.status(500).send({
                message: 'An error occurred while processing your request',
            });
        }
    });
    app.get('/mal/:id', async (req, res) => {
        const id = req.params.id;
        if (!id) {
            res.status(400);
            return res.send({ message: 'Provide a MAL id' });
        }
        try {
            const data = await client_1.prisma.manga.findUnique({
                where: {
                    malId: Number(id),
                },
            });
            return data
                ? res.send(data)
                : res.status(404).send({
                    message: 'Sorry, Couldnt find the MAL id in the database',
                });
        }
        catch (error) {
            console.log(error);
        }
    });
    app.get('/info/:id', async (req, res) => {
        const id = req.params.id;
        try {
            const anilist = new extensions_1.META.Anilist.Manga();
            const info = await anilist.fetchMangaInfo(String(id));
            const mappings = await (0, getMappings_1.getMappings)(id);
            info.mappings && delete info.mappings;
            res.status(200).send(Object.assign(Object.assign({}, info), { mappings: mappings }));
        }
        catch (error) {
            console.log(error);
            res
                .status(500)
                .send('Ran into an error trying to request that info. Please try again later');
        }
    });
    app.get('/search/:query', async (req, res) => {
        const query = req.params.query;
        // console.log(`searching ${query}`);
        try {
            const result = await (0, getMappings_1.search)(query);
            res.send(result);
        }
        catch (error) {
            console.log(error);
        }
    });
    app.get('/stats', async (req, res) => {
        try {
            res.send({
                Total: await client_1.prisma.manga.count(),
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).send({
                message: 'An error occurred while processing your request',
            });
        }
    });
    app.listen({
        port: 3000,
    }, async (err, address) => {
        if (err)
            throw new Error(err.message);
        await (0, getMappings_1.init)();
        console.log(chalk_1.default.cyanBright(`Running on `) + chalk_1.default.blueBright(`${address}`));
    });
})();
//# sourceMappingURL=main.js.map