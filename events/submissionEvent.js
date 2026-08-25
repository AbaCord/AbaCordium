const sf = require("../utils/submissionFunctions.js");

module.exports = {
	name: "clientReady",
	once: true,
	async execute(client) {
		try {
			sf.updateMessageType(client, "2"); // Call the function once when the bot starts
			setInterval(function () {
				sf.updateMessageType(client, "2");
			}, 1000 * 3600); // 3600 (1 hour)
		} catch (e) {
			console.error(`submissionEvent.js: Error in clientReady event:`, e);
		}
	},
};
