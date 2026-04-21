#!/usr/bin/env node
import TelegramBot, { SendMessageOptions } from 'node-telegram-bot-api';
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

const getMainMenu = (city: string): SendMessageOptions => ({
    reply_markup: {
        keyboard: [
            [{ text: '3 часа' }, { text: '6 часов' }],
            [{ text: 'Назад, вібрать другой город' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
    }
});
const removeKeyboard = (): SendMessageOptions => ({
    reply_markup: { remove_keyboard: true }
});
bot.onText(/\/start/, (msg: any) => {
    bot.sendMessage(msg.chat.id, "Pls enter your city:");
});

bot.on('message', async (msg: any) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (!text) return;
    if (text === 'Back to change city') {
        delete userCities[chatId];
        return bot.sendMessage(chatId, "Pls enter a new city name:", removeKeyboard());
    }
    if (text === '3 часа') {
        await getWeather(chatId, 3);
    } else if (text === '6 часов') {
        await getWeather(chatId, 6);
    }else if (text === 'Назад, вібрать другой город') {
        bot.sendMessage(chatId, "Pls enter a new city name:");
    }else if (!text.startsWith('/')) {
        userCities[chatId] = text.trim();
        bot.sendMessage(chatId, `City ${text} ch`, getMainMenu(text));
    }
});

async function getWeather(chatId: number, interval: number) {
    const city = userCities[chatId];
    
    if (!city) {
        return bot.sendMessage(chatId, 'Pls enter a city name first!');
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=ru&appid=${WEATHER_KEY}`;
        const { data } = await axios.get(url);

        let message = `*Погода в ${city}*\n`;
        let lastDate = '';
        const step = interval === 3 ? 1 : 2;

        for (let i = 0; i < data.list.length; i += step) {
            const item = data.list[i];
            const dateObj = new Date(item.dt * 1000);
            
            const currentDate = dateObj.toLocaleDateString('ru-RU', { 
                weekday: 'long', day: 'numeric', month: 'long' 
            });

            if (currentDate !== lastDate) {
                message += `\n*${currentDate}*\n`;
                lastDate = currentDate;
            }

            const time = dateObj.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', hour12: false });
            const temp = Math.round(item.main.temp);
            const feels = Math.round(item.main.feels_like);
            const desc = item.weather[0].description;

            const t = temp > 0 ? `+${temp}` : temp;
            const f = feels > 0 ? `+${feels}` : feels;

            message += `${time} — ${t}C (ощущается как ${f}C), ${desc}\n`;
        }

        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    } catch (e) {
        bot.sendMessage(chatId, "Error City not found.");
    }
}
process.once('SIGINT', () => bot.stopPolling());
process.once('SIGTERM', () => bot.stopPolling());

import http from 'http';

// Создаем "заглушку" сервера для Render
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot is alive!');
}).listen(port, () => {
    console.log(`Web server is running on port ${port}`);
});