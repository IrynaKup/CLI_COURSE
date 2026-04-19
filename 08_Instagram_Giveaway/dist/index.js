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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const readline = __importStar(require("readline"));
const path = __importStar(require("path"));
async function readPhrasesToSet(filePath) {
    const phrases = new Set();
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    for await (const line of rl) {
        const trimmedLine = line.trim();
        if (trimmedLine) {
            phrases.add(trimmedLine);
        }
    }
    return phrases;
}
async function processFilesParallel(filePaths) {
    console.log('Запуск параллельной обработки файлов');
    const promises = filePaths.map(filePath => readPhrasesToSet(filePath));
    const fileSets = await Promise.all(promises);
    const uniqueTotal = new Set();
    for (const phrases of fileSets) {
        for (const phrase of phrases) {
            uniqueTotal.add(phrase);
        }
    }
    return { uniqueTotal, fileSets };
}
function countInAllFiles(fileSets) {
    if (fileSets.length === 0)
        return 0;
    const common = new Set(fileSets[0]);
    for (let i = 1; i < fileSets.length; i++) {
        for (const phrase of common) {
            if (!fileSets[i].has(phrase)) {
                common.delete(phrase);
            }
        }
    }
    return common.size;
}
function countInAtLeastNFiles(fileSets, minFiles) {
    const frequency = new Map();
    for (const fileSet of fileSets) {
        for (const phrase of fileSet) {
            frequency.set(phrase, (frequency.get(phrase) || 0) + 1);
        }
    }
    let count = 0;
    for (const occurrences of frequency.values()) {
        if (occurrences >= minFiles) {
            count++;
        }
    }
    return count;
}
async function main() {
    const startTime = Date.now();
    const dataDir = path.join(__dirname, '../data');
    const filePaths = [];
    for (let i = 0; i < 20; i++) {
        filePaths.push(path.join(dataDir, `out${i}.txt`));
    }
    console.log('Проверка файлов');
    for (const filePath of filePaths) {
        if (!fs.existsSync(filePath)) {
            console.error(`Файл не найден: ${filePath}`);
            console.log('Убедитесь, что файлы .txt находятся в папке data/');
            process.exit(1);
        }
    }
    console.log('Начинаем обработку файлов');
    const { uniqueTotal, fileSets } = await processFilesParallel(filePaths);
    console.log('Подсчет фраз во всех файлах');
    const allFilesCount = countInAllFiles(fileSets);
    console.log('Подсчет фраз хотя бы в 10 файлах...');
    const atLeast10Count = countInAtLeastNFiles(fileSets, 10);
    const elapsedTime = (Date.now() - startTime) / 1000;
    console.log(`1. Уникальных фраз во всех файлах: ${uniqueTotal.size}`);
    console.log(`2. Фраз во всех 20 файлах: ${allFilesCount}`);
    console.log(`3. Фраз хотя бы в 10 файлах: ${atLeast10Count}`);
    console.log(`Время выполнения: ${elapsedTime.toFixed(2)} секунд`);
}
main().catch(console.error);
