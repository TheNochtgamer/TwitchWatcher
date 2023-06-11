const AutoscriptParams = require('../src/structures/AutoscriptParams');
// const moment = require('moment');

module.exports = {
  name: 'test',

  /**
   *
   * @param {AutoscriptParams} param0
   */
  async run({ client, tmi, interaction, startMoment }) {
    console.log('Test Script ejecutado');

    await interaction.editReply({
      content:
        'Este es un script de pruebas que tiene acceso al objeto de twitch y discord, prueba modificandolo.',
    });
  },
};
