const CHANNEL_ID = "1417541222918131772" // reaction roles discord channel id

const roles = [
    {id: "1406392791315120299", name: "Datatek 1", emojiName: "🟥"},
    {id: "1406393165791105156", name: "Datatek 2", emojiName: "🟦"},
    {id: "1417545621014839366", name: "Datatek 3", emojiName: "🟩"},
    {id: "1417545683497648179", name: "Datatek 4", emojiName: "🟨"},
    {id: "1417545725448814674", name: "Datatek 5", emojiName: "🟪"},
    {id: "1417545779949605025", name: "Annen linje", emojiName: "⬜"}
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
        console.log(reaction.emoji.name)


        let role = roles.find(role => role.emojiName === reaction.emoji.name)
        if (!role) return;


        const member = await reaction.message.guild.members.fetch(user.id);
        await member.roles.remove(role.id);
        
    }
    
  },
};