const { ActivityType } = require("discord.js");

module.exports = {
	name: "clientReady",
	once: true,
	execute(client) {
		client.user.setPresence({
			activities: [
				{
					name: "🔌AbaCord",
					type: ActivityType.Listening,
				},
			],
			status: "online",
		});
	},
};
