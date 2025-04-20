import { ModalSubmitInteraction } from "discord.js";

export async function handleModalInteraction(interaction: ModalSubmitInteraction) {
  const { customId } = interaction;

  if (customId === "summoner-info") {
    const { handleSummonerInfo } = await import("./handle-summoner-info");
    await handleSummonerInfo(interaction);
  }
}
