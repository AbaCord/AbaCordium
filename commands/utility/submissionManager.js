const sf = require("../../utils/submissionFunctions.js");
const {   PermissionFlagsBits,
  SlashCommandBuilder, 
  MessageFlags,  } = require("discord.js");


async function sendSubmissionMessage(client, interaction, year) {
  await interaction.deferReply({components: ["Waiting for submission message..."], flags: MessageFlags.IsComponentsV2,});

  const message = await interaction.fetchReply();

  const messageId = message.id;
  const channelId = message.channel.id;

  // Store the messageId and channelId in your data store for later use

  console.log(`Storing messageId: ${messageId} and channelId: ${channelId} for year: ${year}`);
  console.log(`Storing messageId: ${typeof messageId} and channelId: ${typeof channelId} for year: ${typeof year}`);

  await sf.storeMessageId(year, messageId, channelId);

  await sf.updateMessageType(client, year);  

}


module.exports = {
  data: new SlashCommandBuilder()
    .setName("submissionmanager")
    .setDescription("Manage submissions")
    .addIntegerOption((option) =>
      option
        .setName("year").setDescription("Select the year to view submissions").setRequired(true)
    ).addBooleanOption((option) =>
      option
        .setName("edit").setDescription("turn on edit mode ").setRequired(false)
    ),

    async execute(interaction) {

      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) { // For now
        return interaction.reply({
          content: "You must be an administrator to use this command.",
          ephemeral: true,
        });
      }

      const year = interaction.options.getInteger("year").toString();
      const editMode = interaction.options.getBoolean("edit") || false;

      await sendSubmissionMessage(interaction.client, interaction, year);


    }
}

