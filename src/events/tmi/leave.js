const tmi = require('../../services/twitchBot');

module.exports = {
  name: 'part',

  run(channel) {
    tmi.utils.log(`<${channel}> left`);
  },
};
