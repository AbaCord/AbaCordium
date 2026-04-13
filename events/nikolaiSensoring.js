const nikolaiId = 559459559249543213;
const sofusId = 447393541828902913;
const quotesId = 1406944334003310592;

module.exports = {
    name: "messageCreate",
    once: false,
    async execute(message, client) {
        try {
            if (message.author.id == nikolaiId && message.channel.id != quotesId) {
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
