const fs = require("fs");
const path = require("path");
const cron = require('node-cron');
let birthdayData;


// Set default timezone
dayjs.tz.setDefault("Europe/Oslo");

const dayjsToDiscord = (date, format = "F") => `<t:${Math.floor(date.valueOf() / 1000)}:${format}>`;

const channelId = "1493182992263417856";
const filePath = path.resolve(__dirname, "../data/birthdays.json");

async function loadBirthdays(client, filePath) {
    if (!fs.existsSync(filePath)) {
        console.error("File does not exist");
        return;
    }

    const fileData = fs.readFileSync(filePath, "utf-8");
    let data;

    try {
        data = JSON.parse(fileData);
    } catch (e) {
        console.error("Could not parse file", e);
        return;
    }

    birthdayData = data;
}

async function getData() {
    if (birthdayData) {
        console.error("Birthday data not loaded!")
        return false;
    }
    return birthdayData;
}

cron.schedule('0 9 * * *', () => {
    console.log('Running daily task');
});

module.exports = {
    name: "clientReady",
    once: true,
    async execute(client) {
        try {
            console.log(`Logged in as ${client.user.tag}`);
        } catch (e) {
            console.error(e);
        }
    },
    getData,
};