import { LikidClient } from "./types/likid-client.js";
import { registerCommands } from "./handlers/handle-commands.js";
import { handleButtonInteraction } from "./handlers/handle-buttons.js";
import { handleModalInteraction } from "./handlers/handle-modals.js";
import { updateSoloRanks } from "./utils/update-soloq-ranks.js";
import { Client, Interaction, MessageFlags } from "discord.js";
import cron from "node-cron";

export function setupAccountVerifier(client: LikidClient) {
  client.once("ready", async () => {
    console.log(`Logged in as ${client.user?.tag}`);
    await registerCommands(client);

    // Schedule soloQ role updates at 1AM daily
    cron.schedule("0 1 * * *", () => {
      console.log("Running daily soloQ update job...");
      updateSoloRanks(client as LikidClient & Client<true>);
    }, {
      timezone: "Europe/Madrid"
    });
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
      console.error("Error en interactionCreate:", error);

      if (
        (interaction.isChatInputCommand() ||
          interaction.isButton() ||
          interaction.isModalSubmit()) &&
        !interaction.replied &&
        !interaction.deferred
      ) {
        await interaction.reply({
          content: "Ocurrió un error al manejar tu interacción.",
          flags: MessageFlags.Ephemeral
        });
      }
    }
  });
}
