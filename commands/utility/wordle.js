import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";

const WORLDE_CHANNEL_ID = "1438506264991760464";
const WORLDE_CHANNEL_ID_FIRST_MESSAGE_ID = "1438598873068339291"; // la meg starte denne kanalen med å mogge med dagens wordle

const USER_REGEX = /(?:@([A-Za-z0-9_]+)|<@!?(\d+)>)/g; // TODO: LAG EN BEDRE REGEX SOM HÅNDTERER NICKNAMES OG SÅNN, DENNE FUNKER IKKE FOR ALLE BRUKERE, MEN DET ER VEL GREIT NOK FOR NÅ
const SCORE_REGEX = /(\d|X)\/6/;
const META_KEYS = new Set(["currentDay", "lastMessageId"]);

const CUSTOM_NAMES = {
	"Heidi": "543507303924498443",
	"Oliver": "387624910488600577",
	"Ou Li Wa (john music)": "387624910488600577",
	"Allvitende Angelica": "435464800936525834",
	"Don": "486476918204530700",
	"big tony": "484955136997851148",
	"Ancient man Sven": "579397644896698388",
	"Einar Martin": "353564620889391114",
	"Sander": "430372465177395200",
	"Oliver (john music)": "387624910488600577",
	"toney": "484955136997851148",
	"Angelica": "435464800936525834",
	"Julie": "358611436341297153",
	"Sana": "1496119552621154317",
}

async function fetchAllMessages(
	channel,
	limit = 5000,
	lastId = WORLDE_CHANNEL_ID_FIRST_MESSAGE_ID,
) {
	const messages = [];
	let currentId = lastId;

	while (messages.length < limit) {
		const FETCHED = await channel.messages.fetch({
			limit: Math.min(100, limit - messages.length),
			after: currentId,
		});
		if (!FETCHED.size) break;
		const BATCH = [...FETCHED.values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp);
		messages.push(...BATCH);
		currentId = BATCH[BATCH.length - 1].id;
	}
	return messages;
}

function createPlayer(day) {
	return {
		score: new Array(7).fill(0),
		streak: 0,
		bestStreak: 0,
		day: day - 1,
	};
}

function finalizeBestStreak(stats) {
	for (const ID in stats) {
		if (META_KEYS.has(ID)) continue;

		stats[ID].bestStreak = Math.max(stats[ID].bestStreak, stats[ID].streak);
	}
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
			.addUserOption((opt) => opt.setName("target").setDescription("Bruker").setRequired(true)),
	);

export async function execute(interaction) {
	const SUB = interaction.options.getSubcommand();
	const CHANNEL = await interaction.client.channels.fetch(WORLDE_CHANNEL_ID);

	if (!CHANNEL?.isTextBased()) {
		return interaction.reply({content: "Ugyldig kanal.", ephemeral: true});
	}

	await interaction.deferReply();

	const MESSAGES = await fetchAllMessages(CHANNEL, 500);
	const YEAR = interaction.options.getInteger("year");

	const FILTERED_MESSAGES = MESSAGES.filter((msg) => {
		return (
			msg.author.id === "1211781489931452447" &&
			msg.content.startsWith("**Your group") &&
			(!YEAR || msg.createdAt.getFullYear() === YEAR)
		);
	});

	if (!FILTERED_MESSAGES.length) {
		return interaction.editReply("Fant ingen worlde games");
	}

	const WORLDE_MESSAGES = FILTERED_MESSAGES.map((m) => m.content);

	const PLAYERSTATS = {
		currentDay: 0,
		lastMessageId: MESSAGES[MESSAGES.length - 1].id,
	};

	for (const MSG of WORLDE_MESSAGES) {
		const LINES = MSG.split("\n");

		const FIRST_LINE = LINES.shift();

		const DAY_MATCH = /(\d+) day streak/.exec(FIRST_LINE);

		if (!DAY_MATCH) continue;

		const DAY = parseInt(DAY_MATCH[1]);

		PLAYERSTATS.currentDay = DAY;

		const SEEN_TODAY = new Set();

		for (const LINE of LINES) {
			const SCORE_MATCH = SCORE_REGEX.exec(LINE);

			if (!SCORE_MATCH) continue;

			SCORE_REGEX.lastIndex = 0;

			const points = SCORE_MATCH[1] === "X" ? 0 : Number(SCORE_MATCH[1]);

			USER_REGEX.lastIndex = 0;

			let m;
			while ((m = USER_REGEX.exec(LINE))) {
				const ID = m[1];

				if (!PLAYERSTATS[ID]) {
					PLAYERSTATS[ID] = createPlayer(DAY);
				}

				const USER = PLAYERSTATS[ID];
			
				USER.score[points]++;
				SEEN_TODAY.add(ID);

				if (points === 0) {
					USER.bestStreak = Math.max(USER.bestStreak, USER.streak);
					USER.streak = 0;
				} else if (USER.day + 1 === DAY) {
					PLAYERSTATS[ID].streak++;
				} else {
					USER.bestStreak = Math.max(USER.bestStreak, USER.streak);
					USER.streak = 1;
				}
				USER.day = DAY;
			}
		}

		for (const ID in PLAYERSTATS) {
			if (META_KEYS.has(ID) || SEEN_TODAY.has(ID)) continue;

			const USER = PLAYERSTATS[ID];

			if (PLAYERSTATS[ID].day !== DAY) {
				PLAYERSTATS[ID].bestStreak = Math.max(PLAYERSTATS[ID].bestStreak, PLAYERSTATS[ID].streak);
				PLAYERSTATS[ID].streak = 0;
				PLAYERSTATS[ID].day = DAY;
			}
		}
	}

	finalizeBestStreak(PLAYERSTATS);

	console.log(PLAYERSTATS);

	if (SUB === "leaderboard") {
		
	}

	return interaction.editReply("Finished thinking");
}
