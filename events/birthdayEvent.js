const fs = require("fs").promises;
const path = require("path");
const cron = require('node-cron');
let birthdayData;
let tempDate;
let channel;


const channelId = "1493182992263417856"; // currently testchannel in abarkiv
const filePath = path.resolve(__dirname, "../data/private/birthdays.json");

async function checkFileExists() {
    try {
        await fs.mkdir(path.dirname(filePath), { recursive: true });


        try {
            await fs.access(filePath);
            JSON.parse(await fs.readFile(filePath, "utf-8"));

        } catch {
            await fs.writeFile(
                filePath,
                JSON.stringify(
                    {
                        users: {},
                        dates: {}
                    },
                    null,
                    2
                ),
                "utf-8"
            );
        }
    } catch (err) {
        console.error("Error ensuring file exists:", err);
    }
}

async function loadBirthdays() {
    try {
        await checkFileExists();
        birthdayData = await JSON.parse(await fs.readFile(filePath, "utf-8"));
    } catch (err) {
        console.error("Error loading birthdays:", err);
        birthdayData = {};
    }
}

async function getData() {
    return birthdayData;
}

async function setData(birthdayData2) {
    birthdayData = birthdayData2;
    await saveBirthdays();
}

async function saveBirthdays() {

    try {
        fs.writeFile(filePath, JSON.stringify(birthdayData))
    } catch (err) {
        console.error("Error saving file:", err);
    };
}

cron.schedule('11 11 * * *', () => {
    try {
        console.log('Running daily birthday check');
        tempDate = new Date();

        const list = birthdayData.dates[
            String(tempDate.getMonth() + 1).padStart(2, '0') +
            String(tempDate.getDate()).padStart(2, '0')] || [];
        list.forEach(element => {
            channel.send(`Gratulerer med dagen <@${element}>`);
        })
    } catch (error) {
        console.error("Error with daily bd check:", error);
    }
});

module.exports = {
    name: "clientReady",
    once: true,
    async execute(client) {
        try {

            console.log(`Logged in as ${client.user.tag}`);
            loadBirthdays();
            channel = await client.channels.fetch(channelId).catch(() => null);

        } catch (e) {
            console.error(e);
        }
    },
    getData, setData,
};