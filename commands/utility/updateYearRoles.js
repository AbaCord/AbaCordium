const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const YEAR_ROLES = [
  { id: "1406392791315120299", name: "1. år" },
  { id: "1406393165791105156", name: "2. år" },
  { id: "1417545621014839366", name: "3. år" },
  { id: "1417545683497648179", name: "4. år" },
  { id: "1417545725448814674", name: "5. år" },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("updateyearroles")
    .setDescription("Move everyone up one year"),

  async execute(interaction) {
    // Only administrators can run this
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    ) {
      return interaction.reply({
        content: "You must be an administrator to update roles.",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    try {
      const result = await updateYearRoles(interaction.guild);

      await interaction.editReply({
        content:
          `Year roles updated successfully.\n` +
          `Updated: ${result.updated}\n` +
          `Skipped: ${result.skipped}`,
      });
    } catch (error) {
      console.error("Error updating year roles:", error);

      await interaction.editReply({
        content: "Something went wrong while updating the year roles.",
      });
    }
  },
};

async function updateYearRoles(guild) {
  // Make sure we have all members
  await guild.members.fetch();

  let updated = 0;
  let skipped = 0;

  // Start at 5th year and work backwards.
  // This prevents someone moved from 4 -> 5
  // from subsequently being moved 5 -> 6.
  for (let i = YEAR_ROLES.length - 2; i >= 0; i--) {
    const currentRole = guild.roles.cache.get(YEAR_ROLES[i].id);
    const nextRole = guild.roles.cache.get(YEAR_ROLES[i + 1].id);

    if (!currentRole || !nextRole) {
      console.warn(
        `Could not find role: ${YEAR_ROLES[i].name} or ${YEAR_ROLES[i + 1].name}`
      );
      continue;
    }

    const members = currentRole.members;

    for (const member of members.values()) {
      try {
        await member.roles.remove(currentRole);
        await member.roles.add(nextRole);

        updated++;
      } catch (error) {
        console.error(
          `Failed to update ${member.user.tag}:`,
          error
        );
        skipped++;
      }
    }
  }

  return { updated, skipped };
}