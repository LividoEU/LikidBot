import {
  ButtonInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionReplyOptions,
  MessageFlags
} from "discord.js";

export async function startVerification(interaction: ButtonInteraction): Promise<void> {
  const reply: InteractionReplyOptions = {
    flags: MessageFlags.Ephemeral,
    content:
      "Para comenzar el proceso de verificación, asegúrate de tener acceso a tu cuenta de League of Legends.\n" +
      "Se te pedirá que cambies tu icono de invocador más adelante como método de validación.",
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("acknowledge-verification")
          .setLabel("☑️ Lo entiendo")
          .setStyle(ButtonStyle.Secondary)
      )
    ]
  };

  await interaction.reply(reply);
}
