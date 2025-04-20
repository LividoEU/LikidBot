import { ButtonInteraction } from "discord.js";

export async function handleButtonInteraction(interaction: ButtonInteraction) {
  const { customId } = interaction;

  try {
    switch (customId) {
      case "start-verification": {
        const { startVerification } = await import("../../riot/account-verifier/startVerification");
        await startVerification(interaction);
        break;
      }

      case "acknowledge-verification": {
        const { showSummonerInfoModal } = await import("../../riot/account-verifier/modals/showSummonerInfoModal");
        await showSummonerInfoModal(interaction);
        break;
      }

      case "confirm-account": {
        const { confirmAccount } = await import("../../riot/account-verifier/confirmAccount");
        await confirmAccount(interaction);
        break;
      }

      case "verify-icon-change": {
        const { verifyIconChange } = await import("../../riot/account-verifier/verifyIconChange");
        await verifyIconChange(interaction);
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
