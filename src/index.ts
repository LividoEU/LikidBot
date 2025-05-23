import { Client, GatewayIntentBits, Partials, Collection } from "discord.js";
import dotenv from "dotenv";
import { LikidClient } from "./features/riot/account-verifier/types/likid-client.js";
import { setupAccountVerifier } from "./features/riot/account-verifier/account-verifier.js";
import { CommandModule } from "./features/riot/account-verifier/types/command-module.js";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
}) as LikidClient;

client.commands = new Collection<string, CommandModule>();

setupAccountVerifier(client);

void client.login(process.env.DISCORD_TOKEN);
