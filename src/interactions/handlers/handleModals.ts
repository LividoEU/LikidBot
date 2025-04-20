import { ModalSubmitInteraction } from "discord.js";

export async function handleModalInteraction(interaction: ModalSubmitInteraction) {
  const { customId } = interaction;

  if (customId === "summoner-info") {
    const name = interaction.fields.getTextInputValue("summoner-name");
    const tag = interaction.fields.getTextInputValue("summoner-tag");

    await interaction.reply({
      ephemeral: true,
      content: `🔍 Buscando cuenta **${name}#${tag}**... (implementación en progreso)`
    });

    // Riot API logic comes next
  }
}
