const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('innleveringManager').setDescription('Manages innlevering messages'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};