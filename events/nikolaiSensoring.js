const nikolaiId = 559459559249543213;
const sofusId = 447393541828902913;


module.exports = {
    name: "messageCreate",
    once: false,
    async execute(message, client) {
        try {
            if (message.author.id == nikolaiId) {
                let content = message.content;
                let channel = message.channel;
                await message.delete();
                await channel.send("Nikolai: ||" + content + "||");
            };

        } catch (err) {
            console.error(err);
        }
    },
};