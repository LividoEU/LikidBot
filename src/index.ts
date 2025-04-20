import { Client, GatewayIntentBits, Partials } from "discord.js";
import * as dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages],
  partials: [Partials.Channel],
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user?.tag}`);
});

client.login(process.env.DISCORD_TOKEN);