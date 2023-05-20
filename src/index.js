require('dotenv').config();
const Bot = require('./structures/Client');

(async () => {
  const bot = new Bot();
  await bot.init(process.env.TOKEN);
})();
