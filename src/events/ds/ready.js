module.exports = {
  name: 'ready',

  run(client) {
    client.utils.log('Bot online como', client.user.tag);

    client.utils.summitCommands();
  },
};
