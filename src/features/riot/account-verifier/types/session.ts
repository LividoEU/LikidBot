export interface VerificationSession {
  puuid: string;
  gameName: string;
  tagLine: string;
  summonerLevel: number;
  profileIconId: number;
  expectedIconId: number;
  server: string;
  role: string;
  serverRegion: string;
  accountRegion: string;
  ranked?: {
    solo?: {
      queueType: string;
      tier: string;
      rank: string;
      leaguePoints: number;
      wins: number;
      losses: number;
    };
    flex?: {
      queueType: string;
      tier: string;
      rank: string;
      leaguePoints: number;
      wins: number;
      losses: number;
    };
  } | null;
}
