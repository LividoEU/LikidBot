import { VerificationSession } from "../types/session";

type ExpiringSession = {
  data: VerificationSession;
  expiresAt: number;
};

const TTL_MS = 5 * 60 * 1000; // 5 minutes

const sessions = new Map<string, ExpiringSession>();

export const SessionManager = {
  get(userId: string): VerificationSession | undefined {
    const entry = sessions.get(userId);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      sessions.delete(userId);
      return undefined;
    }
    return entry.data;
  },

  set(userId: string, data: VerificationSession): void {
    sessions.set(userId, {
      data,
      expiresAt: Date.now() + TTL_MS
    });
  },

  delete(userId: string): void {
    sessions.delete(userId);
  },

  has(userId: string): boolean {
    return sessions.has(userId);
  },

  clear(): void {
    sessions.clear();
  },

  debug(): void {
    console.table(
      Array.from(sessions.entries()).map(([id, { expiresAt }]) => ({
        userId: id,
        expiresInSeconds: Math.floor((expiresAt - Date.now()) / 1000)
      }))
    );
  }
};

// Auto-cleanup expired sessions every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [userId, { expiresAt }] of sessions.entries()) {
    if (expiresAt <= now) {
      sessions.delete(userId);
    }
  }
}, 60 * 1000);
