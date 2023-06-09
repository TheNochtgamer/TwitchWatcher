const {
  SlashCommandBuilder,
  CommandInteraction,
  PermissionFlagsBits,
  ChannelType,
} = require('discord.js');
const tmi = require('../services/twitchBot');
const Filter = require('../structures/Filter');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('filter')
    .setDescription('Añadir un canal como un filtro de mensajes y los loguea')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addSubcommand(sub =>
      sub
        .setName('add')
        .setDescription('Añadir un filtro')
        .addStringOption(opt =>
          opt
            .setName('filtroname')
            .setDescription('El nombre que tendra el filtro (debe ser unico)')
            .setRequired(true)
            .setMinLength(2),
        )
        .addStringOption(opt =>
          opt
            .setName('filtro')
            .setDescription(
              'La expresion regular a usar como filtro (o usar "all")',
            )
            .setRequired(true),
        )
        .addStringOption(opt =>
          opt
            .setName('twchannels')
            .setDescription(
              'Los canales de twitch en los que funcionara el filtro (separados por ,)',
            )
            .setRequired(true)
            .setAutocomplete(true),
        )
        .addChannelOption(opt =>
          opt
            .setName('dschannel')
            .setDescription('El canal de discord para añadir (opcional)')
            .addChannelTypes(
              ChannelType.GuildText,
              ChannelType.GuildVoice,
              //   ChannelType.PublicThread,
              //   ChannelType.PrivateThread,
            ),
        )
        .addStringOption(opt =>
          opt
            .setName('flags')
            .setDescription('Banderas de la expresion regular'),
        )
        .addBooleanOption(opt =>
          opt
            .setName('inverted')
            .setDescription(
              'Si queres que se logueen todos los mensajes que no se filtren por la expresion regular',
            ),
        ),
    )
    .addSubcommand(sub =>
      sub
        .setName('delete')
        .setDescription('Eliminar un filtro')
        .addStringOption(opt =>
          opt
            .setName('filtroname')
            .setDescription('El filtro a eliminar')
            .setRequired(true)
            .setAutocomplete(true),
        ),
    ),
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const subCommand = interaction.options.getSubcommand();
    /** @type {String} */
    const filtroname = interaction.options.get('filtroname', true).value;

    let filtro = interaction.options.get('filtro')?.value;
    const dsTarget = interaction.options.get('dschannel')?.channel;
    const twChannelsName = interaction.options.get('twchannels')?.value;
    const flags = interaction.options.get('flags')?.value;
    const inverted = interaction.options.get('inverted')?.value;

    // if (!tmi.twConnectedChannels[0]?.name) {
    //   await interaction.reply({
    //     content: 'No estas unido a ningun canal, unete usando /join',
    //     ephemeral: true,
    //   });
    //   return;
    // }

    switch (subCommand) {
      case 'add': {
        if (filtro?.toLowerCase() === 'all') filtro = '';
        const dsChannel = dsTarget?.isTextBased()
          ? dsTarget
          : interaction.channel;
        const res = Filter.validateRegex(filtro, flags);
        if (res instanceof Error) {
          await interaction.reply({
            content: 'Filtro invalido:\n```' + res.message + '```',
            ephemeral: true,
          });
          return;
        }
        if (tmi.filters.some(filter => filter.name === filtroname)) {
          await interaction.reply({
            content: 'Ya existe un filtro con ese nombre',
            ephemeral: true,
          });
          return;
        }
        const filter = new Filter(
          filtroname,
          res,
          dsChannel,
          twChannelsName.split(',').filter(twCh => twCh),
          inverted,
        );
        tmi.filters.push(filter);

        await interaction.reply({
          content: `Filtro "${filtroname}" añadido a el canal ${dsChannel}`,
        });
        break;
      }
      case 'delete': {
        const filtroIndx = tmi.filters.findIndex(
          filter => filter.name === filtroname,
        );
        if (filtroIndx === -1) {
          await interaction.reply({
            content: `No existe el filtro "${filtroname}"`,
          });
          return;
        }
        tmi.filters.splice(filtroIndx, 1);
        await interaction.reply({
          content: `"${filtroname}" filtro eliminado`,
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
      case 'filtroname':
        return tmi.filters.map(filter => {
          return {
            name: `${filter.name} #${filter.dsChannel.name}`,
            value: filter.name,
          };
        });
      case 'twchannels':
        return tmi.twConnectedChannels
          .map(({ name }) => name)
          .filter(twChName => twChName.startsWith(focused.value))
          .map(twChName => {
            return {
              name: twChName + ',',
              value: twChName,
            };
          });
    }
  },
};
