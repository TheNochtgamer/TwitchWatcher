const {
  Client,
  IntentsBitField,
  Partials,
  PresenceUpdateStatus,
  Collection,
} = require('discord.js');
const Utils = require('./Utils');

module.exports = class Bot extends Client {
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
    this.utils = new Utils(this, '(DS)');
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

  async init(token) {
    await Promise.allSettled([this.loadEvents(), this.loadCommands()]);

    await this.login(token);
  }
};
