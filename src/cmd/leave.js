const {
  SlashCommandBuilder,
  CommandInteraction,
  PermissionFlagsBits,
} = require('discord.js');
const tmi = require('../services/twitchBot');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Expulsa el bot de un canal de twitch')
    .addStringOption(option =>
      option
        .setName('twitch')
        .setDescription('Canal de twitch para salir')
        .setAutocomplete(true)
        .setRequired(true),
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const twChannelName = interaction.options.get('twitch', true).value;
    if (!tmi.isJoined(twChannelName)) {
      await interaction.reply({ content: 'No estas unido a este canal' });
      return;
    }

    const res = await tmi.chLeave(twChannelName);
    if (!res) {
      await interaction.reply({
        content: 'Algo salio mal al intentar salirse del canal',
      });
      return;
    }
    await interaction.reply({
      content: `Canal "${twChannelName}" desconectado.`,
    });
  },
};
