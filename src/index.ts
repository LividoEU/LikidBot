import { Client, GatewayIntentBits, Partials, Collection } from "discord.js";
import * as dotenv from "dotenv";
import { LikidClient } from "./types/likidClient";
import { registerCommands } from "./interactions/handlers/handleCommands";
import { handleButtonInteraction } from "./interactions/handlers/handleButtons";
import { handleModalInteraction } from "./interactions/handlers/handleModals";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel],
}) as LikidClient;

client.commands = new Collection();

client.once("ready", async () => {
  console.log(`✅ Logged in as ${client.user?.tag}`);
  await registerCommands(client);
});

client.on("interactionCreate", async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (command) await command.execute(interaction);
  } else if (interaction.isButton()) {
    await handleButtonInteraction(interaction);
  } else if (interaction.isModalSubmit()) {
    await handleModalInteraction(interaction);
  }
});

client.login(process.env.DISCORD_TOKEN);
