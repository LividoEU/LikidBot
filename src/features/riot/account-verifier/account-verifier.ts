// src/features/riot-verification/accountVerifier.ts
import { LikidClient } from "./types/likid-client";
import { registerCommands } from "./handlers/handle-commands";
import { handleButtonInteraction } from "./handlers/handle-buttons";
import { handleModalInteraction } from "./handlers/handle-modals";
import { Interaction, MessageFlags } from "discord.js";

export function setupAccountVerifier(client: LikidClient) {
  client.once("ready", async () => {
    console.log(`✅ Logged in as ${client.user?.tag}`);
    await registerCommands(client);
  });

  client.on("interactionCreate", async (interaction: Interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (command) await command.execute(interaction);
      } else if (interaction.isButton()) {
        await handleButtonInteraction(interaction);
      } else if (interaction.isModalSubmit()) {
        await handleModalInteraction(interaction);
      }
    } catch (error) {
      console.error("❌ Error en interactionCreate:", error);
  
      if (
        (interaction.isChatInputCommand() ||
          interaction.isButton() ||
          interaction.isModalSubmit()) &&
        !interaction.replied &&
        !interaction.deferred
      ) {
        await interaction.reply({
          content: "❌ Ocurrió un error al manejar tu interacción.",
          flags: MessageFlags.Ephemeral
        });
      }
    }
  });
}
