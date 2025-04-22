import "dotenv/config";

export const RIOT_TOKEN = process.env.RIOT_TOKEN!;
if (!RIOT_TOKEN) {
  throw new Error("RIOT_TOKEN is missing in .env");
}
