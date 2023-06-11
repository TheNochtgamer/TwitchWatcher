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
        .setName('twchannel')
        .setDescription('Canal de twitch para salir')
        .setAutocomplete(true)
        .setRequired(true)
        .setMinLength(2),
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const twChannelName = interaction.options.get('twchannel', true).value;
    if (!tmi.isJoined(twChannelName)) {
      await interaction.reply({
        content: 'No estas unido a este canal',
        ephemeral: true,
      });
      return;
    }

    const res = await tmi.chLeave(twChannelName);
    if (!res) {
      await interaction.reply({
        content: 'Algo salio mal al intentar salirse del canal',
        ephemeral: true,
      });
      return;
    }
    await interaction.reply({
      content: `Canal "${twChannelName}" desconectado.`,
    });
  },

  autoComplete(focused) {
    return tmi.connectedChannels
      .map(({ name }) => name)
      .filter(twChName => twChName.startsWith(focused.value))
      .map(twChName => {
        return {
          name: twChName,
          value: twChName,
        };
      });
  },
};
