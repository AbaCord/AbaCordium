const fs = require("fs");
const path = require("path");
const { TextDisplayBuilder, SectionBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder } = require("discord.js");

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

module.exports = {
	name: "clientReady",
	once: true,
	async execute(client) {
		const channelId = "1418137268270399558";
		const messageId = "1421186681305956362";
		const filePath = path.resolve(__dirname, "../data/innleveringer.json");

		// Hovedtry/catch for hele ferdig-gjøremålet
		try {
			setInterval(async () => {
				// Kjører hver time etter boot-time
				// Hver iterasjon har egen try/catch slik at en feil ikke stopper intervallet
				try {
					const channel = await client.channels.fetch(channelId).catch((err) => {
						console.error(`Failed to fetch channel ${channelId}:`, err);
						return null;
					});

					if (!channel || !channel.isTextBased?.()) {
						console.error(`Cannot fetch text channel ${channelId}. Channel is null or not text-based.`);
						return;
					}

					// Les fil trygt
					let data = null;
					try {
						if (!fs.existsSync(filePath)) {
							console.error(`File not found: ${filePath}`);
							return;
						}
						const fileData = fs.readFileSync(filePath, "utf-8");
						try {
							data = JSON.parse(fileData);
						} catch (parseErr) {
							console.error(`JSON parse error for ${filePath}:`, parseErr);
							return;
						}
					} catch (fsErr) {
						console.error(`Error reading file ${filePath}:`, fsErr);
						return;
					}

					// Hent meldingen vi skal editere
					const message = await channel.messages.fetch(messageId).catch((err) => {
						console.error(`Failed to fetch message ${messageId} in channel ${channelId}:`, err);
						return null;
					});

					const now = dayjs();

					if (!message) {
						console.error(`Message ${messageId} not found in channel ${channelId}.`);
						return;
					}

					// Container for komponentene — om noe går galt i byggingen, fang det per-emne
					const container = new ContainerBuilder();

					// Gå gjennom data
					for (const kode in data) {
						try {
							if (!Object.prototype.hasOwnProperty.call(data, kode)) continue;

							const emne = data[kode];
							if (!emne || typeof emne !== "object") {
								console.warn(`Skipping invalid emne for kode ${kode}`);
								continue;
							}

							const type = emne.type;
							if (!type || typeof type !== "object" || Object.keys(type).length === 0) {
								// ingen typer
								continue;
							}

							const header = new TextDisplayBuilder().setContent(`### ${kode}: ${emne.navn ?? "Ukjent navn"}`);
							container.addTextDisplayComponents(header);

							for (const typeObj in type) {
								try {
									if (!Object.prototype.hasOwnProperty.call(type, typeObj)) continue;

									const info = type[typeObj];
									if (!info || typeof info !== "object") {
										console.warn(`Skipping invalid info for ${kode} -> ${typeObj}`);
										continue;
									}

									// Valider nødvendige felter med fallback-verdier
									if (!info.frist) {
										console.warn(`Missing 'frist' for ${kode} ${typeObj}, skipping.`);
										continue;
									}
									const fristRaw = info.frist;
									let frist = dayjs(fristRaw, "DD-MM-YYYY", true); // strict parsing
									if (!frist.isValid()) {
										// forsøk uten strict
										frist = dayjs(fristRaw);
									}
									if (!frist.isValid()) {
										console.warn(`Invalid date '${fristRaw}' for ${kode} ${typeObj}, skipping.`);
										continue;
									}

									// Klokkeslett
									let hours = 0;
									let minutes = 0;
									if (info.kl && typeof info.kl === "string") {
										const parts = info.kl.split(":").map(Number);
										if (parts.length === 2 && Number.isFinite(parts[0]) && Number.isFinite(parts[1])) {
											hours = parts[0];
											minutes = parts[1];
										} else {
											console.warn(`Invalid 'kl' format for ${kode} ${typeObj}: ${info.kl}. Using 00:00.`);
										}
									}
									frist = frist.add(hours, "hour").add(minutes, "minute");

									// antall & frekvens
									const antall = Number.isFinite(Number(info.antall)) ? Number(info.antall) : 1;
									const frekvens = Number.isFinite(Number(info.frekvens)) ? Number(info.frekvens) : 1;
									const link = typeof info.link === "string" ? info.link : null;

									let nummer = 1;

									// Spesiallogikk for TDT4109
									if (kode === "TDT4109") {
										for (; nummer <= antall; nummer++) {
											// hvis frist er i fortiden, øk med frekvens*7 dager (eller den ekstra betingelsen)
											if (now.isAfter(frist)) {
												try {
													if (
														(typeObj === "Demotrasjon" && (nummer === 2 || nummer === 5)) ||
														(typeObj === "Øving" && (nummer === 3 || nummer === 6))
													) {
														frist = frist.add(frekvens * 7, "day");
													}
													frist = frist.add(frekvens * 7, "day");
												} catch (addErr) {
													console.warn(`Error adding days for ${kode} ${typeObj} nummer ${nummer}:`, addErr);
													// bryt ut slik at vi ikke sitter i evig loop
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
												} catch (addErr) {
													console.warn(`Error adding days for ${kode} ${typeObj} nummer ${nummer}:`, addErr);
													break;
												}
											} else {
												break;
											}
										}
									}

									// Hvis neste frist er i fremtiden, lag komponent
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
											} else {
												// hvis ingen link, la det være en disabled knapp (hvis biblioteket tillater)
												// ellers setter vi bare en tom link-knapp uten URL
												// Merk: Discord.js ButtonBuilder krever URL for Link-style, så vi unngår crash ved kun legge knapp uten URL
												// Her: dropper URL hvis ikke finnes
											}

											const section = new SectionBuilder()
												.addTextDisplayComponents(text, deadline)
												.setButtonAccessory(button);
											container.addSectionComponents(section);
										} catch (componentErr) {
											console.warn(`Failed to build UI components for ${kode} ${typeObj}:`, componentErr);
											// fortsett med neste typeObj
										}
									} else {
										// alt godt — ingen kommende frist for denne typeObj
									}
								} catch (innerErr) {
									console.warn(`Error processing typeObj ${typeObj} for kode ${kode}:`, innerErr);
									continue;
								}
							}
						} catch (outerErr) {
							console.warn(`Error processing kode ${kode}:`, outerErr);
							continue;
						}
					}

					// Endelig: edit meldingen — egen try/catch
					try {
						// Sjekk at container faktisk har noe (valgfritt)
						await message.edit({ components: [container] }).catch((err) => {
							console.error(`Failed to edit message ${messageId}:`, err);
						});
					} catch (editErr) {
						console.error(`Error while editing message ${messageId}:`, editErr);
					}
				} catch (iterErr) {
					// Sørg for at feil i én iterasjon ikke stopper intervallet
					console.error("Unhandled error inside setInterval iteration:", iterErr);
				}
			}, 60 * 60 * 1000);
		} catch (e) {
			// Fatal feil ved initialisering
			console.error("Fatal error in clientReady execute:", e);
		}
	},
};
