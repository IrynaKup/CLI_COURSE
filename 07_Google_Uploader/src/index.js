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

console.log(chalk.cyan.bold('\n📤 Google Uploader v1.0\n'));
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