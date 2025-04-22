import { ButtonInteraction, MessageFlags } from "discord.js";
import { updateSoloRanks } from "../utils/update-soloq-ranks.js";

const cooldownMap = new Map<string, number>();
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export async function updateSummonerData(interaction: ButtonInteraction): Promise<void> {
  const now = Date.now();
  const lastUsed = cooldownMap.get(interaction.user.id) || 0;

  if (now - lastUsed < COOLDOWN_MS) {
    const remaining = Math.ceil((COOLDOWN_MS - (now - lastUsed)) / 1000);
    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content: `⏳ Espera ${remaining} segundos antes de volver a actualizar.`
    });
    return;
  }

  cooldownMap.set(interaction.user.id, now);

  try {
    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content: "🔁 Actualizando datos del invocador..."
    });

    await updateSoloRanks(interaction.client);

    await interaction.editReply({
      content: "✅ Datos actualizados correctamente."
    });
  } catch (err) {
    console.error("Error updating summoner data:", err);
    await interaction.editReply({
      content: "❌ Error al actualizar los datos del invocador."
    });
  }
}
