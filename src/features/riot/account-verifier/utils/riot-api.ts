import fetch from "node-fetch";
import { RIOT_TOKEN } from "../../constants/consts";
import { RiotAccountResponse, SummonerResponse } from "../types/riot";
import { VerificationSession } from "../types/sessions";

// Maps server code to API routing regions
const SERVER_REGION_MAP: Record<string, string> = {
  EUW: "euw1",
  LAN: "la1",
  LAS: "la2",
  NA: "na1"
};

const ACCOUNT_REGION_MAP: Record<string, string> = {
  EUW: "europe",
  LAN: "americas",
  LAS: "americas",
  NA: "americas"
};

function getServerRegion(server: string): string {
  return SERVER_REGION_MAP[server.toUpperCase()];
}

function getAccountRegion(server: string): string {
  return ACCOUNT_REGION_MAP[server.toUpperCase()];
}

export async function fetchRiotAccountByRiotId(
  name: string,
  tag: string,
  server: string
): Promise<RiotAccountResponse> {
  const region = getAccountRegion(server);
  const url = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;

  const res = await fetch(url, {
    headers: { "X-Riot-Token": RIOT_TOKEN }
  });

  if (!res.ok) throw new Error(`Cuenta no encontrada: ${name}#${tag}`);

  return (await res.json()) as RiotAccountResponse;
}

export async function fetchSummonerByPuuid(puuid: string, server: string): Promise<SummonerResponse> {
  const region = getServerRegion(server);
  const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;

  const res = await fetch(url, {
    headers: { "X-Riot-Token": RIOT_TOKEN }
  });

  if (!res.ok) throw new Error(`No se pudieron obtener datos del invocador.`);

  return (await res.json()) as SummonerResponse;
}

export async function fetchRankedInfo(puuid: string, server: string): Promise<VerificationSession["ranked"] & {
  serverRegion: string;
  accountRegion: string;
}> {
  const serverRegion = getServerRegion(server);
  const accountRegion = getAccountRegion(server);
  const url = `https://${serverRegion}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;

  const res = await fetch(url, {
    headers: { "X-Riot-Token": RIOT_TOKEN }
  });

  if (!res.ok) {
    return {
      solo: undefined,
      flex: undefined,
      serverRegion,
      accountRegion
    };
  }

  const data = await res.json();
  const solo = data.find((e: any) => e.queueType === "RANKED_SOLO_5x5") || null;
  const flex = data.find((e: any) => e.queueType === "RANKED_FLEX_SR") || null;

  return {
    solo,
    flex,
    serverRegion,
    accountRegion
  };
}
