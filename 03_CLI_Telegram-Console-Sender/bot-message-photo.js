#!/usr/bin/env node
require('dotenv').config();

const { program } = require('commander');
const TelegramBot = require('node-telegram-bot-api');
const { existsSync } = require('fs');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

if (!TELEGRAM_TOKEN || !CHAT_ID) {
  console.error('не найден в .env файле');
  process.exit(1);
}

const bot = new TelegramBot(TELEGRAM_TOKEN);

program
  .version('1.0.0')
  .description('Telegram Console Sender - tool to send messages and photos to Telegram');

program
  .command('message <text>')
  .alias('m')
  .description('Send a text message to Telegram bot')
  .action(async (text) => {
    try {
      await bot.sendMessage(CHAT_ID, text);
      console.log('Message sent!');
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      process.exit(0);
    }
  });

program
  .command('photo <path>')
  .alias('p')
  .description('Send a photo to Telegram bot (you can drag & drop file)')
  .action(async (photoPath) => {
    try {
      const cleanPath = photoPath.replace(/^['"]|['"]$/g, '');
      
      if (!existsSync(cleanPath)) {
        console.error('File not found');
        process.exit(1);
      }

      await bot.sendPhoto(CHAT_ID, cleanPath);
      console.log('Photo sent!');
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      process.exit(0);
    }
  });


program.addHelpText('after', `
Examples:
  $ node bot-message-photo message "Hello from console"
  $ node bot-message-photo m "Hello!"
  $ node bot-message-photo photo C:\\path\\to\\photo.jpg
  $ node bot-message-photo p C:\\photo.jpg
`);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
};