import { ButtonInteraction, MessageFlags } from "discord.js";
import { SessionManager } from "../sessions/session-manager.js";
import { fetchSummonerByPuuid } from "../utils/riot-api.js";
import { tierTranslation } from "../../constants/tiers.js";

export async function verifyIconChange(interaction: ButtonInteraction): Promise<void> {
  const session = SessionManager.get(interaction.user.id);

  if (!session) {
    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content: "❌ No se encontró ninguna sesión activa. Por favor, vuelve a comenzar el proceso."
    });
    return;
  }

  try {
    const updatedSummoner = await fetchSummonerByPuuid(session.puuid, session.server);

    const matched = updatedSummoner.profileIconId === session.expectedIconId;
    if (!matched) {
      await interaction.reply({
        flags: MessageFlags.Ephemeral,
        content:
          "❌ El icono actual no coincide con el requerido.\n" +
          "Asegúrate de haber guardado los cambios y vuelve a intentarlo."
      });
      return;
    }

    const guild = interaction.guild;
    const member = await guild?.members.fetch(interaction.user.id);
    const mentions: string[] = [];

    if (guild && member) {
      const tier = session.ranked?.solo?.tier;
      if (tier) {
        const translated = tierTranslation[tier.toUpperCase()];
        if (translated) {
          const role = guild.roles.cache.find(r =>
            r.name.toLowerCase() === translated.toLowerCase()
          );
          if (role) {
            await member.roles.add(role);
            mentions.push(`<@&${role.id}>`);
          }
        }
      }

      const serverRole = guild.roles.cache.find(r =>
        r.name.toLowerCase() === session.server.toLowerCase()
      );
      if (serverRole) {
        await member.roles.add(serverRole);
        mentions.push(`<@&${serverRole.id}>`);
      }

      if (session.role) {
        const customRole = guild.roles.cache.find(r =>
          r.name.toLowerCase() === session.role.toLowerCase()
        );
        if (customRole) {
          await member.roles.add(customRole);
          mentions.push(`<@&${customRole.id}>`);
        }
      }
    }

    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content:
        "✅ Icono verificado correctamente. Tu cuenta ha sido vinculada con éxito." +
        (mentions.length ? `\nRoles asignados: ${mentions.join(" y ")}` : "")
    });

  } catch (error) {
    console.error("Error al verificar icono:", error);
    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content: "🛑 Error inesperado."
    });
  }
}
