const { SlashCommandBuilder } = require('discord.js');

const answers = [
    "It is certain.",
    "Without a doubt.",
    "You may rely on it.",
    "Ask again later.",
    "Cannot predict now.",
    "Don't count on it.",
    "My sources say no.",
    "Very doubtful."
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('magicball')
        .setDescription('Get a random Magic 8-Ball answer!'),
    
    async execute(interaction) {
        // Delete the user's slash command message (works in guilds)
        if (interaction.channel) {
            const fetched = await interaction.channel.messages.fetch(interaction.id).catch(() => null);
            if (fetched) fetched.delete().catch(() => {});
        }

        // Pick a random answer
        const response = answers[Math.floor(Math.random() * answers.length)];

        // Reply in the channel
        await interaction.reply(response);
    }
};
