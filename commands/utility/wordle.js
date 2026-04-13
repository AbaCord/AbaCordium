import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";

const WORLDE_CHANNEL_ID = "1438506264991760464";
const PAGE_SIZE = 10;

function formatDate(date) {
	const d = String(date.getDate()).padStart(2, "0");
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const y = date.getFullYear();
	const h = String(date.getHours()).padStart(2, "0");
	const min = String(date.getMinutes()).padStart(2, "0");
	return `${d}/${m}/${y} ${h}:${min}`;
}

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

	const top3 = entries.slice(0, 3).map(([id, count], i) => `${medals[i]} <@${id}> — **${count}**`);

	const rest = entries.slice(3).map(([id, count], i) => `${i + 4}. <@${id}> — **${count}**`);

	return [...top3, "", ...rest].join("\n");
}

export const data = new SlashCommandBuilder()
	.setName("worldeStats")
	.setDescription("Worlde stats i Abacord")
	.addSubcommand((sub) =>
		sub
			.setName("leaderboard")
			.setDescription("De beste worlde spillerne i AbaCord!")
			.addIntegerOption((opt) =>
				opt.setName("year").setDescription("Filtrer på år").setRequired(false),
			),
	)
	.addSubcommand((sub) =>
		sub
			.setName("user")
			.setDescription("Wordle stats av en bruker")
			.addUserOption((opt) => opt.setName("target").setDescription("Bruker").setRequired(true)),
	);
export async function execute(interaction) {
	const sub = interaction.options.getSubcommand();
	const channel = await interaction.client.channels.fetch(WORLDE_CHANNEL_ID);

	if (!channel?.isTextBased()) {
		return interaction.reply({content: "Ugyldig kanal.", ephemeral: true});
	}

	await interaction.deferReply();
	const messages = await fetchAllMessages(channel);
	const year = interaction.options.getInteger("year");

	const worldeMessages = messages.filter(
		(m) => (m.author.id = "1211781489931452447" && m.content.includes("Your group")), // worlde id
	);

	if (!worldeMessages.length) {
		return interaction.editReply("Fant ingen worlde games");
	}

  console.log(worldeMessages[0])

  const map = new Map();

  for (const msg of worldeMessages) {
  }

	if (sub === "leaderboard") {


		return interaction.editReply({embeds: [embed]});
	}

	if (sub === "user") {
		const target = interaction.options.getUser("target");
	}
}
