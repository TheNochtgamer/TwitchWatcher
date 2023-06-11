const { Client } = require('tmi.js');
const Utils = require('./Utils');
const TwChannel = require('./TwChannel');
const Filter = require('./Filter');

module.exports = class Tmi extends Client {
  /** @type {[TwChannel]} */
  connectedChannels = [];
  /** @type {[Filter]} */
  filters = [];

  constructor() {
    super({
      options: { debug: false },
      identity: {
        username: process.env.TWITCH_USER,
        password: process.env.TWITCH_TOKEN,
      },
      connection: {
        reconnect: true,
        reconnectInterval: 3 * 1000,
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
    return this.connectedChannels.find(
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

    twChannelName = twChannelName.replace(/ /g, '').toLowerCase();

    this.connectedChannels.push(new TwChannel(twChannelName));
    this.utils.log(`<${twChannelName}> chat join`);

    return await this.join(twChannelName);
  }

  async chLeave(twChannelName = '') {
    if (!twChannelName || typeof twChannelName !== 'string') return false;
    const twChannel = this.isJoined(twChannelName);
    if (!twChannel) return false;

    twChannelName = twChannelName.replace(/ /g, '').toLowerCase();

    this.connectedChannels.splice(
      this.connectedChannels.findIndex(twChannelA => twChannelA === twChannel),
      1,
    );
    this.utils.log(`<${twChannelName}> chat leave`);

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
