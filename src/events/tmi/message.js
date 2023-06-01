const cacheMe = require('../../services/cacheMe');
const bot = require('../../services/discordBot');
const tmi = require('../../services/twitchBot');

module.exports = {
  name: 'message',

  /**
   *
   * @param {String} channel
   * @param {import('tmi.js').Userstate} userState
   * @param {String} message
   * @param {Boolean} self
   */
  async run(channel, userState, message, self) {
    const link = tmi.getLink(null, channel);
    const content = `<${userState.username}> ${message}`;

    if (!link || !link.dsChannel || self) return;

    // if (!dsChannel) {
    //   // tmi.linkedChannels.splice(tmi.linkedChannels.findIndex(linkCh), 1);
    //   return;
    // }

    try {
      await link.dsChannel.send({
        content,
      });
    } catch (error) {
      bot.utils.log(error);
    }
  },
};
