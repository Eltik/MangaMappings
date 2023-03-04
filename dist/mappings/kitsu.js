"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const chalk_1 = __importDefault(require("chalk"));
const stringsim = __importStar(require("string-similarity"));
const kitsu = async (title) => {
    try {
        console.log(`[+] Getting Kitsu mappings for ${chalk_1.default.cyan(title)}`);
        const { data: kData } = await axios_1.default.get(`https://kitsu.io/api/edge/manga?filter[text]=${title}`);
        const bestMatch = stringsim.findBestMatch(String(title), kData.data.map((d) => { var _a, _b; return (_b = (_a = d.attributes.titles.en_jp) !== null && _a !== void 0 ? _a : d.attributes.titles.en) !== null && _b !== void 0 ? _b : ''; }));
        return kData.data[bestMatch.bestMatchIndex];
    }
    catch (error) {
        console.log(chalk_1.default.red(`[-] Failed to get mappings for ${title} on Kitsu`));
        return undefined;
    }
};
exports.default = kitsu;
//# sourceMappingURL=kitsu.js.map