#!/usr/bin/env node
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const TOKEN = process.env.TELEGRAM_TOKEN;
const WEATHER_KEY = process.env.WEATHER_API_KEY;

if (!TOKEN || !WEATHER_KEY) {
  console.log('файл .env');
  return;
}

const bot = new TelegramBot(TOKEN, { polling: true });

console.log('Бот запущен!');

const userCities = {};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const name = msg.from.first_name;
  
  const options = {
    reply_markup: {
      keyboard: [
        ['Выбрать город', 'Мой город'],
        ['Погода на 3 часа', 'Погода на 6 часов']
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  };
  
  bot.sendMessage(
    chatId,
    `Привет, ${name}!\n\n` +
    `Я покажу прогноз погоды.\n` +
    `Сначала выбери город, потом интервал.`,
    options
  );
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  if (text === '🌆 Выбрать город') {
    bot.sendMessage(chatId, 'Напиши название города (например: Kyiv):');
  }
  
  else if (text === 'Мой город') {
    const city = userCities[chatId] || 'Не выбран';
    bot.sendMessage(chatId, `Твой город: ${city}`);
  }
  
  else if (text === 'Погода на 3 часа') {
    getWeather(chatId, 3);
  }
  
  else if (text === 'Погода на 6 часов') {
    getWeather(chatId, 6);
  }
  
  else if (text && !text.startsWith('/') && !text.includes('🌆') && !text.includes('📍')) {
    userCities[chatId] = text;
    bot.sendMessage(
      chatId, 
      `Город ${text} сохранен!\nТеперь выбери интервал.`
    );
  }
});

async function getWeather(chatId, interval) {
  const city = userCities[chatId];
  
  if (!city) {
    bot.sendMessage(chatId, 'Сначала выбери город!');
    return;
  }
  
  bot.sendMessage(chatId, `Ищу погоду в ${city}...`);
  
  try {
    const geo = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${WEATHER_KEY}`
    );
    
    if (geo.data.length === 0) {
      bot.sendMessage(chatId, 'Город не найден. Попробуй еще раз.');
      return;
    }
    
    const lat = geo.data[0].lat;
    const lon = geo.data[0].lon;
    
    const forecast = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}&units=metric&lang=ru`
    );
    
    let message = `*${city}*\n`;
    message += `Интервал: ${interval} часа\n\n`;
    
    for (let i = 0; i < forecast.data.list.length; i += interval === 3 ? 1 : 2) {
      const item = forecast.data.list[i];
      const date = new Date(item.dt * 1000);
      
      const day = date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
      const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      
      const temp = Math.round(item.main.temp);
      const feels = Math.round(item.main.feels_like);
      const desc = item.weather[0].description;
      
      message += `*${day}*\n`;
      message += `${time}, ${temp}°C (ощущается как ${feels}°C), ${desc}\n\n`;
      if (i > 20) break;
    }
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.log(error.message);
    bot.sendMessage(chatId, 'Ошибка получения погоды. Попробуй позже.');
  }
}

console.log('Бот ожидает сообщения...');