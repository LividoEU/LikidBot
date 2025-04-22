import { RankedEntry } from "./ranked-entry.js";

export interface VerificationSession {
  puuid: string;
  gameName: string;
  tagLine: string;
  summonerLevel: number;
  profileIconId: number;
  expectedIconId?: number;
  server: string;
  role: string;
  serverRegion: string;
  accountRegion: string;
  ranked?: {
    solo?: RankedEntry;
    flex?: RankedEntry;
  };
}
