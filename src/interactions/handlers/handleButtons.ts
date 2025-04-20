import { ButtonInteraction } from "discord.js";

export async function handleButtonInteraction(interaction: ButtonInteraction) {
  const { customId } = interaction;

  try {
    switch (customId) {
      case "start-verification": {
        const { handleStartVerification } = await import("../buttons/start-verification");
        await handleStartVerification(interaction);
        break;
      }

      case "acknowledge-verification": {
        const { showSummonerInfoModal } = await import("../modals/request-summoner-info");
        await showSummonerInfoModal(interaction);
        break;
      }

      default:
        console.warn(`⚠️ Botón sin manejar: ${customId}`);
        break;
    }
  } catch (err) {
    console.error(`❌ Error al manejar el botón ${customId}:`, err);
    if (!interaction.replied) {
      await interaction.reply({ content: "❌ Error al manejar el botón.", ephemeral: true });
    }
  }
}
