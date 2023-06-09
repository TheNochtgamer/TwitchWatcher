const cacheMe = require('./services/cacheMe');

require('dotenv').config();

(async () => {
  const tmi = require('./services/twitchBot');
  const bot = require('./services/discordBot');

  globalThis._ = {
    tmi,
    bot,
    cacheMe,
  };

  await Promise.all([bot.init(process.env.TOKEN), tmi.init()]);
})();
