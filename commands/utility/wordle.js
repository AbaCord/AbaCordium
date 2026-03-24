import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

const QUOTE_CHANNEL_ID = "1406944334003310592";
const PAGE_SIZE = 10;

function formatDate(date) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${d}/${m}/${y} ${h}:${min}`;
}

async function fetchAllMessages(channel, limit = 5000) {
  const messages = [];
  let lastId;

  while (messages.length < limit) {
    const fetched = await channel.messages.fetch({
      limit: Math.min(100, limit - messages.length),
      before: lastId,
    });
    if (!fetched.size) break;
    messages.push(...fetched.values());
    lastId = fetched.last().id;
  }
  return messages;
}

function buildRankList(entries) {
  const medals = ["🥇", "🥈", "🥉"];

  const top3 = entries
    .slice(0, 3)
    .map(([id, count], i) => `${medals[i]} <@${id}> — **${count}**`);

  const rest = entries
    .slice(3)
    .map(([id, count], i) => `${i + 4}. <@${id}> — **${count}**`);

  return [...top3, "", ...rest].join("\n");
}

export const data = new SlashCommandBuilder()
  .setName("quote")
  .setDescription("Quotes i Abacord")
  .addSubcommand((sub) =>
    sub
      .setName("leaderboard")
      .setDescription("Finn siterte og anmeldere i AbaCord!")
      .addIntegerOption((opt) =>
        opt.setName("year").setDescription("Filtrer på år").setRequired(false)
      )
      .addBooleanOption((opt) =>
        opt.setName("siterte").setDescription("Mest siterte brukere")
      )
      .addBooleanOption((opt) =>
        opt.setName("anmeldere").setDescription("Mest aktive anmeldere")
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("user")
      .setDescription("Beste quotes av en bruker")
      .addUserOption((opt) =>
        opt.setName("target").setDescription("Bruker").setRequired(true)
      )
  );
export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const channel = await interaction.client.channels.fetch(QUOTE_CHANNEL_ID);

  if (!channel?.isTextBased()) {
    return interaction.reply({ content: "Ugyldig kanal.", ephemeral: true });
  }

  await interaction.deferReply();
  const messages = await fetchAllMessages(channel);
  const year = interaction.options.getInteger("year");

  if (sub === "leaderboard") {
    const quoted = interaction.options.getBoolean("siterte");
    const quoters = interaction.options.getBoolean("anmeldere");

    const validMessages = messages.filter(
      (m) =>
        m.mentions.users.size > 0 &&
        (!year || m.createdAt.getFullYear() === year)
    );

    if (!validMessages.length) {
      return interaction.editReply("Fant ingen Abaquotes.");
    }

    if (quoted || quoters) {
      const map = new Map();

      for (const msg of validMessages) {
        if (quoted) {
          for (const user of msg.mentions.users.values()) {
            map.set(user.id, (map.get(user.id) || 0) + 1);
          }
        } else {
          map.set(msg.author.id, (map.get(msg.author.id) || 0) + 1);
        }
      }

      const top = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

      const title = quoted
        ? year
          ? `**Beste siterte i AbaCord (${year})**`
          : `**Beste siterte i AbaCord**`
        : year
        ? `**Beste anmeldere i AbaCord (${year})**`
        : `**Beste anmeldere i AbaCord**`;

      const embed = new EmbedBuilder()
        .setColor("Random")
        .setTitle(title)
        .setDescription(buildRankList(top));

      return interaction.editReply({ embeds: [embed] });
    }

    const quotes = validMessages
      .map((msg) => ({
        content: msg.content,
        mentioned: msg.mentions.users.first(),
        author: `<@${msg.author.id}>`,
        date: msg.createdAt,
        reactions: msg.reactions.cache.reduce((s, r) => s + r.count, 0),
        url: msg.url,
      }))
      .sort((a, b) => b.reactions - a.reactions)
      .slice(0, 10);

    const embed = new EmbedBuilder()
      .setColor("Random")
      .setTitle(
        year ? `**Beste Abaquotes i ${year}**` : `**Tidenes Abaquotes**`
      )
      .setDescription(
        quotes
          .map(
            (q, i) =>
              `**#${i + 1} - ${q.mentioned.tag}**\n${q.content}\nQuota av: ${
                q.author
              } — ${formatDate(q.date)}\n[Se den](${q.url})`
          )
          .join("\n\n")
      );

    return interaction.editReply({ embeds: [embed] });
  }

  if (sub === "user") {
    const target = interaction.options.getUser("target");

    const userQuotes = messages
      .filter((msg) => msg.mentions.users.has(target.id))
      .map((msg) => ({
        content: msg.content,
        author: `<@${msg.author.id}>`,
        date: msg.createdAt,
        reactions: msg.reactions.cache.reduce((s, r) => s + r.count, 0),
        url: msg.url,
      }))
      .sort((a, b) => b.reactions - a.reactions);

    if (!userQuotes.length) {
      return interaction.editReply(`${target} har ingen Abaquotes enda.`);
    }

    let page = 0;
    const totalPages = Math.ceil(userQuotes.length / PAGE_SIZE);

    const buildEmbed = () =>
      new EmbedBuilder()
        .setColor("Random")
        .setTitle(`**${target.tag} — ${userQuotes.length} Abaquotes**`)
        .setDescription(
          userQuotes
            .slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
            .map(
              (q, i) =>
                `**#${page * PAGE_SIZE + i + 1} - ${formatDate(q.date)}**\n${
                  q.content
                }\nQuota av: ${q.author}\n[Se den](${q.url})`
            )
            .join("\n\n")
        )
        .setFooter({ text: `Side ${page + 1}/${totalPages}` });

    if (totalPages === 1) {
      return interaction.editReply({ embeds: [buildEmbed()] });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prev")
        .setLabel("◀")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("▶")
        .setStyle(ButtonStyle.Secondary)
    );

    const message = await interaction.editReply({
      embeds: [buildEmbed()],
      components: [row],
    });

    const collector = message.createMessageComponentCollector({
      time: 120000,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "Ikke menyen din.", ephemeral: true });
      }
      if (i.customId === "next" && page < totalPages - 1) page++;
      if (i.customId === "prev" && page > 0) page--;
      await i.update({ embeds: [buildEmbed()], components: [row] });
    });

    collector.on("end", async () => {
      await message.edit({ components: [] });
    });
  }
}
