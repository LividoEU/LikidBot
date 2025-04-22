import {
  ModalSubmitInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  MessageFlags
} from "discord.js";

import {
  fetchRiotAccountByRiotId,
  fetchSummonerByPuuid,
  fetchRankedInfo
} from "../utils/riot-api";
import { SessionManager } from "../sessions/session-manager";
import { RiotAccountResponse, SummonerResponse } from "../types/riot";
import { PROFILE_ICON_VERSION } from "../../constants/consts";

export async function summonerInfo(interaction: ModalSubmitInteraction): Promise<void> {
  const summonerName = interaction.fields.getTextInputValue("summoner-name").trim();
  const tag = interaction.fields.getTextInputValue("summoner-tag").trim();
  const serverInput = interaction.fields.getTextInputValue("summoner-server").trim().toUpperCase();

  const allowedServers = ["EUW", "LAN", "LAS", "NA"];
  if (!allowedServers.includes(serverInput)) {
    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content: "❌ Servidor inválido. Solo se permiten: EUW, LAN, LAS, NA."
    });
    return;
  }

  await interaction.reply({
    flags: MessageFlags.Ephemeral,
    content: `🔍 Buscando cuenta **${summonerName}#${tag}**...`
  });

  try {
    const account: RiotAccountResponse = await fetchRiotAccountByRiotId(summonerName, tag, serverInput);
    const summoner: SummonerResponse = await fetchSummonerByPuuid(account.puuid, serverInput);

    let verificationIconId: number;
    do {
      verificationIconId = Math.floor(Math.random() * 29);
    } while (verificationIconId === summoner.profileIconId);

    const ranked = await fetchRankedInfo(account.puuid, serverInput);

    SessionManager.set(interaction.user.id, {
      puuid: account.puuid,
      gameName: account.gameName,
      tagLine: account.tagLine,
      summonerLevel: summoner.summonerLevel,
      profileIconId: summoner.profileIconId,
      expectedIconId: verificationIconId,
      server: serverInput,
      serverRegion: ranked.serverRegion,
      accountRegion: ranked.accountRegion,
      ranked
    });

    const iconUrl = `https://ddragon.leagueoflegends.com/cdn/${PROFILE_ICON_VERSION}/img/profileicon/${summoner.profileIconId}.png`;

    const eloLine = ranked.solo
      ? `**SoloQ:** ${ranked.solo.tier} ${ranked.solo.rank} (${ranked.solo.leaguePoints} LP)`
      : `**SoloQ:** Sin posicionar`;

    const flexLine = ranked.flex
      ? `\n**Flex:** ${ranked.flex.tier} ${ranked.flex.rank} (${ranked.flex.leaguePoints} LP)`
      : `\n**Flex:** Sin posicionar`;

    const embed = new EmbedBuilder()
      .setTitle("🧾 Datos de tu cuenta")
      .setDescription(
        `**Invocador:** ${summonerName}#${tag}\n` +
        `**Nivel:** ${summoner.summonerLevel}\n` +
        eloLine + flexLine +
        `\n\nSi esta es tu cuenta, pulsa en "Continuar" para completar la verificación.`
      )
      .setThumbnail(iconUrl)
      .setColor("Green");

    const continueRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("confirm-account")
        .setLabel("Continuar")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.editReply({
      content: "",
      embeds: [embed],
      components: [continueRow]
    });

  } catch (err) {
    console.error("❌ Riot API Error:", err);
    await interaction.editReply({
      content: "❌ Error inesperado al contactar con Riot API."
    });
  }
}
