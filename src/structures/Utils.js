const path = require('path');
const fs = require('fs');
const { EmbedBuilder } = require('discord.js');

module.exports = class Utils {
  constructor(client) {
    this.client = client;
  }

  async loadFiles(dirName) {
    const PATH = path.join(__dirname, '../', dirName);
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
    if (!this.client.commands.size) return;
    let cmds = null;

    console.log('Subiendo comandos...');
    try {
      if (guildId) {
        if (!this.client.utils.checkId(guildId)) throw new Error('Id invalida');
        const GUILD = this.client.guilds.cache.get(guildId);
        cmds = await GUILD.commands.set(this.client.commands);
      } else {
        cmds = await this.client.application.commands.set(this.client.commands);
      }
      if (!cmds) throw new Error('No se subio ningun comando');
      console.log(`(/) ${cmds.size} comandos subidos`);
    } catch (error) {
      console.log('Error al intentar subir los comandos', error);
    }
  }

  async notAuthorizedReply(interaction) {
    const embed = new EmbedBuilder()
      .setColor('Red')
      .setAuthor({ name: '⛔Prohibido' })
      .setDescription(
        '```_ _\n' +
          interaction.user.username +
          '\nNo tenes permisos para usar este comando.\n_ _```',
      )
      .setTimestamp()
      .setFooter({ text: interaction.client.user.username });

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [embed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } catch (error) {
      console.log('Error al responder una interaccion no authorizada', error);
    }
  }
};
