const fs = require("fs");
const path = require("path");
const cron = require('node-cron');
let birthdayData;
let tempDate;
let channel;


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

async function setData(birthdayData2) {
    birthdayData = birthdayData2;
    saveBirthdays();
}

async function saveBirthdays() {

    try {
        await writeJSONToFile(filePath, JSON.stringify(birthdayData, null, 2));
        alert("File saved successfully!");
    } catch (error) {
        console.error("Error saving file:", error);
    }


}

cron.schedule('30 16 * * *', () => {
    try {
        console.log('Running daily birthday check');
        tempDate = new Date();
        birthdayData[
            String(tempDate.getDate).padStart(2, '0') +
            String(tempDate.getMonth).padStart(2, '0')
        ].array.forEach(element => {
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