const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { getData, setData } = require("../../events/birthdayEvent.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("birthday")
    .setDescription("Edit birthdays")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove birthday")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("Target user")
            .setRequired(false),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("Set birthday")
        .addStringOption((option) =>
          option
            .setName("month")
            .setDescription("Input month")
            .setRequired(true)
            .addChoices(
              { name: "Januar", value: "01" },
              { name: "Februar", value: "02" },
              { name: "Mars", value: "03" },
              { name: "April", value: "04" },
              { name: "Mai", value: "05" },
              { name: "Juni", value: "06" },
              { name: "Juli", value: "07" },
              { name: "August", value: "08" },
              { name: "September", value: "09" },
              { name: "Oktober", value: "10" },
              { name: "November", value: "11" },
              { name: "Desember", value: "12" },
            ),
        )
        .addNumberOption((option) =>
          option
            .setName("day")
            .setDescription("Input day")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(31),
        )
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("Taret user")
            .setRequired(false),
        ),
    ),
  async execute(interaction) {
    let uId = interaction.user.id;
    let target = interaction.options.getUser("target");
    const subcommand = interaction.options.getSubcommand();

    if (target) {
      if (uId != target.id) {
        if (
          !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
        ) {
          return interaction
            .reply({
              content:
                "You must be an administrator to edit other peoples birthday.",
            })
            .catch(() => {});
        } else {
          uId = target.id;
        }
      }
    }

    bdData = await getData();

    let sendContent = "";

    if (subcommand === "remove") {
      // Removing birthdays without setting new
      sendContent = "Removed birtday for " + `<@${uId}>`;

      try {
        if (bdData.users[uId]) {
          const date = bdData.users[uId];
          const index = bdData.dates[oldDate].indexOf[oldDate];
          bdData.dates[oldDate].pop(index);
          bdData.users.remove(uId);
          sendContent = sendContent + ", removed old date index: " + oldDate;
        }
      } catch {
        return interaction
          .reply({
            content: `<@${uId}>` + " has not registered a birthdate!",
          })
          .catch(() => {});
      }
    } else if (subcommand === "set") {
      // Setting birthdays
      sendContent = "Added birtday for " + `<@${uId}>` + ", date: ";

      let day = interaction.options.getNumber("day");
      let month = interaction.options.getString("month");

      sendContent = sendContent + day + "/" + month;

      if (!validDate(day, month)) {
        return interaction
          .reply({
            content: "Invalid date",
          })
          .catch(() => {});
      }

      day = String(day).padStart(2, "0");

      if (!bdData.dates[month + day]) {
        console.log("Date not registered, creating...");
        bdData.dates[month + day] = new Array();
      }

      if (bdData.users[uId]) {
        const oldDate = bdData.users[uId];
        const index = bdData.dates[oldDate].indexOf[oldDate];
        bdData.dates[oldDate].splice(index, 1);
        sendContent = sendContent + ", removed old date index: " + oldDate;
      }

      bdData.users[uId] = month + day;
      bdData.dates[month + day].push(uId);
    }

    setData(bdData);

    return interaction
      .reply({
        content: sendContent,
      })
      .catch(() => {});
  },
};

function validDate(day, month) {
  let monthInt = parseInt(month);
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
