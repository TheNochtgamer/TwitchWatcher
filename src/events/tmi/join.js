const tmi = require('../../services/twitchBot');

module.exports = {
  name: 'join',

  run(channel) {
    tmi.utils.log(`<${channel}> join`);
  },
};
