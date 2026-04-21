import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.TELEGRAM_TOKEN;

if (!TOKEN) {
  console.error('Error: TELEGRAM_TOKEN is missing in .env file');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

console.log('Telegram bot successfully started...');

bot.on('message', async (msg: TelegramBot.Message) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;
  const fullName = [msg.from?.first_name, msg.from?.last_name]
    .filter(Boolean)
    .join(' ') || 'Unknown User';

  if (userMessage?.toLowerCase() === 'photo') {
    console.log(`User ${fullName} requested a picture.`);
    
      const photoUrl = `https://picsum.photos/800/600?random=${Math.random()}`;
      await bot.sendPhoto(chatId, photoUrl);
  }

  if (userMessage) {
    console.log(`User ${fullName} wrote: ${userMessage}`);
    const cleanMessage = userMessage.startsWith('/') ? userMessage.slice(1) : userMessage;
    await bot.sendMessage(chatId, `You wrote: "${cleanMessage}"`);
  }
});

// Proper error handling
bot.on('polling_error', (error) => console.error(`Polling error: ${error.message}`));

// Graceful shutdown
process.on('SIGINT', () => {
  bot.stopPolling();
  process.exit(0);
});