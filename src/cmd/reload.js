const { SlashCommandBuilder, CommandInteraction } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Recarga los archivos')
    .setDefaultMemberPermissions(8),
  onlyOwners: true,

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const c = interaction.client;

    console.log(`(U) ${interaction.user.tag} esta recargando los archivos...`);
    await interaction.reply({
      ephemeral: true,
      content: `Recargando archivos, porfavor espera...`,
    });

    await Promise.allSettled([c.loadEvents(), c.loadCommands()]);
    await c.utils.summitCommands();

    await interaction.editReply({
      content: `Recarga de archivos terminada, resultados en la consola`,
    });
  },
};
