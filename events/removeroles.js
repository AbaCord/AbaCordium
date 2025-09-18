const CHANNEL_ID = "1417541222918131772" // reaction roles discord channel id

const roles = [
    //årroller, og linje
    {id: "1406392791315120299", name: "Datatek 1", emojiName: "1️⃣"},
    {id: "1406393165791105156", name: "Datatek 2", emojiName: "2️⃣"},
    {id: "1417545621014839366", name: "Datatek 3", emojiName: "3️⃣"},
    {id: "1417545683497648179", name: "Datatek 4", emojiName: "4️⃣"},
    {id: "1417545725448814674", name: "Datatek 5", emojiName: "5️⃣"},
    {id: "1417545779949605025", name: "Annen linje", emojiName: "❌"},

    //spillroller
    {id: "1418312515485438072", name: "Overwatch", emojiName: "🟥"},
    {id: "1418312548343742584", name: "League of Legends", emojiName: "🟦"},
    {id: "1418312585006157876", name: "Minecraft", emojiName: "🟩"},
    {id: "1418312609286852901", name: "Roblox", emojiName: "🟨"},
    {id: "1418314383519518760", name: "Valorant", emojiName: "🟪" }

]
// legge til roller


module.exports = {
  name: 'messageReactionRemove',
  once: false,
  async execute(reaction, user, client) {
    // Fetch partials if needed
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        console.error('Error fetching reaction:', error);
        return;
      }
    }

    //reaction.emoji.name
    if (reaction.message.channel.id === CHANNEL_ID){
        //console.log(reaction.emoji.name) debugging


        let role = roles.find(role => role.emojiName === reaction.emoji.name)
        if (!role) return;


        const member = await reaction.message.guild.members.fetch(user.id);
        await member.roles.remove(role.id);
        
    }
    
  },
};