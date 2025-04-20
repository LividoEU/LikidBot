import { ButtonInteraction } from "discord.js";
import fetch from "node-fetch";
import { SessionManager } from "../../session/sessionManager";
import { SummonerResponse } from "../../types/riot";
import {
  RIOT_TOKEN,
  RIOT_SUMMONER_BASE,
  PROFILE_ICON_VERSION
} from "../../constants/mainConst";

export async function handleVerifyIconChange(interaction: ButtonInteraction) {
  const session = SessionManager.get(interaction.user.id);

  if (!session) {
    await interaction.reply({
      ephemeral: true,
      content: "❌ No se encontró ninguna sesión activa. Por favor, vuelve a comenzar el proceso."
    });
    return;
  }

  try {
    const res = await fetch(
      `${RIOT_SUMMONER_BASE}/lol/summoner/v4/summoners/by-puuid/${session.puuid}`,
      {
        headers: { "X-Riot-Token": RIOT_TOKEN }
      }
    );

    if (!res.ok) {
      await interaction.reply({
        ephemeral: true,
        content: "❌ No se pudieron obtener los datos actualizados del invocador."
      });
      return;
    }

    const updatedSummoner = (await res.json()) as SummonerResponse;

    if (updatedSummoner.profileIconId === session.expectedIconId) {
      // TODO: Asignar roles, registrar verificación, etc.
      await interaction.reply({
        ephemeral: true,
        content: "✅ Icono verificado correctamente. Tu cuenta ha sido vinculada con éxito."
      });
    } else {
      await interaction.reply({
        ephemeral: true,
        content:
          `❌ El icono actual (${updatedSummoner.profileIconId}) no coincide con el requerido (${session.expectedIconId}).\n` +
          `Asegúrate de haber guardado los cambios y vuelve a intentarlo.`
      });
    }
  } catch (error) {
    console.error("❌ Error al verificar icono:", error);
    await interaction.reply({
      ephemeral: true,
      content: "❌ Error inesperado al contactar con Riot API."
    });
  }
}
