#!/usr/bin/env node

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');

const TOKEN = process.env.TELEGRAM_TOKEN;
if (!TOKEN) {
  console.error('не найден в .env файле');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

const userNames = {};

console.log('Telegram bot successfully started...');
async function getUserName(chatId, userId, firstName) {
  if (userNames[userId]) {
    return userNames[userId];
  }
  
  if (firstName) {
    userNames[userId] = firstName;
    return firstName;
  }
  
  await bot.sendMessage(chatId, 'Как вас зовут?');
  
  return new Promise((resolve) => {
    bot.once(`message:${chatId}`, (msg) => {
      const name = msg.text;
      userNames[userId] = name;
      resolve(name);
    });
  });
}

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userMessage = msg.text;
  const firstName = msg.from.first_name;
  
  const userName = await getUserName(chatId, userId, firstName);
  
  if (userMessage && userMessage.toLowerCase().includes('photo')) {
    console.log(`Пользователь ${userName} запросил картинку.`);
    
    try {
      const photoUrl = `https://picsum.photos/800/600?random=${Math.random()}`;
      
      await bot.sendPhoto(chatId, photoUrl, {
        caption: 'Случайная картинка :3'
      });
      
      console.log(`Картинка отправлена пользователю ${userName}`);
    } catch (error) {
      console.error('Ошибка при отправке картинки:', error.message);
      await bot.sendMessage(chatId, 'Не удалось получить картинку. Попробуйте позже.');
    }
  } else {
    console.log(`Пользователь ${userName} написал: ${userMessage || '[не текст]'}`);
  }
});

bot.on('polling_error', (error) => {
  console.error('Ошибка polling:', error.message);
});
process.on('SIGINT', () => {
  console.log('\nБот остановлен');
  bot.stopPolling();
  process.exit(0);
});