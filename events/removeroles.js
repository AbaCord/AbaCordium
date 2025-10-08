const CHANNEL_ID = "1417541222918131772" // reaction roles discord channel id

const roles = [
    //årroller, og linje
    {id: "1406392791315120299", name: "1.år", emojiName: "1️⃣"},
    {id: "1406393165791105156", name: "2. år", emojiName: "2️⃣"},
    {id: "1417545621014839366", name: "3. år", emojiName: "3️⃣"},
    {id: "1417545683497648179", name: "4. år", emojiName: "4️⃣"},
    {id: "1417545725448814674", name: "5. år", emojiName: "5️⃣"},
    {id: "1417545779949605025", name: "Annen linje", emojiName: "❌"},

    //spillroller
    {id: "1418312515485438072", name: "Overwatch", emojiId: "1424754432549191893"},
    {id: "1418312548343742584", name: "League of Legends", emojiId: "1424754475004067961"},
    {id: "1418312585006157876", name: "Minecraft", emojiId: "1424754459568898058"},
    {id: "1418312609286852901", name: "Roblox", emojiId: "1424755571567099925"},
    {id: "1418314383519518760", name: "Valorant", emojiId: "1424754444800622623" },
    {id: "1424743010654228560", name: "Marvel Rivals", emojiId: "1424754416849911858" },
    {id: "1425464377125113927", name: "Smash Bros", emojiId: "1425482804522782864" },
    {id: "1425482546438864906", name: "Counterstrike", emojiId: "1425482744179331215" },

    //hobbyroller
    {id: "1420108296861519915", name: "Trening", emojiName: "💪"} 
  
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


        let role = roles.find(role => role.emojiName === reaction.emoji.name || role.emojiId === reaction.emoji.id)
        if (!role) return;


        const member = await reaction.message.guild.members.fetch(user.id);
        await member.roles.remove(role.id);
        
    }
    
  },
};