const tmi = require('../../services/twitchBot');

module.exports = {
  name: 'connected',

  run() {
    tmi.utils.log('Bot conectado a twitch');
  },
};
