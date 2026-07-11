const cron = require("node-cron");
const { getData } = require("./birthdayManager.js");

const channelId = "1404930417664196648"; // "general"

let channel;
let birthdayText;

let birthdayMessages = [
  "Se hvem som har bursdag! Gratulerer, <userID>!",
  "Den ene og eneste <userID> har bursdag i dag! 🎉",
  "Gratulerer med dagen, <userID> — håper den blir bra!",
  "✨ <userID> har bursdag — ett år klokere!",
  "🎉 Gratulerer med dagen, <userID> — ta vare på dagen din.",
  "🔥 <userID> har levd enda et år — gratulerer med dagen!",
  "🎈 Stor dag for <userID> — gratulerer med dagen!",
  "Gratulerer med dagen, <userID> — gjør den god!",
  "<userID> har runda enda et år — gratulerer!",
];

cron.schedule("0 10 * * *", async () => {
  try {
    console.log("Running daily birthday check");

    const tempDate = new Date();
    const bdData = await getData();

    const list =
      bdData.dates[
        String(tempDate.getMonth() + 1).padStart(2, "0") +
          String(tempDate.getDate()).padStart(2, "0")
      ] || [];

    list.forEach((element) => {
      const birthdayText = birthdayMessages[
        Math.floor(Math.random() * birthdayMessages.length)
      ].replace("<userID>", `<@${element}>`);

      channel.send(birthdayText);
    });
  } catch (error) {
    console.error("Error with daily bd check:", error);
  }
});

module.exports = {
  name: "clientReady",
  once: true,
  async execute(client) {
    try {
      channel = await client.channels.fetch(channelId).catch(() => null);
      console.log(`Cronjob for birthdays loaded`);
    } catch (e) {
      console.error(e);
    }
  },
};
