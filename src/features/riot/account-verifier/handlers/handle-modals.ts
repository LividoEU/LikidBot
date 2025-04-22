import { MessageFlags, ModalSubmitInteraction } from "discord.js";

export async function handleModalInteraction(interaction: ModalSubmitInteraction): Promise<void> {
  const { customId } = interaction;

  try {
    switch (customId) {
      case "summoner-info": {
        const { summonerInfo } = await import("../messages/summoner-info.js");
        await summonerInfo(interaction);
        break;
      }

      default:
        console.warn(`Modal sin manejar: ${customId}`);
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: "❌ Este formulario no está soportado.",
            flags: MessageFlags.Ephemeral
          });
        }
        break;
    }
  } catch (err) {
    console.error(`Error al manejar el modal "${customId}":`, err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ Error al manejar el formulario.",
        flags: MessageFlags.Ephemeral
      });
    }
  }
}
