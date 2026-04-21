#!/usr/bin/env node
import 'dotenv/config';
import { program } from 'commander';
import TelegramBot from 'node-telegram-bot-api';
import { existsSync } from 'fs';

const { BOT_TOKEN, CHAT_ID } = process.env;
const bot = new TelegramBot(BOT_TOKEN || '');

program
  .command('message <message>')
  .alias('m') 
  .description('Send a text message to the Telegram Bot')
  .action(async (msg) => {
    try {
      await bot.sendMessage(CHAT_ID!, msg);
      console.log('Message sent!');
    } catch (e: any) {
      console.error(e.message);
    } finally { process.exit(0); }
  });
program
  .command('photo <path>')
  .alias('p')
  .description('Send a photo to the Telegram Bot. Just drag and drop it into the console after the command.')
  .action(async (photoPath) => {
    try {
      const cleanPath = photoPath.replace(/^['"]|['"]$/g, '');
      if (!existsSync(cleanPath)) {
        console.error('File not found');
        process.exit(1);
      }
      await bot.sendPhoto(CHAT_ID!, cleanPath);
      console.log('Photo sent!');
    } catch (e: any) {
      console.error(e.message);
    } finally { process.exit(0); }
  });

program.parse(process.argv);