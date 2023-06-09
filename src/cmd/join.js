const {
  SlashCommandBuilder,
  CommandInteraction,
  PermissionFlagsBits,
} = require('discord.js');
const tmi = require('../services/twitchBot');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Une el bot a un canal de twitch')
    .addStringOption(option =>
      option
        .setName('twitch')
        .setDescription('Canal de twitch para conectar')
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
    if (tmi.isJoined(twChannelName)) {
      await interaction.reply({ content: 'Ya esta unido a este canal' });
      return;
    }

    const res = await tmi.chJoin(twChannelName);
    if (!res) {
      await interaction.reply({
        content: 'Algo salio mal al intentar unirse al canal',
      });
      return;
    }
    await interaction.reply({
      content: `Canal "${twChannelName}" conectado.`,
    });
  },
};
