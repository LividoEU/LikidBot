import {
    Channel,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    GuildTextBasedChannel,
  } from "discord.js";
  
  export async function deployVerificationMessage(channel: Channel) {
    if (!channel.isTextBased() || !("send" in channel)) {
      console.error("❌ Target channel is not text-based or cannot send messages.");
      return;
    }
  
    const textChannel = channel as GuildTextBasedChannel;
  
    const messages = await textChannel.messages.fetch({ limit: 100 });
    for (const msg of messages.values()) {
      try {
        await msg.delete();
      } catch (err) {
        console.warn(`⚠️ No se pudo borrar mensaje ${msg.id}: ${err}`);
      }
    }
  
    const embed = new EmbedBuilder()
      .setTitle("🔗 VINCULAR CUENTA PARA SHADEMY 🔗")
      .setDescription(
        `Para que se te asignen los roles de elo de tu cuenta adecuadamente, por favor vincula tu cuenta de League of Legends.`
      )
      .setColor("Blurple");
  
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("start-verification")
        .setLabel("Vincular cuenta")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("refresh-data")
        .setLabel("Actualizar datos")
        .setStyle(ButtonStyle.Secondary)
    );
  
    await textChannel.send({ embeds: [embed], components: [row] });
  }
  