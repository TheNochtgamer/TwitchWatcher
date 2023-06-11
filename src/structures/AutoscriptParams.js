const { CommandInteraction } = require('discord.js');
const Bot = require('./Client');
const Tmi = require('./Tmi');
const moment = require('moment');

module.exports = class AutoscriptParams {
  /**
   *
   * @param {Bot} bot
   * @param {Tmi} tmi
   * @param {CommandInteraction} interaction
   */
  constructor(bot, tmi, interaction) {
    this.client = bot;
    this.tmi = tmi;
    this.interaction = interaction;
    this.startMoment = moment();
  }
};
