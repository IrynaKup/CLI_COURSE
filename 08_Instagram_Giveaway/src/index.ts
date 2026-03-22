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

  // Обрабатываем файлы последовательно 
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
