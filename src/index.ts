import {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
    REST,
    Routes,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
  } from "discord.js";
  import * as dotenv from "dotenv";
  import * as fs from "fs/promises";
  import * as path from "path";
  import { LikidClient } from "./types/LikidClient";
  import { CommandModule } from "./types/CommandModule";
  
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
  
  async function loadCommands() {
    const commandsPath = path.join(__dirname, "commands");
    const commandFiles = (await fs.readdir(commandsPath)).filter(file => file.endsWith(".ts"));
  
    const commandsForAPI: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
  
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const commandModule = (await import(filePath)) as CommandModule;
  
      if ("data" in commandModule && "execute" in commandModule) {
        client.commands.set(commandModule.data.name, commandModule);
        commandsForAPI.push(commandModule.data.toJSON());
      } else {
        console.warn(`⚠️ Comando inválido: ${file}`);
      }
    }
  
    const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);
  
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!),
      { body: commandsForAPI }
    );
  
    console.log(`✅ ${commandsForAPI.length} comandos registrados automáticamente.`);
  }
  
  async function main() {
    await loadCommands();
  
    client.on("interactionCreate", async interaction => {
      if (!interaction.isChatInputCommand()) return;
  
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
  
      console.log(`[COMMAND EXEC] /${interaction.commandName} usado por ${interaction.user.tag}`);
  
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`❌ Error ejecutando /${interaction.commandName}:`, error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: "❌ Error ejecutando el comando.", ephemeral: true });
        } else {
          await interaction.reply({ content: "❌ Error ejecutando el comando.", ephemeral: true });
        }
      }
    });
  
    client.once("ready", () => {
      console.log(`✅ Logged in as ${client.user?.tag}`);
    });
  
    await client.login(process.env.DISCORD_TOKEN);
  }
  
  main();
  