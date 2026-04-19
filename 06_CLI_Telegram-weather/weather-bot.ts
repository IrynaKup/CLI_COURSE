#!/usr/bin/env node
import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.TELEGRAM_TOKEN;
const WEATHER_KEY = process.env.WEATHER_API_KEY;

if (!TOKEN || !WEATHER_KEY) {
  console.log('Ошибка в файл .env');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

const userCities: Record<number, string> = {};

const getMainMenu = (city: string) => ({
    reply_markup: {
        keyboard: [
            [`Forecast in ${city}`],
            ['3-hour interval', '6-hour interval']
        ],
        resize_keyboard: true
    }
});

bot.onText(/\/start/, (msg: any) => {
    bot.sendMessage(msg.chat.id, "Please enter your city to start:");
});

bot.on('message', async (msg: any) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) return;

    if (text === '3-hour interval') {
        await getWeather(chatId, 3);
    } else if (text === '6-hour interval') {
        await getWeather(chatId, 6);
    } else if (text.startsWith('Forecast in ')) {
        bot.sendMessage(chatId, "Select the interval below:");
    } else if (!text.startsWith('/')) {
        userCities[chatId] = text;
        bot.sendMessage(chatId, `City ${text} selected!`, getMainMenu(text));
    }
});

async function getWeather(chatId: number, interval: number) {
  const city = userCities[chatId];
  
  if (!city) {
    bot.sendMessage(chatId, 'Сначала выбери город!');
    return;
  }
  
  bot.sendMessage(chatId, `Ищу погоду в ${city}`);
  
  try {
    const geo = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${WEATHER_KEY}`
    );
    
    if (geo.data.length === 0) {
      bot.sendMessage(chatId, 'Город не найден. Попробуй еще раз.');
      return;
    }
/////////////////////////////////////////////
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