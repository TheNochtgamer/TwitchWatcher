const {
  SlashCommandBuilder,
  CommandInteraction,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js');
const tmi = require('../services/twitchBot');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('log')
    .setDescription('Comando para manejar los logs en los canales')
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addSubcommand(sub =>
      sub
        .setName('add')
        .setDescription('Agrega este canal como log de un filtro')
        .addStringOption(opt =>
          opt
            .setName('filtroName')
            .setDescription('El filtro a adjuntar')
            .setRequired(true)
            .setAutocomplete(true)
            .setMinLength(2),
        )
        .addChannelOption(opt =>
          opt
            .setName('dschannel')
            .setDescription(
              'El canal de discord para añadirle el filtro (default: este mismo)',
            )
            .addChannelTypes(
              ChannelType.GuildText,
              ChannelType.GuildVoice,
              //   ChannelType.PublicThread,
              //   ChannelType.PrivateThread,
            ),
        ),
    )
    .addSubcommand(sub =>
      sub
        .setName('delete')
        .setDescription('Elimina un filtro de un canal de discord')
        .addStringOption(opt =>
          opt
            .setName('filtroName')
            .setDescription('El filtro a eliminar del canal')
            .setRequired(true)
            .setAutocomplete(true)
            .setMinLength(2),
        )
        .addChannelOption(opt =>
          opt
            .setName('dschannel')
            .setDescription(
              'El canal de discord para separar del filtro (default: este mismo)',
            )
            .addChannelTypes(
              ChannelType.GuildText,
              ChannelType.GuildVoice,
              //   ChannelType.PublicThread,
              //   ChannelType.PrivateThread,
            ),
        ),
    ),

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const subCommand = interaction.options.getSubcommand();
    const filtroName = interaction.options.get('filtroName', true).value;
    const dsTarget = interaction.options.get('dschannel')?.channel;
    const dsChannel = dsTarget ?? interaction.channel;

    const filtro = tmi.filters.find(filter => filter.name === filtroName);

    if (!filtro) {
      await interaction.reply({
        content: `No existe el filtro "${filtroName}"`,
        ephemeral: true,
      });
      return;
    }

    switch (subCommand) {
      case 'add': {
        if (filtro.dsChannels.some(dsChannel2 => dsChannel2 === dsChannel)) {
          await interaction.reply({
            content: 'Ya se estaba logueando este filtro en este canal',
            ephemeral: true,
          });
          return;
        }

        filtro.dsChannels.push(dsChannel);

        await interaction.reply({
          content: `Filtro "${filtroName}" añadido a${
            dsTarget ? `l canal ${dsTarget.name}` : ` este canal`
          }.`,
        });
        break;
      }
      case 'delete': {
        if (!filtro.dsChannels.some(dsChannel2 => dsChannel2 === dsChannel)) {
          await interaction.reply({
            content: 'No se estaba logueando este filtro en este canal',
            ephemeral: true,
          });
          return;
        }

        filtro.dsChannels.splice(
          filtro.dsChannels.findIndex(dsChannel2 => dsChannel2 === dsChannel),
          1,
        );

        await interaction.reply({
          content: `Filtro "${filtroName}" eliminado de${
            dsTarget ? `l canal ${dsTarget.name}` : ` este canal`
          }.`,
        });
        break;
      }
    }
  },

  /**
   *
   * @param {import('discord.js').AutocompleteFocusedOption} focused
   */
  autoComplete(focused) {
    switch (focused.name) {
      case 'filtroName':
        return tmi.filters
          .filter(filter => filter.name.startsWith(focused.value))
          .map(filter => {
            return {
              name: filter.name,
              value: filter.name,
            };
          });
    }
  },
};
