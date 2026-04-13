import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";

const WORLDE_CHANNEL_ID = "1438506264991760464";

const USER_REGEX = /<@!?(\d+)>/g;
const SCORE_REGEX = /(\d|X)\/6/;

async function fetchAllMessages(channel, limit = 5000) {
	const messages = [];
	let lastId;

	while (messages.length < limit) {
		const fetched = await channel.messages.fetch({
			limit: Math.min(100, limit - messages.length),
			before: lastId,
		});

		if (!fetched.size) break;

		messages.push(...fetched.values());
		lastId = fetched.last().id;
	}

	return messages;
}

function buildRankList(entries) {
	const medals = ["🥇", "🥈", "🥉"];

	const top3 = entries
		.slice(0, 3)
		.map(([id, count], i) => `${medals[i]} <@${id}> — **${count}**`);

	const rest = entries
		.slice(3)
		.map(([id, count], i) => `${i + 4}. <@${id}> — **${count}**`);

	return [...top3, "", ...rest].join("\n");
}

export const data = new SlashCommandBuilder()
	.setName("worldestats")
	.setDescription("Worlde stats i Abacord")
	.addSubcommand((sub) =>
		sub
			.setName("leaderboard")
			.setDescription("De beste worlde spillerne i AbaCord!")
			.addIntegerOption((opt) =>
				opt.setName("year").setDescription("Filtrer på år").setRequired(false),
			)
			.addBooleanOption((opt) => opt.setName("wins").setDescription("best performance ranking"))
			.addBooleanOption((opt) => opt.setName("avg").setDescription("best performance ranking"))
			.addBooleanOption((opt) => opt.setName("activity").setDescription("most active players"))
			.addBooleanOption((opt) => opt.setName("failure").setDescription("X/6 spam ranking")),
	)
	.addSubcommand((sub) =>
		sub
			.setName("user")
			.setDescription("Wordle stats av en bruker")
			.addUserOption((opt) =>
				opt.setName("target").setDescription("Bruker").setRequired(true),
			),
	);

export async function execute(interaction) {
	const sub = interaction.options.getSubcommand();
	const channel = await interaction.client.channels.fetch(WORLDE_CHANNEL_ID);

	if (!channel?.isTextBased()) {
		return interaction.reply({ content: "Ugyldig kanal.", ephemeral: true });
	}

	await interaction.deferReply();

	const messages = await fetchAllMessages(channel);
	const year = interaction.options.getInteger("year");

	const worldeMessages = messages.filter((msg) => {
		return (
			msg.author.id === "1211781489931452447" &&
			msg.content.startsWith("**Your group") &&
			(!year || msg.createdAt.getFullYear() === year)
		);
	});

	if (!worldeMessages.length) {
		return interaction.editReply("Fant ingen worlde games");
	}

	const playerStats = {};

	let number = 1

	for (const msg of worldeMessages) {
		const lines = msg.content.split("\n");

		interaction.editReply(number.toString())
		number++;

		for (const line of lines) {
			const scoreMatch = SCORE_REGEX.exec(line);
			if (!scoreMatch) continue;

			SCORE_REGEX.lastIndex = 0;

			const points = scoreMatch[1] === "X" ? 0 : Number(scoreMatch[1]);

			USER_REGEX.lastIndex = 0;

			let m;
			while ((m = USER_REGEX.exec(line))) {
				const id = m[1];

				if (!playerStats[id]) {
					playerStats[id] = {
						score: new Array(7).fill(0),
					};
				}

				playerStats[id].score[points]++;
			}

			USER_REGEX.lastIndex = 0;
		}
	}

	console.log(playerStats);

	if (sub === "leaderboard") {

	}
		

	return interaction.editReply("Finished thinking");
}