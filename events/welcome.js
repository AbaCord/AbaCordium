const welcomeMessages = [
	// 50 KI genererte meldinger
	"Welcome to the server, <userID>! Grab a seat and make yourself at home.",
	"Hey <userID> 👋 — glad you could join us!",
	"<userID> just landed! Everyone give them a warm welcome!",
	"Great to see you, <userID>! We’ve been expecting you 😎",
	"Welcome aboard, <userID>! Let’s make some memories.",
	"<userID> has entered the chat — say hi, everyone!",
	"Hey there, <userID>! Hope you brought snacks 🍪",
	"Look who just joined! Welcome, <userID>!",
	"The one and only <userID> has arrived! 🎉",
	"Welcome, <userID> — your adventure starts here!",
	"🌙 Welcome, <userID> — may your stay be cozy and kind.",
	"✨ <userID> drifted in like starlight. Welcome!",
	"🍃 Hello <userID> — take a deep breath and enjoy your stay.",
	"🌸 Welcome to our little corner of the internet, <userID>.",
	"☕ <userID> joined — pour yourself a cup and relax with us.",
	"🌈 <userID> appeared and instantly made the server brighter!",
	"🌻 Welcome, <userID>! We’re so glad you’re here.",
	"💫 <userID> has entered the vibe zone.",
	"🕊️ Peace, positivity, and a big welcome to <userID>.",
	"🌤️ Morning or night, it’s always the right time to welcome <userID>!",
	"🚨 ALERT: New human detected — <userID>!",
	"Everyone act normal… <userID> is here 👀",
	"<userID> joined the party. *It’s super effective!*",
	"<userID> spawned in with 100% charisma stats!",
	"Uh oh… <userID> just broke into the server 😱",
	"<userID> joined. The prophecy is fulfilled.",
	"<userID> has arrived. Hide the cookies! 🍪",
	"<userID> entered. The chaos multiplier has increased.",
	"<userID> popped out of nowhere — quick, say something funny!",
	"<userID> just joined the cult—uh, community!",
	"GG, <userID> — you made it to the best server!",
	"<userID> has joined the squad — ready up!",
	"Welcome to the lobby, <userID>!",
	"<userID> connected. Latency: 0ms. Vibes: 100%.",
	"<userID> entered the realm. The quest begins! ⚔️",
	"A wild <userID> appeared! What will you do?",
	"<userID> achieved: “Joined the Server” 🏅",
	"<userID> has respawned in this dimension!",
	"<userID> dropped in from orbit — welcome, pilot. 🚀",
	"<userID> joined the guild — let’s go adventuring!",
	"Big welcome to <userID>! We’re happy to have you here 💖",
	"<userID> just joined the family — give them some love!",
	"Welcome home, <userID>. You’re among friends now.",
	"<userID> joined! The more the merrier 🌟",
	"Say hi to <userID> — our newest member!",
	"<userID> is here! Let’s make them feel welcome 🎈",
	"<userID> just joined — let’s give them a round of applause 👏",
	"<userID>, welcome to your new digital home 💻",
	"<userID> has arrived — friendship level rising already!",
	"Welcome, <userID>! You’re part of something awesome now. 🚀",
];

WELCOME_CHANNEL_ID = "1424757794048970773";

module.exports = {
	name: "guildMemberAdd",
	once: false,
	async execute(member, client) {
		try {
			const channel = await client.channels.fetch(WELCOME_CHANNEL_ID);

			if (channel) {
				let welcomeText;

				if (!member.user.bot) {
					welcomeText = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)].replace(
						"<userID>",
						`<@${member.id}>`
					);
				} else {
					welcomeText = `<@${member.id}> has joined`;
				}

				channel.send(welcomeText);
			}
		} catch {}
	},
};
