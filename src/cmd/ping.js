const { SlashCommandBuilder, CommandInteraction } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Un comando que hace ping'),

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    console.log(`${interaction.user.tag} hizo ping`);
    await interaction.reply({
      ephemeral: true,
      content: `Pong! ${interaction.client.ws.ping}ms`,
    });
  },
};
