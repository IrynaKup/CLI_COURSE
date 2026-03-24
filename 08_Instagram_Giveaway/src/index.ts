import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';

interface ProcessResult {
  uniqueTotal: Set<string>;
  fileSets: Set<string>[];
}

async function readPhrasesToSet(filePath: string): Promise<Set<string>> {
  const phrases = new Set<string>();
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

async function processFilesParallel(filePaths: string[]): Promise<ProcessResult> {
  console.log('Запуск параллельной обработки файлов');
  
  const promises = filePaths.map(filePath => readPhrasesToSet(filePath));
  const fileSets = await Promise.all(promises);
  
  const uniqueTotal = new Set<string>();
  for (const phrases of fileSets) {
    for (const phrase of phrases) {
      uniqueTotal.add(phrase);
    }
  }
  
  return { uniqueTotal, fileSets };
}

function countInAllFiles(fileSets: Set<string>[]): number {
  if (fileSets.length === 0) return 0;
  
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


function countInAtLeastNFiles(fileSets: Set<string>[], minFiles: number): number {
  const frequency = new Map<string, number>();
  
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
  const filePaths: string[] = [];
  
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