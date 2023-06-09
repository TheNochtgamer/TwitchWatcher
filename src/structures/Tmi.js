const { Client } = require('tmi.js');
const Utils = require('./Utils');
const TwChannel = require('./TwChannel');
const Filter = require('./Filter');

module.exports = class Tmi extends Client {
  /** @type {[TwChannel]} */
  twConnectedChannels = [];
  /** @type {[Filter]} */
  filters = [];

  constructor() {
    super({
      options: { debug: false },
      identity: {
        username: process.env.TWITCH_USER,
        password: process.env.TWITCH_TOKEN,
      },
    });

    this.utils = new Utils(null, '(TW)');
  }

  /**
   *
   * @param {String} twChannel
   * @returns
   */
  isJoined(twChannel) {
    return this.twConnectedChannels.find(
      c => c.name === this.fixChannelName(twChannel),
    );
  }

  async chJoin(twChannelName = '') {
    if (
      !twChannelName ||
      typeof twChannelName !== 'string' ||
      this.isJoined(twChannelName)
    )
      return false;
    this.twConnectedChannels.push(new TwChannel(twChannelName));
    return await this.join(twChannelName);
  }

  async chLeave(twChannelName = '') {
    if (!twChannelName || typeof twChannelName !== 'string') return false;
    const twChannel = this.isJoined(twChannelName);
    if (!twChannel) return false;
    this.twConnectedChannels.splice(
      this.twConnectedChannels.findIndex(
        twChannelA => twChannelA === twChannel,
      ),
      1,
    );
    return await this.part(twChannelName);
  }

  // async link(dsChannel, twChannel) {
  //   if (!dsChannel || !twChannel) return 1;

  //   twChannel = twChannel.replace('#', '');
  //   const alreadyLink = this.getLink(dsChannel, twChannel);
  //   if (alreadyLink) return 2;

  //   if (!this.#connectedChannels.includes(twChannel)) {
  //     await this.join(twChannel);
  //     this.#connectedChannels.push(twChannel);
  //   }
  //   this.#linkedChannels.push({
  //     dsChannel,
  //     twChannel,
  //   });
  //   return 0;
  // }

  fixChannelName(channelName = '') {
    return channelName.replace('#', '').replace(/ /g, '');
  }

  async loadEvents() {
    const FILES = await this.utils.loadFiles('events/tmi');
    this.removeAllListeners();

    FILES.forEach(file => {
      try {
        const EVENT = require(file);
        if (EVENT.name === 'connected' || EVENT.once) {
          this.once(EVENT.name, EVENT.run);
        } else {
          this.on(EVENT.name, EVENT.run);
        }
      } catch (error) {
        console.log(`Error al cargar el archivo ${file}`, error);
      }
    });
  }

  async init() {
    await this.loadEvents();

    await this.connect();
  }
};
