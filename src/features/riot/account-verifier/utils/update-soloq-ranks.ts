import path from "path";
import { readFile, writeFile } from "fs/promises";
import { Client } from "discord.js";
import { VerificationSession } from "../types/session.js";
import { fetchSummonerByPuuid, fetchRankedInfo } from "./riot-api.js";
import { tierTranslation } from "../../constants/tiers.js";

const ACCOUNTS_FILE = path.resolve("src", "features", "riot", "data", "linked-accounts.json");

const VALID_SERVER_ROLES = new Set(["EUW", "NA", "LAN", "LAS"]);
const VALID_PREFERRED_ROLES = new Set(["TOP", "JGL", "MID", "ADC", "SUPP"]);

async function syncRole(
  member: import("discord.js").GuildMember,
  newRoleName: string | undefined,
  validRoleSet: Set<string>
) {
  if (!newRoleName) return;
  const newRoleNameUpper = newRoleName.toUpperCase();
  const existingRole = member.roles.cache.find(r => validRoleSet.has(r.name.toUpperCase()));

  if (existingRole?.name.toUpperCase() === newRoleNameUpper) return;

  if (existingRole) await member.roles.remove(existingRole).catch(() => {});
  const newRole = member.guild.roles.cache.find(r => r.name.toUpperCase() === newRoleNameUpper);
  if (newRole) await member.roles.add(newRole).catch(() => {});
}

export async function updateSoloRanks(client: Client<true>) {
  let updated = false;

  let accounts: Record<string, VerificationSession> = {};
  try {
    const raw = await readFile(ACCOUNTS_FILE, "utf-8");
    if (!raw.trim()) {
      console.log("linked-accounts.json is empty. Skipping update.");
      return;
    }
    accounts = JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read linked accounts:", err);
    return;
  }

  for (const [userId, account] of Object.entries(accounts)) {
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

      if (hasChanged) {
        const guild = client.guilds.cache.first();
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

            const newRoleObj = newTier ? guild.roles.cache.find(r => r.name.toLowerCase() === newTier.toLowerCase()) : undefined;
            if (newRoleObj) await member.roles.add(newRoleObj).catch(() => {});
            await syncRole(member, account.server, VALID_SERVER_ROLES);
            await syncRole(member, account.role, VALID_PREFERRED_ROLES);
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

        updated = true;
      }
    } catch (err) {
      console.warn(`Failed to update user ${userId}:`, err);
    }
  }

  if (updated) {
    await writeFile(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), "utf-8");
    console.log("Updated saved to linked-accounts.json");
  } else {
    console.log("No changes detected");
  }
}
