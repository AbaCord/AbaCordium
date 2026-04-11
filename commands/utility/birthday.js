const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('birthday')
		.setDescription('Birthday system stuff'),
  
  .addSubcommand(sub =>
      sub
        .setName('set')
        .setDescription('Set birthday')
        .addUserOption(option =>
          option.setName('date')
            .setDescription('Input date')
            .setRequired(true)
        )
    )
    
	async execute(interaction) {
		await interaction.reply('Pong!').catch(() => { });
	},
};
