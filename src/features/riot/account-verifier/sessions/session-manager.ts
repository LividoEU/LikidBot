import { VerificationSession } from "../types/sessions";

const sessions = new Map<string, VerificationSession>();

export const SessionManager = {
  get(userId: string): VerificationSession | undefined {
    return sessions.get(userId);
  },
  set(userId: string, data: VerificationSession): void {
    sessions.set(userId, data);
  },
  delete(userId: string): void {
    sessions.delete(userId);
  },
  has(userId: string): boolean {
    return sessions.has(userId);
  },
  clear(): void {
    sessions.clear();
  }
};
