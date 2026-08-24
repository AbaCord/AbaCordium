const fs = require("fs");
const path = require("path");
const {
	TextDisplayBuilder,
	SectionBuilder,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
} = require("discord.js");

const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const customParseFormat = require("dayjs/plugin/customParseFormat");

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

// Set default timezone
dayjs.tz.setDefault("Europe/Oslo");

const dayjsToDiscord = (date, format = "F") => `<t:${Math.floor(date.valueOf() / 1000)}:${format}>`;

const channelId = "1418137268270399558";
const messageId = "1421186681305956362";
const filePath = "../data/innleveringer.json";

async function getInnleveringer(filePath) {
	const file = path.resolve(__dirname, filePath);

	if (!fs.existsSync(file)) {
		console.error("File does not exist");
		return null;
	}

	try {
		const fileData = fs.readFileSync(file, "utf-8");
		return JSON.parse(fileData);
	} catch (e) {
		console.error("Could not parse file", e);
		return null;
	}
}

async function getMessage(client, messageId, channelId) {
	try {
		const channel = await client.channels.fetch(channelId);
		const message = await channel.messages.fetch(messageId);
		return message;
	} catch (e) {
		console.error("Could not fetch message", e);
		return null;
	}
}

async function buildMessage(data) {
	const container = new ContainerBuilder();
	const now = dayjs();

	for (const kode in data) {
		try {
			const emne = data[kode];
			const type = emne.type;

			const header = new TextDisplayBuilder().setContent(`### ${kode}: ${emne.navn}`);

			container.addTextDisplayComponents(header);

			for (const typeObj in type)
				try {
					const info = type[typeObj];

					for (const item of info) {
						try {
							const fristRaw = item.frist;
							let frist = dayjs(fristRaw, "DD-MM-YYYY", true);

							let hours = 0;
							let minutes = 0;

							const parts = info.kl.split(":").map(Number);

							if (parts.length === 2) {
								hours = parts[0];
								minutes = parts[1];
							}

							frist = frist.add(hours, "hour").add(minutes, "minute");

							if (!now.isBefore(frist)) {
								continue;
							}

							const text = new TextDisplayBuilder().setContent(
								`${kode}: **${typeObj.toUpperCase()} ${item.nummer ? item.nummer : ""}**`,
							);

							const deadline = new TextDisplayBuilder().setContent(
								`Frist: ${frist.format("D. MMM HH:mm")} - ${dayjsToDiscord(frist, "R")}`,
							);

							const link = item.link;

							const button = new ButtonBuilder().setLabel("link").setStyle(ButtonStyle.Link);

							if (link) {
								button.setURL(link);
							}

							const section = new SectionBuilder()
								.addTextDisplayComponents(text, deadline)
								.setButtonAccessory(button);
							container.addSectionComponents(section);
						} catch (e) {
							console.error(e);
							return null;
						}
					}
				} catch (e) {
					console.error(e);
					return null;
				}
		} catch (e) {
			console.error(e);
			return null;
		}
	}
	return container;
}

async function updateMessage(client, messageId, channelId, filePath) {
	try {
		const message = await getMessage(client, messageId, channelId);

		if (!message) {
			console.error("Message not found");
			return;
		}

		const data = await getInnleveringer(filePath);

		if (!data) {
			console.error("Data not found");
			return;
		}

		// Bygger melding

		const container = await buildMessage(data);

		if (!container) {
			console.error("Container not built");
			return;
		}

		try {
			await message.edit({components: [container]});
		} catch (e) {
			console.error(e);
		}
	} catch (e) {
		console.error(e);
	}
}

module.exports = {
	name: "clientReady",
	once: true,
	async execute(client) {
		try {
			setInterval(function () {
				updateMessage(client, messageId, channelId, filePath);
			}, 1000 * 3600);
		} catch (e) {
			console.error(e);
		}
	},
};
