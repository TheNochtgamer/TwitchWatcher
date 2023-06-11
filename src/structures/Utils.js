const path = require('path');
const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

module.exports = class Utils {
  #logPrefix;
  constructor(client, logPrefix = '') {
    this.client = client;
    this.#logPrefix = logPrefix;
  }

  log(...args) {
    console.log(this.#logPrefix, ...args);
  }

  async loadFiles(targetDir) {
    const PATH = path.join(__dirname, '../', targetDir);
    const FILES = fs
      .readdirSync(PATH)
      .filter(f => f.endsWith('.js'))
      .map(f => path.join(PATH, f));

    FILES.forEach(f => delete require.cache[require.resolve(f)]);

    return FILES;
  }

  checkId(id = '') {
    return id.length >= 17 && id.length <= 20 && !isNaN(parseInt(id));
  }

  async summitCommands(guildId = process.env.GUILD) {
    if (!this.client.commands.size || !this.client) return;
    let cmds = null;

    console.log('Subiendo comandos...');
    try {
      if (guildId) {
        if (!this.checkId(guildId)) throw new Error('Id invalida');
        const GUILD = this.client.guilds.cache.get(guildId);
        cmds = await GUILD.commands.set(
          this.client.commands.map(cmd => cmd.data),
        );
      } else {
        cmds = await this.client.application.commands.set(
          this.client.commands.map(cmd => cmd.data),
        );
      }
      if (!cmds) throw new Error('No se subio ningun comando');
      console.log(`(/) ${cmds.size} comandos subidos`);
    } catch (error) {
      console.log('Error al intentar subir los comandos', error);
    }
  }

  async embedReply(interaction, embedData) {
    const embed = new EmbedBuilder(embedData);
    if (!embedData.color) embed.setColor('White');
    if (!embedData.timestamp) embed.setTimestamp();
    if (!embedData.footer)
      embed.setFooter({ text: interaction.client.user.username });

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [embed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } catch (error) {
      console.log('Error al responder una interaccion', error);
    }
  }
};
