const { Interaction } = require('discord.js');

module.exports = {
  name: 'interactionCreate',

  /**
   *
   * @param {Interaction} interaction
   */
  async run(interaction) {
    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.log(`No se encontro el comando ${interaction.commandName}`);
      if (interaction.replied) return;
      interaction.reply({
        content:
          'Hubo un error interno 404 al intentar encontrar el comando\nPorfavor intenta mas tarde...',
        ephemeral: true,
      });
      return;
    }

    // --NCheckAuth--
    // Parametros en command files:
    // roles_req = String[]
    // perms_req = String[]
    // allRoles_req = Boolean
    // allPerms_req = Boolean
    // everthing_req = Boolean
    // onlyOwners = Boolean
    const pass = () => {
      if (process.env.BOT_OWNER?.includes(interaction.user.id)) return 1;
      if (command.onlyOwners) return 0;

      const all = command.everthing_req;
      const member = interaction.member;
      let notPass = 0;
      let checks = 0;

      if (command.roles_req) {
        checks++;
        if (!member.roles.cache.hasAny(...command.roles_req))
          if (all) {
            return 0;
          } else {
            notPass++;
          }
        if (
          !member.roles.cache.hasAll(...command.roles_req) &&
          command.allRoles_req
        )
          if (all) {
            return 0;
          } else {
            notPass++;
          }
      }
      if (command.perms_req) {
        checks++;
        let permPass = false;
        for (const perm of command.perms_req) {
          if (member.permissions.has(perm)) {
            permPass = true;
            if (!command.allPerms_req) {
              break;
            }
          } else {
            permPass = false;
            if (command.allPerms_req) break;
          }
        }
        if (!permPass) {
          if (all) {
            return 0;
          } else {
            notPass++;
          }
        }
      }

      if (notPass === checks && checks) return 0;
      return 1;
    };
    if (!pass()) {
      console.log(
        `(U) ${interaction.user.tag} intento acceder al comando "${interaction.commandName}" sin autorizacion`,
      );
      interaction.client.utils.embedReply(interaction, {
        color: 15548997,
        author: { name: '⛔Prohibido' },
        description:
          '```\n \n> ' +
          interaction.user.username +
          '\nNo tenes permisos para usar este comando.\n \n```',
      });
      return;
    }
    // --NCheckAuth--

    try {
      await command.run(interaction);
    } catch (error) {
      console.log(
        `Hubo un error ejecutando el comando ${interaction.commandName}:`,
        error,
      );
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply({
            content: 'Hubo un error interno al ejecutar el comando.',
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: 'Hubo un error interno al ejecutar el comando.',
            ephemeral: true,
          });
        }
      } catch (error) {}
    }
  },
};
