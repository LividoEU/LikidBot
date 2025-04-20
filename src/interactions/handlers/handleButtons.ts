import { ButtonInteraction } from "discord.js";

export async function handleButtonInteraction(interaction: ButtonInteraction) {
  const { customId } = interaction;

  try {
    switch (customId) {
      case "start-verification": {
        const { handleStartVerification } = await import("../../riot/account-verifier/startVerification");
        await handleStartVerification(interaction);
        break;
      }

      case "acknowledge-verification": {
        const { showSummonerInfoModal } = await import("../../riot/account-verifier/modals/requestSummonerInfo");
        await showSummonerInfoModal(interaction);
        break;
      }

      case "confirm-account": {
        const { handleConfirmAccount } = await import("../../riot/account-verifier/confirmAccount");
        await handleConfirmAccount(interaction);
        break;
      }

      case "verify-icon-change": {
        const { handleVerifyIconChange } = await import("../../riot/account-verifier/verifyIconChange");
        await handleVerifyIconChange(interaction);
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
