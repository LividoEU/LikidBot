import { ButtonInteraction, MessageFlags } from "discord.js";

export async function handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
  const { customId } = interaction;

  try {
    switch (customId) {
      case "start-verification": {
        const { startVerification } = await import("../messages/start-verification.js");
        await startVerification(interaction);
        break;
      }

      case "acknowledge-verification": {
        const { showSummonerInfoModal } = await import("../modals/summoner-info-modal.js");
        await showSummonerInfoModal(interaction);
        break;
      }

      case "confirm-account": {
        const { confirmAccount } = await import("../messages/confirm-account.js");
        await confirmAccount(interaction);
        break;
      }

      case "verify-icon-change": {
        const { verifyIconChange } = await import("../messages/verify-icon-change.js");
        await verifyIconChange(interaction);
        break;
      }

      default:
        console.warn(`⚠️ Botón sin manejar: ${customId}`);
    }
  } catch (err) {
    console.error(`❌ Error al manejar el botón "${customId}":`, err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ Error al manejar el botón.",
        flags: MessageFlags.Ephemeral
      });
    }
  }
}
