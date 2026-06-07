const fs = require("fs").promises;
const path = require("path");
const cron = require("node-cron");
const { getData } = require("./birthdayManager.js");

const channelId = "1493182992263417856"; // currently testchannel in abarkiv

let tempDate;
let channel;

cron.schedule("11 11 * * *", () => {
  try {
    console.log("Running daily birthday check");
    tempDate = new Date();

    const list =
      getData().dates[
        String(tempDate.getMonth() + 1).padStart(2, "0") +
          String(tempDate.getDate()).padStart(2, "0")
      ] || [];
    list.forEach((element) => {
      channel.send(`Gratulerer med dagen <@${element}>`);
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
