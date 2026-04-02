#!/usr/bin/env node
require('dotenv').config();

const { program } = require('commander');
const TelegramBot = require('node-telegram-bot-api');
const { existsSync } = require('fs');
const path = require('path');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
  console.error('не найден в .env файле');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN);

if (process.argv.slice(2).length === 0) {
  console.log('поллинг');
  bot.startPolling();
  bot.on('polling_error', (error) => {
    console.error('Polling error:', error.message);
  });
  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const from = msg.from.first_name;
    
    console.log(`Received message from ${from}: ${text}`);
    bot.sendMessage(chatId, `Echo: ${text}`);
  });
  
  console.log('Bot - ready');
} else {


program
  .name('Console Sender')
  .description('Telegram Console Sender - tool to send messages and photos to Telegram')
  .version('1.0.0');
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
}
}