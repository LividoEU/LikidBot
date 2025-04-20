import { ButtonInteraction } from "discord.js";
import fetch from "node-fetch";
import { SessionManager } from "../../session/sessionManager";
import { SummonerResponse } from "../../types/riot";
import {
  RIOT_TOKEN,
  RIOT_SUMMONER_BASE,
  PROFILE_ICON_VERSION
} from "../../constants/mainConst";

const tierTranslation: Record<string, string> = {
  CHALLENGER: "Challenger",
  GRANDMASTER: "Gran Maestro",
  MASTER: "Master",
  DIAMOND: "Diamante",
  EMERALD: "Esmeralda",
  PLATINUM: "Platino",
  GOLD: "Oro",
  SILVER: "Plata",
  BRONZE: "Bronce",
  IRON: "Hierro"
};

export async function verifyIconChange(interaction: ButtonInteraction) {
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
      const guild = interaction.guild;
      const member = await guild?.members.fetch(interaction.user.id);
      const tier = session.ranked?.solo?.tier;
      let roleMention: string | null = null;

      if (guild && member && tier) {
        const translatedRole = tierTranslation[tier.toUpperCase()];
        if (translatedRole) {
          const role = guild.roles.cache.find(
            r => r.name.toLowerCase() === translatedRole.toLowerCase()
          );

          if (role) {
            await member.roles.add(role);
            roleMention = `<@&${role.id}>`;
          } else {
            console.warn(`⚠️ Rol no encontrado: ${translatedRole}`);
          }
        }
      }

      await interaction.reply({
        ephemeral: true,
        content: `✅ Icono verificado correctamente. Tu cuenta ha sido vinculada con éxito.` +
                 (roleMention ? `\nRol asignado: ${roleMention}` : "")
      });
    } else {
      await interaction.reply({
        ephemeral: true,
        content:
          `❌ El icono actual no coincide con el requerido.\n` +
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
