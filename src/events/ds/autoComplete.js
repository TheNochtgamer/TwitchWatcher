const { Interaction } = require('discord.js');

module.exports = {
  name: 'interactionCreate',

  /**
   *
   * @param {Interaction} interaction
   */
  async run(interaction) {
    const client = interaction.client;
    if (!interaction.isAutocomplete()) return;

    const options = [];
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command)
      await interaction.respond([
        { name: 'Unknown Command Error', value: 'Error' },
      ]);

    try {
      options.push(
        await command.autoComplete(interaction.options.getFocused(true)),
      );
      if (!options.length) options.push({ name: 'Error', value: 'Error' });
      await interaction.respond(options.flat());
    } catch (error) {
      client.utils.log(
        `Hubo un error enviando un autocomplete del comando ${interaction.commandName}:`,
        error,
      );
      await interaction.respond([{ name: 'Error', value: 'Error' }]).catch();
    }
  },
};
