#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { uploadToGoogleDrive, authenticate } from './google-drive.js';
import { createTinyUrl } from './tinyurl.js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

console.log(chalk.cyan.bold('\nGoogle Uploader v1.0\n'));
console.log(chalk.yellow('Перетащите изображение в это окно и нажмите Enter\n'));

async function promptForImagePath() {
  const { imagePath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'imagePath',
      message: 'Путь к изображению:',
      validate: async (input) => {
        const cleanPath = input.trim().replace(/^['"]|['"]$/g, '');
        if (!cleanPath) return 'Пожалуйста, укажите путь к изображению';
        
        const exists = await fs.pathExists(cleanPath);
        if (!exists) return 'Файл не найден';
        
        const stats = await fs.stat(cleanPath);
        if (!stats.isFile()) return 'Указанный путь не является файлом';
        
        const ext = path.extname(cleanPath).toLowerCase();
        const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
        if (!imageExts.includes(ext)) return 'Файл должен быть изображением';
        
        return true;
      }
    }
  ]);
  
  return imagePath.trim().replace(/^['"]|['"]$/g, '');
}

async function promptForRename(originalPath) {
  const originalName = path.basename(originalPath);
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: `Имя файла: ${chalk.green(originalName)}`,
      choices: [
        { name: 'Переименовать', value: 'rename' },
        { name: 'Оставить как есть', value: 'keep' }
      ]
    }
  ]);

  if (action === 'rename') {
    const { newName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'newName',
        message: 'Новое имя файла (без расширения):',
        validate: (input) => {
          if (!input.trim()) return 'Имя не может быть пустым';
          if (/[<>:"/\\|?*]/.test(input)) return 'Имя содержит недопустимые символы';
          return true;
        }
      }
    ]);
    
    const ext = path.extname(originalPath);
    return newName.trim() + ext;
  }
  
  return originalName;
}

async function promptForShortLink() {
  const { shorten } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'shorten',
      message: 'Создать короткую ссылку?',
      default: true
    }
  ]);
  
  return shorten;
}

async function main() {
  try {
    const imagePath = await promptForImagePath();
    console.log(chalk.gray(`\nВыбрано: ${imagePath}\n`));

    const finalFileName = await promptForRename(imagePath);
    if (finalFileName !== path.basename(imagePath)) {
      console.log(chalk.gray(`\nНовое имя: ${finalFileName}\n`));
    }

    const createShortLink = await promptForShortLink();

    console.log(chalk.cyan('\nАутентификация в Google Drive'));
    
    const auth = await authenticate();
    console.log(chalk.green('Аутентификация успешна\n'));

    console.log(chalk.cyan('Загрузка файла'));
    
    let fileToUpload = imagePath;
    if (finalFileName !== path.basename(imagePath)) {
      const tempPath = path.join(__dirname, 'temp', finalFileName);
      await fs.ensureDir(path.join(__dirname, 'temp'));
      await fs.copy(imagePath, tempPath);
      fileToUpload = tempPath;
    }

    const fileInfo = await uploadToGoogleDrive(auth, fileToUpload, finalFileName);
    
    if (fileToUpload !== imagePath) {
      await fs.remove(fileToUpload);
    }

    console.log(chalk.green('Файл успешно загружен!\n'));
    console.log(chalk.cyan('Детали:'));
    console.log(`   ID: ${fileInfo.id}`);
    console.log(`   Название: ${fileInfo.name}`);
    console.log(`   Размер: ${(fileInfo.size / 1024).toFixed(2)} KB`);
    console.log(`   Ссылка: ${fileInfo.webViewLink}`);

    if (createShortLink) {
      console.log(chalk.cyan('\nСоздание короткой ссылки...'));
      try {
        const shortUrl = await createTinyUrl(fileInfo.webViewLink);
        console.log(chalk.green('Короткая ссылка создана!'));
        console.log(`   ${shortUrl}\n`);
      } catch (error) {
        console.log(chalk.yellow('Не удалось создать короткую ссылку'));
      }
    }

    console.log(chalk.green.bold('\nФайл загружен в Google Drive\n'));

  } catch (error) {
    console.error(chalk.red('\nОшибка:'), error.message);
    process.exit(1);
  }
}

main();