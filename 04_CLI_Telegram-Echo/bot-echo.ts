import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();

const TOKEN = process.env.BOT_TOKEN;
if (!TOKEN) {
  process.exit(1);
}
const bot = new TelegramBot(TOKEN, { polling: true });

console.log('Telegram bot successfully started...');

bot.on('message', async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;
  const userName = msg.from?.first_name

  if (userMessage?.toLowerCase() === 'photo') {
    console.log(`User ${userName} requested a picture.`);
      const photoUrl = `https://picsum.photos/800/600?random=${Math.random()}`;
      await bot.sendPhoto(chatId, photoUrl);
  } 
  else if (userMessage) {
    console.log(`User ${userName} wrote: ${userMessage}`);
    await bot.sendMessage(chatId, `You wrote: "${userMessage}"`);
  }
});

bot.on('polling_error', (error) => console.error(error.message));
process.on('SIGINT', () => {
  bot.stopPolling();
  process.exit(0)
});

import http from 'http';

// Создаем "заглушку" сервера для Render
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Bot is alive!');
}).listen(port, () => {
    console.log(`Web server is running on port ${port}`);
});