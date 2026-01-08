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
const filePath = path.resolve(__dirname, "../data/innleveringer.json");

async function updateMessage(client, messageId, channelId, filePath) {
	try {
		let channel;

		try {
			channel = await client.channels.fetch(channelId);
		} catch (e) {
			console.error(e);
			return;
		}

		if (!fs.existsSync(filePath)) {
			console.error("File does not exist");
			return;
		}

		const fileData = fs.readFileSync(filePath, "utf-8");
		let data;

		try {
			data = JSON.parse(fileData);
		} catch (e) {
			console.error("Could not Pare file", e);
			return;
		}

		let message;

		try {
			message = await channel.messages.fetch(messageId);
		} catch (e) {
			console.error("Could not fetch message", e);
			return;
		}

		// Bygger melding

		const container = new ContainerBuilder();

		for (const kode in data) {
			try {
				const emne = data[kode];
				const type = emne.type;

				const header = new TextDisplayBuilder().setContent(`### ${kode}: ${emne.navn}`);

				container.addTextDisplayComponents(header);

				for (const typeObj in type)
					try {
						const info = type[typeObj];
						const fristRaw = info.frist;
						let frist = dayjs(fristRaw, "DD-MM-YYYY", true);

						let hours = 0;
						let minutes = 0;

						const parts = info.kl.split(":").map(Number);

						if (parts.length === 2) {
							hours = parts[0];
							minutes = parts[1];
						} else {
						}

						frist = frist.add(hours, "hour").add(minutes, "minute");

						const antall = info.antall;
						const frekvens = info.frekvens;
						const link = info.link;

						let nummer = 1;
						const now = dayjs();

						// TDT4109
						if (kode === "TDT4109") {
							for (; nummer <= antall; nummer++) {
								if (now.isAfter(frist)) {
									try {
										if (
											(typeObj === "Demotrasjon" && (nummer === 2 || nummer === 5)) ||
											(typeObj === "Øving" && (nummer === 3 || nummer === 6))
										) {
											frist = frist.add(frekvens * 7, "day");
										}
										frist = frist.add(frekvens * 7, "day");
									} catch (e) {
										console.error(e);
										break;
									}
								} else {
									break;
								}
							}
						} else {
							for (; nummer <= antall; nummer++) {
								if (now.isAfter(frist)) {
									try {
										frist = frist.add(frekvens * 7, "day");
									} catch (e) {
										console.error(e);
										break;
									}
								} else {
									break;
								}
							}
						}

						if (now.isBefore(frist)) {
							try {
								const text = new TextDisplayBuilder().setContent(
									`${kode}: **${typeObj.toUpperCase()} ${nummer}**`
								);
								const deadline = new TextDisplayBuilder().setContent(
									`Frist: ${frist.format("D. MMM HH:mm")} - ${dayjsToDiscord(frist, "R")}`
								);

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
							}
						}
					} catch (e) {
						console.error(e);
					}
			} catch (e) {console.error(e)}
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
			setInterval(function() {updateMessage(client, messageId, channelId, filePath)}, 1000*3600);
		} catch (e) {
			console.error(e);
		}
	},
};
