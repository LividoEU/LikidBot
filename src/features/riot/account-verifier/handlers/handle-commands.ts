import {
  REST,
  Routes,
  RESTPostAPIChatInputApplicationCommandsJSONBody
} from "discord.js";
import fs from "fs/promises";
import path from "path";
import { LikidClient } from "../types/likid-client";
import { CommandModule } from "../types/command-module";

export async function registerCommands(client: LikidClient): Promise<void> {
  const isDev = process.env.NODE_ENV !== "production";
  const extension = isDev ? ".ts" : ".js";

  const commandsDir = path.join(__dirname, "../commands");
  const files = await fs.readdir(commandsDir);
  const commandFiles = files.filter(file => file.endsWith(extension));

  const commandsForAPI: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

  for (const file of commandFiles) {
    const filePath = path.join(commandsDir, file);
    const commandModule = (await import(filePath)) as CommandModule;

    if (typeof commandModule.data?.toJSON === "function" && typeof commandModule.execute === "function") {
      client.commands.set(commandModule.data.name, commandModule);
      commandsForAPI.push(commandModule.data.toJSON());
    } else {
      console.warn(`⚠️ Comando inválido o mal estructurado: ${file}`);
    }
  }

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID!),
    { body: commandsForAPI }
  );

  console.log(`✅ ${commandsForAPI.length} comandos registrados automáticamente.`);
}
