import path from "path";
import { readFile, writeFile } from "fs/promises";
import { Client } from "discord.js";
import { VerificationSession } from "../types/session.js";
import { fetchSummonerByPuuid, fetchRankedInfo } from "./riot-api.js";
import { tierTranslation } from "../../constants/tiers.js";

const ACCOUNTS_FILE = path.resolve("src", "features", "riot", "data", "linked-accounts.json");

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
