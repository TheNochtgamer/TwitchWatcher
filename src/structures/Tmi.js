const { Client } = require('tmi.js');
const Utils = require('./Utils');

module.exports = class Tmi extends Client {
  /** @type {[String]} */
  #connectedChannels = [];
  /** @type {[{dsChannel:import('discord.js').Channel,twChannel:String}]} */
  #linkedChannels = [];

  constructor() {
    super({
      options: { debug: false },
      identity: {
        username: process.env.TWITCH_USER,
        password: process.env.TWITCH_PASS,
      },
    });

    this.utils = new Utils(null, '(TW)');
  }

  // async chJoin(channel = '') {
  //   if (!channel || typeof channel !== 'string') return false;
  //   return await this.join(channel);
  // }

  // async chLeave(channel = '') {
  //   if (!channel || typeof channel !== 'string') return false;
  //   return await this.part(channel);
  // }

  async link(dsChannel, twChannel) {
    if (!dsChannel || !twChannel) return 1;

    twChannel = twChannel.replace('#', '');
    const alreadyLink = this.getLink(dsChannel, twChannel);
    if (alreadyLink) return 2;

    if (!this.#connectedChannels.includes(twChannel)) {
      await this.join(twChannel);
      this.#connectedChannels.push(twChannel);
    }
    this.#linkedChannels.push({
      dsChannel,
      twChannel,
    });
    return 0;
  }

  /**
   *
   * @param {import('discord.js').Channel} dsChannel
   * @param {String} twChannel
   * @returns
   */
  getLink(dsChannel, twChannel) {
    twChannel = twChannel?.replace('#', '');
    return this.#linkedChannels.find(
      lc => lc.twChannel === twChannel || lc.dsChannel.id === dsChannel?.id,
    );
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
