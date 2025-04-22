import { writeFile, readFile } from "fs/promises";
import path from "path";
import { VerificationSession } from "../types/session.js";


const ACCOUNTS_FILE = path.resolve("src", "features", "riot", "data", "linked-accounts.json");

export async function storeLinkedAccount(userId: string, session: VerificationSession) {
  try {
    let existingData: Record<string, VerificationSession> = {};

    try {
      const raw = await readFile(ACCOUNTS_FILE, "utf-8");
      existingData = JSON.parse(raw);
    } catch {
      // File might not exist yet — ignore
    }

    const cleanedSession: VerificationSession = {
      puuid: session.puuid,
      gameName: session.gameName,
      tagLine: session.tagLine,
      summonerLevel: session.summonerLevel,
      profileIconId: session.profileIconId,
      server: session.server,
      role: session.role,
      serverRegion: session.serverRegion,
      accountRegion: session.accountRegion,
      ranked: session.ranked
        ? {
            solo: session.ranked.solo ? cleanRankData(session.ranked.solo) : undefined,
            flex: session.ranked.flex ? cleanRankData(session.ranked.flex) : undefined
          }
        : undefined
    };

    existingData[userId] = cleanedSession;

    await writeFile(
      ACCOUNTS_FILE,
      JSON.stringify(existingData, null, 2),
      "utf-8"
    );
  } catch (err) {
    console.error("Error saving linked account data:", err);
  }
}

function cleanRankData(entry: {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  leagueId?: string;
  summonerId?: string;
  veteran?: boolean;
  inactive?: boolean;
  freshBlood?: boolean;
  hotStreak?: boolean;
  [key: string]: any;
}) {
  return {
    queueType: entry.queueType,
    tier: entry.tier,
    rank: entry.rank,
    leaguePoints: entry.leaguePoints,
    wins: entry.wins,
    losses: entry.losses,
    leagueId: entry.leagueId ?? "",
    summonerId: entry.summonerId ?? "",
    veteran: entry.veteran ?? false,
    inactive: entry.inactive ?? false,
    freshBlood: entry.freshBlood ?? false,
    hotStreak: entry.hotStreak ?? false
  };
}
