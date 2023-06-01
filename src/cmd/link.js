const {
  SlashCommandBuilder,
  CommandInteraction,
  ChannelType,
} = require('discord.js');
const tmi = require('../services/twitchBot');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('Linkea este canal a un canal de twitch')
    .addStringOption(option =>
      option
        .setName('twitch')
        .setDescription('Canal de twitch para conectar')
        .setRequired(true),
    )
    .addChannelOption(option =>
      option
        .setName('canal')
        .setDescription('El canal a linkear')
        .addChannelTypes(
          ChannelType.GuildText,
          ChannelType.PublicThread,
          ChannelType.PrivateThread,
        ),
    )
    .setDMPermission(false),

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const twitchChannel = interaction.options.get('twitch', true).value;
    const dsChannel = interaction.options.get('canal')?.channel;

    const target = dsChannel ?? interaction.channel;

    if (
      ![
        ChannelType.GuildText,
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
      ].includes(target?.type)
    ) {
      interaction.client.utils.embedReply(interaction, {
        color: 15548997,
        author: { name: 'Canal invalido' },
        description:
          '```\n \n' + target?.name + ' no es un canal valido\n \n```',
      });
      return;
    }

    await target.fetch();

    const res = await tmi.link(target, twitchChannel);
    if (res) {
      switch (res) {
        case 1:
          await interaction.reply({ content: 'Algo salio mal...' });
          break;
        case 2:
          interaction.client.utils.embedReply(interaction, {
            color: 15548997,
            author: { name: 'Ya esta linkeado' },
            description:
              '```\n \nEl canal de twitch o el canal de discord ya esta linkeado\n \n```',
          });
          break;
      }
      return;
    }

    interaction.client.utils.embedReply(interaction, {
      author: { name: 'Canal conectado' },
      description: `A partir de ahora deberias empezar a recibir el chat del canal "${twitchChannel}" en <#${target.id}>`,
    });
  },
};
