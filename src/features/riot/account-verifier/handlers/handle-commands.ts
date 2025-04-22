import {
  REST,
  Routes,
  RESTPostAPIChatInputApplicationCommandsJSONBody
} from "discord.js";
import fs from "fs/promises";
import path from "path";
import { LikidClient } from "../types/likid-client.js";
import { CommandModule } from "../types/command-module.js";
import { fileURLToPath } from "url";
import { toFileUrl } from "../../../../utils/esm-path.js";

export async function registerCommands(client: LikidClient): Promise<void> {
  const isDev = process.env.NODE_ENV !== "production";
  const extension = isDev ? ".ts" : ".js";

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const commandsDir = path.join(__dirname, "../commands");
  const files = await fs.readdir(commandsDir);
  const commandFiles = files.filter(file => file.endsWith(extension));

  const commandsForAPI: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

  for (const file of commandFiles) {
    const filePath = path.join(commandsDir, file);
    const commandModule = await import(toFileUrl(filePath));

    if (typeof commandModule.data?.toJSON === "function" && typeof commandModule.execute === "function") {
      client.commands.set(commandModule.data.name, commandModule);
      commandsForAPI.push(commandModule.data.toJSON());
    } else {
      console.warn(`Comando inválido o mal estructurado: ${file}`);
    }
  }

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID!),
    { body: commandsForAPI }
  );

  console.log(`${commandsForAPI.length} comandos registrados automáticamente.`);
}
