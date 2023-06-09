module.exports = class TwChannel {
  /**
   *
   * @param {String} name
   */
  constructor(name = '') {
    this.name = name.replace('#', '');
  }
};
