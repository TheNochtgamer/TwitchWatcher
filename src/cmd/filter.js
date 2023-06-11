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
            .setName('filtroName')
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
              'Los canales de twitch a los que quieras adjuntar el filtro (separados por ,)',
            )
            .setRequired(true)
            .setAutocomplete(true)
            .setMinLength(2),
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
            .setName('filtroName')
            .setDescription('El filtro a eliminar')
            .setRequired(true)
            .setAutocomplete(true)
            .setMinLength(2),
        ),
    )
    .addSubcommand(sub =>
      sub
        .setName('linkchannel')
        .setDescription('Adjunta un filtro a un canal de twitch')
        .addStringOption(opt =>
          opt
            .setName('filtroName')
            .setDescription('El filtro a adjuntar')
            .setRequired(true)
            .setAutocomplete(true)
            .setMinLength(2),
        )
        .addStringOption(opt =>
          opt
            .setName('twchannel')
            .setDescription('El canal de twitch que quieras adjuntar al filtro')
            .setRequired(true)
            .setAutocomplete(true)
            .setMinLength(2),
        ),
    )
    .addSubcommand(sub =>
      sub
        .setName('unlinkchannel')
        .setDescription('Separa un filtro de un canal de twitch')
        .addStringOption(opt =>
          opt
            .setName('filtroName')
            .setDescription('El filtro a separar')
            .setRequired(true)
            .setAutocomplete(true)
            .setMinLength(2),
        )
        .addStringOption(opt =>
          opt
            .setName('twchannelfil')
            .setDescription('El canal de twitch que quieras separar del filtro')
            .setRequired(true)
            .setAutocomplete(true)
            .setMinLength(2),
        ),
    ),
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const subCommand = interaction.options.getSubcommand();
    /** @type {String} */
    const filtroName = interaction.options.get('filtroName', true).value;

    // if (!tmi.twConnectedChannels[0]?.name) {
    //   await interaction.reply({
    //     content: 'No estas unido a ningun canal, unete usando /join',
    //     ephemeral: true,
    //   });
    //   return;
    // }

    switch (subCommand) {
      case 'add': {
        /** @type {String} */
        const twChannelsName = interaction.options.get('twchannels')?.value;
        const flags = interaction.options.get('flags')?.value;
        const inverted = interaction.options.get('inverted')?.value;
        const dsTarget = interaction.options.get('dschannel')?.channel;
        let filtro = interaction.options.get('filtro')?.value;

        const twChannelNames = twChannelsName.split(',').filter(twCh => twCh);

        if (filtro?.toLowerCase() === 'all') filtro = '';
        const dsChannel = dsTarget?.isTextBased() ? dsTarget : null;
        const res = Filter.validateRegex(filtro, flags);
        if (res instanceof Error) {
          await interaction.reply({
            content: 'Filtro invalido:\n```' + res.message + '```',
            ephemeral: true,
          });
          return;
        }
        if (tmi.filters.some(filter => filter.name === filtroName)) {
          await interaction.reply({
            content: 'Ya existe un filtro con ese nombre',
            ephemeral: true,
          });
          return;
        }
        const filter = new Filter(
          filtroName,
          res,
          dsChannel,
          twChannelNames,
          inverted,
        );
        tmi.filters.push(filter);

        await interaction.reply({
          content:
            `Filtro "${filtroName}" creado.\n` +
            '```\n' +
            filter.regExp +
            '```',
        });
        break;
      }
      case 'delete': {
        const filtroIndx = tmi.filters.findIndex(
          filter => filter.name === filtroName,
        );
        if (filtroIndx === -1) {
          await interaction.reply({
            content: `No existe el filtro "${filtroName}"`,
            ephemeral: true,
          });
          return;
        }
        tmi.filters.splice(filtroIndx, 1);
        await interaction.reply({
          content: `"${filtroName}" filtro eliminado`,
        });
        break;
      }
      case 'linkchannel': {
        const filtro = tmi.filters.find(filtro => filtro.name === filtroName);
        const twchannel = interaction.options.get('twchannel', true).value;

        if (!filtro) {
          await interaction.reply({
            content: `No existe el filtro "${filtroName}"`,
            ephemeral: true,
          });
          return;
        }
        if (
          !twchannel ||
          !tmi.connectedChannels.some(twconnect => twconnect.name === twchannel)
        ) {
          await interaction.reply({
            content: `No existe el canal "${twchannel}"`,
            ephemeral: true,
          });
          return;
        }
        if (filtro.twChannels.some(twchannel2 => twchannel2 === twchannel)) {
          await interaction.reply({
            content: `El filtro ya tiene este canal adjuntado "${twchannel}"`,
            ephemeral: true,
          });
          return;
        }

        filtro.twChannels.push(twchannel);

        await interaction.reply({
          content: `Filtro "${filtroName}" adjuntado al canal "${twchannel}"`,
        });
        break;
      }
      case 'unlinkchannel': {
        const filtro = tmi.filters.find(filtro => filtro.name === filtroName);
        const twchannel = interaction.options.get('twchannelfil', true).value;

        if (!filtro) {
          await interaction.reply({
            content: `No existe el filtro "${filtroName}"`,
            ephemeral: true,
          });
          return;
        }
        if (
          !twchannel ||
          !tmi.connectedChannels.some(twconnect => twconnect.name === twchannel)
        ) {
          await interaction.reply({
            content: `No existe el canal "${twchannel}"`,
            ephemeral: true,
          });
          return;
        }
        if (!filtro.twChannels.some(twchannel2 => twchannel2 === twchannel)) {
          await interaction.reply({
            content: `El filtro no tenia este canal adjuntado "${twchannel}"`,
            ephemeral: true,
          });
          return;
        }

        filtro.twChannels.splice(
          filtro.twChannels.findIndex(twchannel2 => twchannel2 === twchannel),
          1,
        );

        await interaction.reply({
          content: `Filtro "${filtroName}" separado del canal "${twchannel}"`,
        });

        break;
      }
    }
  },

  /**
   *
   * @param {import('discord.js').AutocompleteFocusedOption} focused
   * @param {import('discord.js').AutocompleteInteraction} interaction
   */
  autoComplete(focused, interaction) {
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
      case 'twchannels':
        return tmi.connectedChannels
          .map(({ name }) => name)
          .filter(twChName => twChName.startsWith(focused.value))
          .map(twChName => {
            return {
              name: twChName + ',',
              value: twChName,
            };
          });
      case 'twchannel': {
        const filtroName = interaction.options.get('filtroName')?.value;
        const filtro = tmi.filters.find(filtro => filtro.name === filtroName);

        return tmi.connectedChannels
          .map(({ name }) => name)
          .filter(
            twChName =>
              twChName.startsWith(focused.value) &&
              (!filtro
                ? true
                : !filtro.twChannels.some(twChName2 => twChName2 === twChName)),
          )
          .map(twChName => {
            return {
              name: twChName,
              value: twChName,
            };
          });
      }
      case 'twchannelfil': {
        const filtroName = interaction.options.get('filtroName')?.value;
        const filtro = tmi.filters.find(filtro => filtro.name === filtroName);

        if (!filtro)
          return {
            name: 'Invalid filter name',
            value: 'Error',
          };
        return filtro.twChannels
          .filter(twChName => twChName.startsWith(focused.value))
          .map(twChName => {
            return {
              name: twChName,
              value: twChName,
            };
          });
      }
    }
  },
};
