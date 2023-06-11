const bot = require('../../services/discordBot');
const tmi = require('../../services/twitchBot');
const ToLogs = require('../../structures/ToLogs');

// const cachePadSpace = 30;

module.exports = {
  name: 'message',

  /**
   *
   * @param {String} channelName
   * @param {import('tmi.js').Userstate} userState
   * @param {String} message
   * @param {Boolean} self
   */
  async run(channelName, userState, message, self) {
    if (self) return;
    const content = `[${tmi.fixChannelName(channelName)}] <${
      userState['display-name']
    }> ${message}`;
    tmi.filters.forEach(filter => {
      filter.dsChannels.forEach(dsChannel => {
        if (
          filter.twChannels.includes(tmi.fixChannelName(channelName)) &&
          (filter.inverted
            ? !filter.regExp.test(message)
            : filter.regExp.test(message))
        )
          bot.toLog.push(
            new ToLogs(
              content.length > 350 ? content.slice(0, 350) + '...' : content,
              dsChannel,
            ),
          );
      });
    });

    // const link = tmi.getLink(null, channel);
    // if (!link || !link.dsChannel || self) return;
    // // if (!dsChannel) {
    // //   // tmi.linkedChannels.splice(tmi.linkedChannels.findIndex(linkCh), 1);
    // //   return;
    // // }
    // try {
    //   await link.dsChannel.send({
    //     content,
    //   });
    // } catch (error) {
    //   bot.utils.log(error);
    // }
  },
};
