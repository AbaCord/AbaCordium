const WELCOME_CHANNEL_ID = "1424757794048970773"

module.exports = {
    name: "guildMemberAdd",
    once: false,
    async execute(member, client) {
        
        const Message = `**Halla <@${member.id}>!** 👋
For å få tilgang til resten av serveren ber vi deg om å gjøre følgende:
1. Endre server-nick til __**fornavnet**__ ditt.
2. Bli med i interessegruppa vår på abakus.no: __**Abacord**__
https://abakus.no/interest-groups/279
Det er også __**anbefalt**__ å sjekke ut <#1425387320340910171> for __**nyttig info**__ og for mer info om hvordan man får tilgang.
Hvis du ikke får tilgang i løpet av dagen etter å ha gjort disse stegene – eller støter på andre problemer – ta kontakt med de nevnte i <#1425387320340910171>.
**Velkommen inn! 🎉**

_(Er du ikke medlem av abakus? Sjekk ut <#1417541222918131772> og velg annen linje)_`

        try {
            await member.send(Message);
        }
        catch {
            const channel = await client.channels.fetch(WELCOME_CHANNEL_ID).catch(() => null);

            if (channel) {
                try {
                    channel.send(Message)
                }
                catch {
                    console.log("Could not send DM message")
                }
            }
        }
    }
}
