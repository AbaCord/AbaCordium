const { SlashCommandBuilder } = require('discord.js');
const { getData, setData } = require('../../events/birthdayEvent.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('birthday')
    .setDescription('Birthday system stuff')
    .addStringOption(option => option.setName('month')
      .setDescription('Input month')
      .setRequired(true)
      .addChoices(
        { name: 'Januar', value: "01" },
        { name: 'Februar', value: "02" },
        { name: 'Mars', value: "03" },
        { name: 'April', value: "04" },
        { name: 'Mai', value: "05" },
        { name: 'Juni', value: "06" },
        { name: 'Juli', value: "07" },
        { name: 'August', value: "08" },
        { name: 'September', value: "09" },
        { name: 'Oktober', value: "10" },
        { name: 'November', value: "11" },
        { name: 'Desember', value: "12" }
      ))
    .addNumberOption(option =>
      option.setName('day')
        .setDescription("Input day")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(31)
    ),
  async execute(interaction) {
    const uId = interaction.user.id;

    let sendContent = "Added birtday for " + `<@${uId}>` + ", date: ";

    let day = interaction.options.getNumber("day");
    let month = interaction.options.getString("month");

    sendContent = sendContent + day + "/" + month;

    if (!validDate(day, month)) {
      return interaction.reply({
        content: 'Invalid date',
      }).catch(() => { });
    }

    day = String(day).padStart(2, '0');
    bdData = await getData();

    if (!bdData.dates[month + day]) {
      console.log("Date not registered, creating...")
      bdData.dates[month + day] = new Array();
    }

    if (bdData.users[uId]) {
      const oldDate = bdData.users[uId];
      const index = bdData.dates[oldDate].indexOf[oldDate]
      bdData.dates[oldDate].splice(index, 1)
      sendContent = sendContent + ", removed old date index: " + oldDate;
    }

    bdData.users[uId] = month + day;
    bdData.dates[month + day].push(uId);

    setData(bdData);

    return interaction.reply({
      content: sendContent
    }).catch(() => { });
  }
};



function validDate(day, month) {
  let monthInt = parseInt(month)
  if (day <= 28 && day >= 0) {
    return true;
  }
  if (monthInt % 2 == 1 && day <= 31) {
    return true;
  }
  if (monthInt != 2 && day <= 30) {
    return true;
  }
  return false;
}
