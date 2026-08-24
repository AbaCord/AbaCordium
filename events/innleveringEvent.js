const fs = require("fs");
const path = require("path");
const {
	TextDisplayBuilder,
	SectionBuilder,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	SeparatorBuilder,
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

const idsPath = "../data/innlevering/innleveringMessages.json";
const firstPath = "../data/innlevering/innlevering1.json";
const secondPath = "../data/innlevering/innlevering2.json";
const thirdPath = "../data/innlevering/innlevering3.json";
const fourthPath = "../data/innlevering/innlevering4.json";
const fifthPath = "../data/innlevering/innlevering5.json";

async function getData(filePath) {
	const file = path.resolve(__dirname, filePath);

	if (!fs.existsSync(file)) {
		// console.error(`InnleveringEvent.js: File not found: ${file}`);
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
		// console.error(`InnleveringEvent.js: Error fetching message ${messageId} in channel ${channelId}:`, e);
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

			const header = new TextDisplayBuilder().setContent(`# ${kode}: ${emne.navn}`);

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

							const parts = item.kl.split(":").map(Number);

							if (parts.length === 2) {
								hours = parts[0];
								minutes = parts[1];
							}

							frist = frist.add(hours, "hour").add(minutes, "minute");

							if (!now.isBefore(frist) || now.add(4, "week").isBefore(frist)) {
								// Shows only assignments that are due in the next 4 weeks
								continue;
							}

							const text = new TextDisplayBuilder().setContent(`
								### **${typeObj.toUpperCase()} ${item.nummer ? item.nummer : ""}**
								${frist.format("D. MMM HH:mm")} - ${dayjsToDiscord(frist, "R")}
								`);

							const link = item.link;

							const button = new ButtonBuilder().setLabel("link").setStyle(ButtonStyle.Link);

							if (
								typeof link === "string" &&
								(link.startsWith("http://") || link.startsWith("https://"))
							) {
								button.setURL(link);
							} else {
								button.setURL("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
							}

							const section = new SectionBuilder()
								.addTextDisplayComponents(text)
								.setButtonAccessory(button);

							container.addSectionComponents(section);
							break;
						} catch (e) {
							console.error(`InnleveringEvent.js: Error processing item for ${kode} - ${typeObj}:`, e);
							return null;
						}
					}
				} catch (e) {
					console.error(`InnleveringEvent.js: Error processing type for ${kode} - ${typeObj}:`, e);
					return null;
				}

			container.addSeparatorComponents(new SeparatorBuilder());
		} catch (e) {
			console.error(`InnleveringEvent.js: Error processing kode ${kode}:`, e);
			return null;
		}
	}
	return container;
}

async function updateMessage(
	client,
	idsPath,
	firstPath,
	secondPath,
	thirdPath,
	fourthPath,
	fifthPath,
) {
	console.log("Updating message hourly: Innlevering");
	try {
		const ids = await getData(idsPath);

		if (!ids) {
			console.error(`InnleveringEvent.js: IDs not found`);
			return;
		}

		for (const year in ids) {
			const yearData = ids[year];

			let data;

			switch (year) {
				case "1":
					data = await getData(firstPath);
					break;
				case "2":
					data = await getData(secondPath);
					break;
				case "3":
					data = await getData(thirdPath);
					break;
				case "4":
					data = await getData(fourthPath);
					break;
				case "5":
					data = await getData(fifthPath);
					break;
				default:
					continue;
			}

			if (!data) {
				console.error(`InnleveringEvent.js: Data not found for year ${year}`);
				return;
			}

			const container = await buildMessage(data);

			if (!container) {
				console.error(`InnleveringEvent.js: Container not built for year ${year}`, e);
				return;
			}

			for (const entry of yearData) {
				const {messageId, channelId} = entry;

				const message = await getMessage(client, messageId, channelId);

				if (!message) {
					return;
				}

				try {
					await message.edit({components: [container]});
				} catch (e) {
					console.error(`InnleveringEvent.js: Error editing message for year ${year}:`, e);
					return;
				}
			}
		}
	} catch (e) {
		console.error(`InnleveringEvent.js: Error updating message:`, e);
	}
}

module.exports = {
	name: "clientReady",
	once: true,
	async execute(client) {
		try {
			updateMessage(client, idsPath, firstPath, secondPath, thirdPath, fourthPath, fifthPath); // Call the function once when the bot starts
			setInterval(function () {
				updateMessage(client, idsPath, firstPath, secondPath, thirdPath, fourthPath, fifthPath);
			}, 1000 * 3600); // 3600 (1 hour)
		} catch (e) {
			console.error(`InnleveringEvent.js: Error in clientReady event:`, e);
		}
	},
};
