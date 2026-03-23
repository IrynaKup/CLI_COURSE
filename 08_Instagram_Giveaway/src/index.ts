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

async function processFiles(filePaths: string[]): Promise<ProcessResult> {
  const uniqueTotal = new Set<string>();
  const fileSets: Set<string>[] = [];

  for (const filePath of filePaths) {
    console.log(`Обработка: ${path.basename(filePath)}`);
    const phrases = await readPhrasesToSet(filePath);
    fileSets.push(phrases);
    for (const phrase of phrases) {
      uniqueTotal.add(phrase);
    }
  }

  return { uniqueTotal, fileSets };
}
// Находит фразы, которые есть во всех файлах
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

