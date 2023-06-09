const tmi = require('../../services/twitchBot');

module.exports = {
  name: 'connected',

  run() {
    tmi.utils.log('Bot online como', tmi.getUsername());
  },
};
