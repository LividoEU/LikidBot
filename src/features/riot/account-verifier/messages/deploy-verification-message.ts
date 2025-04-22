import {
  Channel,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  GuildTextBasedChannel
} from "discord.js";

export async function deployVerificationMessage(channel: Channel): Promise<void> {
  if (!channel.isTextBased() || !("send" in channel)) {
    console.error("El canal no es de texto o no puede enviar mensajes.");
    return;
  }

  const textChannel = channel as GuildTextBasedChannel;

  try {
    const messages = await textChannel.messages.fetch({ limit: 100 });
    for (const message of messages.values()) {
      try {
        await message.delete();
      } catch (err) {
        console.warn(`No se pudo borrar el mensaje ${message.id}:`, err);
      }
    }
  } catch (err) {
    console.error("Error al intentar limpiar el canal:", err);
  }

  const embed = new EmbedBuilder()
    .setTitle("🔗 VINCULAR CUENTA PARA SHADEMY 🔗")
    .setDescription("Para que se te asignen los roles de elo de tu cuenta adecuadamente, por favor vincula tu cuenta de League of Legends.")
    .setColor("Blurple");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("start-verification")
      .setLabel("🔗 Vincular cuenta")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
    .setCustomId("update-summoner-data")
    .setLabel("🔁 Actualizar datos")
    .setStyle(ButtonStyle.Primary)
  );

  await textChannel.send({ embeds: [embed], components: [row] });
}
