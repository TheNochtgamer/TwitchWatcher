require('dotenv').config();

(async () => {
  const tmi = require('./services/twitchBot');
  const bot = require('./services/discordBot');

  globalThis._ = {
    tmi,
    bot,
  };

  Promise.all([bot.init(process.env.TOKEN), tmi.init()]);
})();
