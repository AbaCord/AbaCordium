const { SlashCommandBuilder, MessageFlags, TextDisplayBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder().setName("sendmessage").setDescription("Sender IsComponentsV2 melding").setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		const text = new TextDisplayBuilder().setContent(
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
		);

		try {
			const m = await interaction.reply({ content: "._.", flags: MessageFlags.Ephemeral });
			m.delete();

			await interaction.channel.send({
			components: [text],
			flags: MessageFlags.IsComponentsV2,
		});
		} catch {}
	},
};
