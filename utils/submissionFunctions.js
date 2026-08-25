import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
    TextDisplayBuilder,
    SectionBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    SeparatorBuilder,
} from "discord.js";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

const dayjsToDiscord = (date, format = "F") => `<t:${Math.floor(date.valueOf() / 1000)}:${format}>`;

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

// Set default timezone
dayjs.tz.setDefault("Europe/Oslo");


const idsPath = "../data/submission/submissionMessages.json";
const firstPath = "../data/submission/submission1.json";
const secondPath = "../data/submission/submission2.json";
const thirdPath = "../data/submission/submission3.json";
const fourthPath = "../data/submission/submission4.json";
const fifthPath = "../data/submission/submission5.json";

export async function getData(filePath) {
	const file = path.resolve(__dirname, filePath);

	if (!fs.existsSync(file)) {
		console.error(`submissionEvent.js: File not found: ${file}`); // Debugging log
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
		// console.error(`submissionEvent.js: Error fetching message ${messageId} in channel ${channelId}:`, e); // Debugging log
		return null;
	}
}

export async function buildMessage(data) {
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
							console.error(`submissionEvent.js: Error processing item for ${kode} - ${typeObj}:`, e);
							return null;
						}
					}
				} catch (e) {
					console.error(`submissionEvent.js: Error processing type for ${kode} - ${typeObj}:`, e);
					return null;
				}

			container.addSeparatorComponents(new SeparatorBuilder());
		} catch (e) {
			console.error(`submissionEvent.js: Error processing kode ${kode}:`, e);
			return null;
		}
	}
	return container;
}

export async function storeMessageId(year, messageId, channelId) {
	try {
		const ids = await getData(idsPath) || {};
		ids[year] = ids[year] || [];
		ids[year].push({ messageId, channelId });
		await setData(idsPath, ids);
	} catch (e) {
		console.error(`submissionFunctions.js: Error storing message ID for year ${year}:`, e);
	}
}

async function setData(filePath, data) {
	const file = path.resolve(__dirname, filePath);
	await fs.writeFile(file, JSON.stringify(data));
}

export async function updateMessageType(
	client,
  year
) {
	console.log("Updating message hourly: submission");
	try {
		const ids = await getData(idsPath);

		if (!ids || !ids[year]) {
			console.error(`submissionEvent.js: IDs not found`);
			return;
		}

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
					ret
			}

			if (!data) {
				console.error(`submissionEvent.js: Data not found for year ${year}`);
				return;
			}

			const container = await buildMessage(data);

			if (!container) {
				console.error(`submissionEvent.js: Container not built for year ${year}`, e);
				return;
			}

			for (const entry of yearData) {
				const {messageId, channelId} = entry;

				const message = await getMessage(client, messageId, channelId);

				if (!message) {
					continue; // Skip if message is not found
				}

				try {
					await message.edit({components: [container]});
				} catch (e) {
					console.error(`submissionEvent.js: Error editing message for year ${year}:`, e);
					return;
				}
			}
	} catch (e) {
		console.error(`submissionEvent.js: Error updating message:`, e);
	}
}