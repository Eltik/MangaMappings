"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const chalk_1 = __importDefault(require("chalk"));
const Malsync = async (malId) => {
    try {
        console.log(chalk_1.default.yellow `[!] Getting Mappings for ${malId} via Malsync`);
        const { data } = await axios_1.default.get(`https://api.malsync.moe/mal/manga/${malId}`);
        console.log(chalk_1.default.green `[+] Got Mappings for ${malId} via Malsync`);
        return data.Sites;
    }
    catch (error) {
        console.log(chalk_1.default.red('Failed to get mappings for ') +
            chalk_1.default.redBright('MalSync ') +
            chalk_1.default.red(`for ID ${malId}`));
        return null;
    }
};
exports.default = Malsync;
//# sourceMappingURL=malsync.js.map