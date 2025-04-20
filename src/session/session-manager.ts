interface VerificationSession {
    puuid: string;
    gameName: string;
    tagLine: string;
    summonerLevel: number;
    profileIconId: number;
    expectedIconId?: number;
  }
  
  const sessions = new Map<string, VerificationSession>();
  
  export const SessionManager = {
    get: (userId: string): VerificationSession | undefined => sessions.get(userId),
    set: (userId: string, data: VerificationSession) => sessions.set(userId, data),
    delete: (userId: string) => sessions.delete(userId),
  };
  