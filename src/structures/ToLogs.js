module.exports = class ToLogs {
  /**
   *
   * @param {String} content
   * @param {import("discord.js").GuildTextBasedChannel} dsChannel
   */
  constructor(content, dsChannel) {
    this.content = content;
    this.dsChannel = dsChannel;
  }
};
