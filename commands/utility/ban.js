const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, MessageFlags} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban an user")
        .addUserOption(o => o.setName('user').setDescription('User').setRequired(true))
        .addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true)),

	async execute(interaction) {

        try {
		const target = interaction.options.getMember('user');
		const reason = interaction.options.getString('reason') ?? 'No reason provided';

        const immune = ["430372465177395200", "371704248041209859", interaction.webhook.id] //No one needs to know (interaction.webhook.id er botID)
        const targetID = target.user.id
        const firstUser = interaction.user

        if (!(immune.includes(targetID))) { // Sjekker det viktige
            const confirm = new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('Confirm Ban')
                .setStyle(ButtonStyle.Danger); // 4

		    const cancel = new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Secondary); // 2

		    const row = new ActionRowBuilder() // Følge med knapper
			    .addComponents(cancel, confirm);
            
            const response = await interaction.reply({
                content: `Er du sikker på at du vil banne ${target.user} for: ${reason}?`,
                components: [row], 
                withResponse: true
		    })
            
            const collectorFilter = i => i.user.id;

            try {
                const confirmation = await response.resource.message.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
                const userID = confirmation.user

                if (confirmation.customId === "confirm") {
                    console.log("Trying to banning user:",targetID);

                    try {
                        await target.timeout(60_000,reason) // timeouter de i 60 sekunder

                        if (userID.id === firstUser.id) {
                            await confirmation.update({ content: `${userID} banner ${target} for: ${reason}`, components: [] });
                        }
                        else {
                            await confirmation.update({ content: `${firstUser} er en tregost, så ${userID} bannet ${target} for: ${reason}`, components: [] });
                        }
                        
                    }
                    catch e {
                        console.error("Failed to ban user")
						console.error(e)
                        await confirmation.message.delete()
                        await interaction.followUp({content: "Error could not ban the user", components: [], flags: MessageFlags.Ephemeral})
                    }

                }
                else if (confirmation.customId === "cancel") {

                    try {
                        if (userID.id === firstUser.id) {
                            await confirmation.update({content: `${userID} klarer ikke å trykke på en knapp`, components: []})
                        }
                        else {
                            await confirmation.update({content: `${userID} reddet ${target} fra ${firstUser}`, components: []})
                        }
                    }
                    catch {
                        await confirmation.message.delete()
                        await interaction.followUp({content: "Error aborting", components: [], flags: MessageFlags.Ephemeral})
                    }
                }
            }
            catch { // Hvis noen ikke trykker
                await response.resource.message.delete()
                await interaction.followUp({ content: `You did not respond within 1 minute`, components: [], flags: MessageFlags.Ephemeral});
            }
        }
        else {
            await interaction.reply({content: "In your dreams >:)", flags: MessageFlags.Ephemeral})
        }}
        catch {
            console.error("Failed")
        }
	}
};
