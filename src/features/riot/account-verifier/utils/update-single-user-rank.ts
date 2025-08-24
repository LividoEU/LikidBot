import path from "path";
import { readFile, writeFile } from "fs/promises";
import { ButtonInteraction, GuildMember, Guild } from "discord.js";
import { VerificationSession } from "../types/session.js";
import { RoleUpdateConfig } from "../types/role-management.js";
import { fetchSummonerByPuuid, fetchRankedInfo } from "../utils/riot-api.js";
import { tierTranslation } from "../../constants/tiers.js";

const ACCOUNTS_FILE = path.resolve("src", "features", "riot", "data", "linked-accounts.json");

async function loadAccounts(): Promise<Record<string, VerificationSession> | null> {
  try {
    const raw = await readFile(ACCOUNTS_FILE, "utf-8");
    if (!raw.trim()) {
      console.warn("Accounts file is empty");
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to load accounts file:", error);
    return null;
  }
}

async function saveAccounts(accounts: Record<string, VerificationSession>): Promise<boolean> {
  try {
    await writeFile(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to save accounts file:", error);
    return false;
  }
}

async function updateRoleForMember(
  member: GuildMember,
  guild: Guild,
  config: RoleUpdateConfig
): Promise<void> {
  const currentRole = config.getCurrentRole(member);
  const targetRole = guild.roles.cache.find(r => 
    r.name.toUpperCase() === config.currentValue.toUpperCase()
  );

  if (currentRole?.name.toUpperCase() === config.currentValue.toUpperCase()) {
    return;
  }

  try {
    if (currentRole) {
      await member.roles.remove(currentRole);
    }
    if (targetRole) {
      await member.roles.add(targetRole);
    }
  } catch (error) {
    console.warn(`Failed to update ${config.type} role for member ${member.id}:`, error);
  }
}

async function updateMemberRoles(
  member: GuildMember,
  guild: Guild,
  account: VerificationSession,
  oldSoloTier: string | null,
  newSoloTier: string | null
): Promise<void> {
  const roleConfigs: RoleUpdateConfig[] = [
    {
      type: 'tier',
      currentValue: tierTranslation[newSoloTier?.toUpperCase() || ""] || "",
      possibleValues: Object.values(tierTranslation),
      getCurrentRole: (member) => member.roles.cache.find(r => 
        Object.values(tierTranslation)
          .map(tier => tier.toLowerCase())
          .includes(r.name.toLowerCase())
      )
    },
    {
      type: 'server',
      currentValue: account.server.toUpperCase(),
      possibleValues: ["EUW", "NA", "LAN", "LAS"],
      getCurrentRole: (member) => member.roles.cache.find(r =>
        ["EUW", "NA", "LAN", "LAS"].includes(r.name.toUpperCase())
      )
    },
    {
      type: 'preferred',
      currentValue: account.role.toUpperCase(),
      possibleValues: ["TOP", "JGL", "MID", "ADC", "SUPP"],
      getCurrentRole: (member) => member.roles.cache.find(r =>
        ["TOP", "JGL", "MID", "ADC", "SUPP"].includes(r.name.toUpperCase())
      )
    }
  ];

  for (const config of roleConfigs) {
    if (config.currentValue) {
      await updateRoleForMember(member, guild, config);
    }
  }
}

export async function updateSingleUserRank(interaction: ButtonInteraction): Promise<void> {
  const userId = interaction.user.id;

  const accounts = await loadAccounts();
  if (!accounts) {
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

    if (!summoner || !ranked) {
      await interaction.editReply({
        content: "❌ No se pudieron obtener los datos del invocador desde la API de Riot."
      });
      return;
    }

    const newSoloTier = ranked.solo?.tier ?? null;
    const newRanked = (ranked.solo || ranked.flex)
      ? {
          solo: ranked.solo ?? undefined,
          flex: ranked.flex ?? undefined
        }
      : undefined;

    const oldData = {
      ranked: account.ranked,
      summonerLevel: account.summonerLevel,
      profileIconId: account.profileIconId
    };

    const newData = {
      ranked: newRanked,
      summonerLevel: summoner.summonerLevel,
      profileIconId: summoner.profileIconId
    };

    const hasChanged = JSON.stringify(oldData) !== JSON.stringify(newData);
    if (!hasChanged) {
      await interaction.editReply({
        content: "❕No hay cambios nuevos en los datos del invocador."
      });
      return;
    }

    if (interaction.guild) {
      try {
        const member = await interaction.guild.members.fetch(userId);
        await updateMemberRoles(member, interaction.guild, account, oldSoloTier, newSoloTier);
      } catch (error) {
        console.warn(`Could not update roles for user ${userId}:`, error);
      }
    }

    accounts[userId] = {
      ...account,
      summonerLevel: summoner.summonerLevel,
      profileIconId: summoner.profileIconId,
      ranked: newRanked
    };

    const saveSuccess = await saveAccounts(accounts);
    if (!saveSuccess) {
      await interaction.editReply({
        content: "❌ Error al guardar los datos actualizados."
      });
      return;
    }

    await interaction.editReply({
      content: "✅ Datos del invocador actualizados correctamente."
    });
  } catch (error) {
    console.error("Error al actualizar datos del invocador:", error);
    
    const errorMessage = error instanceof Error 
      ? `❌ Error al actualizar datos: ${error.message}`
      : "❌ Error desconocido al obtener datos actualizados del invocador.";
    
    await interaction.editReply({
      content: errorMessage
    });
  }
}
