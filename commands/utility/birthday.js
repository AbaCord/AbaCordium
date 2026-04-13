const { SlashCommandBuilder } = require('discord.js');
const { getData } = require('../../events/birthdayEvent.js')

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
    let day = interaction.options.getNumber("day")
    let month = interaction.options.getNumber("month")

    if (!validDate(day, month)) {
      return interaction.reply({
        content: 'Invalid date',
      }).catch(() => { });
    }

    day = String(day).padStart(2, '0');
    bdData = getData();

    if (!bdData[month + day]) {
      bdData[month + day] = new Array();
    }

    bdData[month + day].push(interaction.user);



    return interaction.reply({
      content: 'Birthday added to database',
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
