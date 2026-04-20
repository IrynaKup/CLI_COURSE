import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';

const TOKEN = 'BOT_TOKEN';
const bot = new TelegramBot(TOKEN, { polling: true });

bot.on('message', (msg: any) => {
  if (msg.text) {
    bot.sendMessage(msg.chat.id, msg.text);
  }
});

const args = process.argv.slice(2);
const command = args[0];
const target = args[1];
const content = args[2];

if (command === 'message' && target && content) {
  bot.sendMessage(target, content);
  setTimeout(() => process.exit(0), 1000);
} 
else if (command === 'photo' && target && content && fs.existsSync(content)) {
  bot.sendPhoto(target, content);
  setTimeout(() => process.exit(0), 1000);
}
else if (command) {
  console.log('Использование:');
  console.log('  node bot.js message <chat_id> "текст"');
  console.log('  node bot.js photo <chat_id> /путь/к/фото.jpg');
}

console.log('Бот запущен');