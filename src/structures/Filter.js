module.exports = class Filter {
  /**
   *
   * @param {String} name
   * @param {RegExp} regex
   * @param {import("discord.js").GuildTextBasedChannel} dsChannel
   * @param {[String]} twChannels
   * @param {Boolean} inverted
   */
  constructor(name, regex, dsChannel, twChannels, inverted = false) {
    this.name = name;
    this.regex = regex;
    this.dsChannel = dsChannel;
    this.twChannels = twChannels;
    this.inverted = inverted;
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
