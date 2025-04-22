import path from "path";
import { readFile, writeFile } from "fs/promises";
import { ButtonInteraction, MessageFlags } from "discord.js";
import { VerificationSession } from "../types/session.js";
import { fetchSummonerByPuuid, fetchRankedInfo } from "../utils/riot-api.js";
import { tierTranslation } from "../../constants/tiers.js";

const ACCOUNTS_FILE = path.resolve("src", "features", "riot", "data", "linked-accounts.json");

export async function updateSingleUserRank(interaction: ButtonInteraction): Promise<void> {
  const userId = interaction.user.id;

  let accounts: Record<string, VerificationSession> = {};
  try {
    const raw = await readFile(ACCOUNTS_FILE, "utf-8");
    if (!raw.trim()) throw new Error();
    accounts = JSON.parse(raw);
  } catch {
    await interaction.editReply({
      content: "❌ No se pudo leer el archivo de cuentas vinculadas."
    });
    return;
  }

  const account = accounts[userId];
  if (!account) {
    await interaction.editReply({
      content: "❌ Primero vincula tu cuenta con el bot."
    });
    return;
  }

  const oldSoloTier = account.ranked?.solo?.tier ?? null;

  try {
    const [summoner, ranked] = await Promise.all([
      fetchSummonerByPuuid(account.puuid, account.server),
      fetchRankedInfo(account.puuid, account.server)
    ]);

    const newSoloTier = ranked.solo?.tier ?? null;
    const newRanked = ranked.solo || ranked.flex
      ? {
          solo: ranked.solo ?? undefined,
          flex: ranked.flex ?? undefined
        }
      : undefined;

    const oldSerialized = JSON.stringify({
      ranked: account.ranked,
      summonerLevel: account.summonerLevel,
      profileIconId: account.profileIconId
    });

    const newSerialized = JSON.stringify({
      ranked: newRanked,
      summonerLevel: summoner.summonerLevel,
      profileIconId: summoner.profileIconId
    });

    const hasChanged = oldSerialized !== newSerialized;
    if (!hasChanged) {
      await interaction.editReply({
        content: "❕No hay cambios nuevos en los datos del invocador."
      });
      return;
    }

    const guild = interaction.guild;
    if (guild) {
      try {
        const member = await guild.members.fetch(userId);

        // Tier Role
        const oldTier = tierTranslation[oldSoloTier?.toUpperCase() || ""];
        const newTier = tierTranslation[newSoloTier?.toUpperCase() || ""];

        if (oldTier && oldTier !== newTier) {
          const oldRoleObj = guild.roles.cache.find(r => r.name.toLowerCase() === oldTier.toLowerCase());
          if (oldRoleObj) await member.roles.remove(oldRoleObj).catch(() => {});
        }

        const newRoleObj = guild.roles.cache.find(r => r.name.toLowerCase() === newTier.toLowerCase());
        if (newRoleObj) await member.roles.add(newRoleObj).catch(() => {});

        // Server Role
        const currentServer = account.server.toUpperCase();
        const existingServerRole = member.roles.cache.find(r =>
          ["EUW", "NA", "LAN", "LAS"].includes(r.name.toUpperCase())
        );
        if (existingServerRole?.name.toUpperCase() !== currentServer) {
          if (existingServerRole) await member.roles.remove(existingServerRole).catch(() => {});
          const serverRole = guild.roles.cache.find(r => r.name.toUpperCase() === currentServer);
          if (serverRole) await member.roles.add(serverRole).catch(() => {});
        }

        // Preferred Role (TOP, JGL, etc.)
        const currentPreferred = account.role.toUpperCase();
        const existingPreferred = member.roles.cache.find(r =>
          ["TOP", "JGL", "MID", "ADC", "SUPP"].includes(r.name.toUpperCase())
        );
        if (existingPreferred?.name.toUpperCase() !== currentPreferred) {
          if (existingPreferred) await member.roles.remove(existingPreferred).catch(() => {});
          const newPreferredRole = guild.roles.cache.find(r => r.name.toUpperCase() === currentPreferred);
          if (newPreferredRole) await member.roles.add(newPreferredRole).catch(() => {});
        }
      } catch (err) {
        console.warn(`Could not update roles for ${userId}:`, err);
      }
    }

    accounts[userId] = {
      ...account,
      summonerLevel: summoner.summonerLevel,
      profileIconId: summoner.profileIconId,
      ranked: newRanked
    };

    await writeFile(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), "utf-8");

    await interaction.editReply({
      content: "✅ Datos del invocador actualizados correctamente."
    });
  } catch (err) {
    console.error("Error al actualizar datos del invocador:", err);
    await interaction.editReply({
      content: "❌ Error al obtener datos actualizados del invocador."
    });
  }
}
