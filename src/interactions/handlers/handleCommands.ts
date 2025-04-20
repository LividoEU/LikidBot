import {
    REST,
    Routes,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
  } from "discord.js";
  import * as fs from "fs/promises";
  import * as path from "path";
  import { LikidClient } from "../../types/LikidClient";
  import { CommandModule } from "../../types/CommandModule";
  
  export async function registerCommands(client: LikidClient) {
    const commandsPath = path.join(__dirname, "../../commands");
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
  