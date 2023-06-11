const Utils = require('./Utils');
const {
  Client,
  IntentsBitField,
  Partials,
  PresenceUpdateStatus,
  Collection,
} = require('discord.js');
const { setTimeout: delay } = require('timers/promises');
const { Names } = require('./Enums');
const tmi = require('../services/twitchBot');
const ToLogs = require('./ToLogs');

module.exports = class Bot extends Client {
  /** @type {[ToLogs]} */
  toLog = [];
  /**
   * @type {import("discord.js").Webhook[]}
   */
  #webhooks = [];

  constructor() {
    super({
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.MessageContent,
      ],
      partials: [Partials.Message],
      presence: {
        status: PresenceUpdateStatus.DoNotDisturb,
      },
    });

    this.commands = new Collection();
    this.scripts = new Collection();
    this.utils = new Utils(this, '(DS)');
  }

  async #loop() {
    const dsChannels = this.toLog
      // .filter(
      //   (logs, index, arr) =>
      //     !arr
      //       .slice(index + 1)
      //       .some(logs2 => logs.dsChannel === logs2.dsChannel),
      // )
      .filter(
        (logs, index, arr) =>
          index === arr.findIndex(logs2 => logs2.dsChannel === logs.dsChannel),
      )
      .map(logs => logs.dsChannel);

    if (!dsChannels.length) return;

    const promises = dsChannels.map(dsChannel => {
      return (async () => {
        let exist = false;
        try {
          exist = !!(await dsChannel.fetch());
        } catch (error) {}

        if (dsChannel.isThread() || !exist) return false;
        const webhook =
          this.#webhooks.find(
            webhook2 => webhook2.channelId === dsChannel.id,
          ) ??
          (await dsChannel.fetchWebhooks()).at(0) ??
          (await dsChannel.createWebhook({ name: Names.newWebhook }));
        const myLogs = this.toLog.filter(log => log.dsChannel === dsChannel);

        if (
          !this.#webhooks.some(webhook2 => webhook2.channelId === dsChannel.id)
        ) {
          this.#webhooks.push(webhook);
        }

        try {
          const content =
            '```\n' + myLogs.map(log => log.content).join('\n') + '```';
          await webhook.send({
            content:
              content.length > 2000
                ? content.slice(0, 1994) + '```...'
                : content,
          });
        } catch (error) {
          tmi.utils.log(error);
          return false;
        }
        return true;
      })();
    });

    // for (let index = 0; index < dsChannels.length; index++) {
    //   const dsChannel = dsChannels[index];
    //   if (dsChannel.isThread()) continue;
    //   const webhook =
    //     this.#webhooks.find(webhookA => webhookA.channelId === dsChannel.id) ??
    //     (await dsChannel.fetchWebhooks()).at(0) ??
    //     (await dsChannel.createWebhook({ name: Names.newWebhook }));
    //   const myLogs = this.#toLog.filter(log => log.dsChannel === dsChannel);

    //   try {
    //     await webhook.send({
    //       content: myLogs.map(log => log.content).join('\n'),
    //     });
    //   } catch (error) {
    //     tmi.utils.log(error);
    //   }
    // }

    await Promise.allSettled(promises);
  }

  async loadCommands() {
    console.log('Cargando comandos...');
    const FILES = await this.utils.loadFiles('cmd');
    this.commands.clear();

    FILES.forEach(file => {
      try {
        const CMD = require(file);
        this.commands.set(CMD.data.name, CMD);
      } catch (error) {
        console.log(`Error al cargar el archivo ${file}`, error);
      }
    });

    console.log(`(/) ${FILES.length} comandos cargados`);
  }

  async loadEvents() {
    console.log('Cargando eventos...');
    const FILES = await this.utils.loadFiles('events/ds');
    this.removeAllListeners();

    FILES.forEach(file => {
      try {
        const EVENT = require(file);
        if (EVENT.name === 'ready' || EVENT.once) {
          this.once(EVENT.name, EVENT.run);
        } else {
          this.on(EVENT.name, EVENT.run);
        }
      } catch (error) {
        console.log(`Error al cargar el archivo ${file}`, error);
      }
    });

    console.log(`(/) ${FILES.length} eventos cargados`);
  }

  async loadScripts() {
    console.log('Cargando scripts...');
    const FILES = await this.utils.loadFiles('../scripts');
    this.scripts.clear();

    FILES.forEach(file => {
      try {
        const SCRIPT = require(file);
        if (!SCRIPT.name) throw new Error('No tiene un nombre establecido');
        if (!SCRIPT.run) throw new Error('No tiene un metodo run establecido');

        this.scripts.set(SCRIPT.name, SCRIPT);
      } catch (error) {
        console.log(`Error al cargar el archivo ${file}`, error);
      }
    });

    console.log(`(/) ${FILES.length} scripts cargados`);
  }

  async init(token) {
    await Promise.allSettled([
      this.loadEvents(),
      this.loadCommands(),
      this.loadScripts(),
    ]);

    await this.login(token);

    while (true) {
      await delay(2 * 1000);
      await this.#loop();
      this.toLog.splice(0);
    }
  }
};
