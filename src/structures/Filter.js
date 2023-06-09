module.exports = class Filter {
  /**
   *
   * @param {String} name
   * @param {RegExp} regex
   * @param {import("discord.js").GuildTextBasedChannel} dsChannel
   * @param {[String]} twChannels
   */
  constructor(name, regex, dsChannel, twChannels) {
    this.name = name;
    this.regex = regex;
    this.dsChannel = dsChannel;
    this.twChannels = twChannels;
  }

  /**
   *
   * @param {String} regExpStr
   * @param {String} flags
   * @returns {Error|RegExp}
   */
  static validateRegex(regExpStr, flags = 'g') {
    try {
      const regExp = new RegExp(regExpStr, flags);
      return regExp;
    } catch (error) {
      return error;
    }
  }
};
