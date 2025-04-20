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
      .setTitle("🔗 VINCULAR CUENTAS Y BÚSQUEDA DE PARTIDA 🔍")
      .setDescription(
        `Para que podáis buscar partida de forma eficiente, debéis vincular vuestra cuenta de League of Legends.\n\n` +
        `**❓ FAQ**\n` +
        `• ¿Debo volver a verificar la cuenta? No, se verificará automáticamente al introducir el invocador.\n` +
        `• ¿Límite de cuentas? Máximo 3 cuentas.\n` +
        `• ¿Cómo elimino una cuenta? Usando el botón "Ver cuentas".\n` +
        `• ¿No se actualizó mi división? Pulsa "Actualizar datos".`
      )
      .setColor("Blurple");
  
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("start-verification")
        .setLabel("Vincular cuenta")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("view-accounts")
        .setLabel("Ver cuentas")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("refresh-data")
        .setLabel("Actualizar datos")
        .setStyle(ButtonStyle.Secondary)
    );
  
    await textChannel.send({ embeds: [embed], components: [row] });
  }
  