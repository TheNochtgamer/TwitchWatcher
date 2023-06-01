const cacheMe = require('./services/cacheMe');

require('dotenv').config();

(async () => {
  const tmi = require('./services/twitchBot');
  const bot = require('./services/discordBot');

  await Promise.all([bot.init(process.env.TOKEN), tmi.init()]);
})();
