import { ModalSubmitInteraction } from "discord.js";

export async function handleModalInteraction(interaction: ModalSubmitInteraction) {
  const { customId } = interaction;

  if (customId === "summoner-info") {
    const { summonerInfo } = await import("../../riot/account-verifier/summonerInfo");
    await summonerInfo(interaction);
  }
}
