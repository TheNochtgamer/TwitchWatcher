const {
  SlashCommandBuilder,
  CommandInteraction,
  PermissionFlagsBits,
} = require('discord.js');
const bot = require('../services/discordBot');
const AutoscriptParams = require('../structures/AutoscriptParams');
const tmi = require('../services/twitchBot');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoscript')
    .setDescription('Comando para cargar un script de la carpeta ./scripts')
    .addSubcommand(sub =>
      sub
        .setName('run')
        .setDescription('Ejecuta un script pre-cargado')
        .addStringOption(opt =>
          opt
            .setName('script')
            .setDescription('Nombre del script a cargar')
            .setRequired(true)
            .setMinLength(2)
            .setAutocomplete(true),
        ),
    )
    .addSubcommand(sub =>
      sub.setName('reload').setDescription('Recarga los scripts pre-cargados'),
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async run(interaction) {
    const subCommand = interaction.options.getSubcommand();

    switch (subCommand) {
      case 'run': {
        const scriptName = interaction.options.get('script', true).value;

        const script = bot.scripts.get(scriptName);
        if (!script) {
          await interaction.reply({
            content: `No se encontro el script "${scriptName}"`,
            ephemeral: true,
          });
          return;
        }

        await interaction.reply({
          content: `Script: ${script.name}`,
          ephemeral: script.ephemeral,
        });

        try {
          await script.run(new AutoscriptParams(bot, tmi, interaction));
        } catch (error) {
          console.log(
            `Hubo un error ejecutando el script ${script.name}:`,
            error,
          );
          await interaction.editReply({
            content: `Script: ${script.name}\nTuvo un error interno...`,
          });
        }

        break;
      }
      case 'reload':
        await interaction.reply({
          content: `Recargando scripts, espera...`,
          ephemeral: true,
        });
        await bot.loadScripts();
        await interaction.editReply({
          content: `Scripts recargados, resultados en la consola.`,
        });
        break;
    }
  },

  autoComplete(focused) {
    return bot.scripts
      .filter(script => script.name.startsWith(focused.value))
      .map(({ name }) => {
        return {
          name,
          value: name,
        };
      });
  },
};
