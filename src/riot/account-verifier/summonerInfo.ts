import {
  ModalSubmitInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} from "discord.js";

import {
  RIOT_TOKEN,
  RIOT_ACCOUNT_BASE,
  RIOT_SUMMONER_BASE,
  PROFILE_ICON_VERSION
} from "../../constants/mainConst"

import fetch from "node-fetch";
import { RiotAccountResponse, SummonerResponse } from "../../types/riot";
import { SessionManager } from "../../session/sessionManager";

export async function handleSummonerInfo(interaction: ModalSubmitInteraction) {
  const summonerName = interaction.fields.getTextInputValue("summoner-name").trim();
  const tag = interaction.fields.getTextInputValue("summoner-tag").trim();

  try {
    await interaction.reply({
      ephemeral: true,
      content: `🔍 Buscando cuenta **${summonerName}#${tag}**...`
    });

    const accountRes = await fetch(
      `${RIOT_ACCOUNT_BASE}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(summonerName)}/${encodeURIComponent(tag)}`,
      {
        headers: { "X-Riot-Token": RIOT_TOKEN }
      }
    );

    if (!accountRes.ok) {
      await interaction.editReply({
        content: `❌ Cuenta no encontrada: **${summonerName}#${tag}**`
      });
      return;
    }

    const accountData = (await accountRes.json()) as RiotAccountResponse;

    const summonerRes = await fetch(
      `${RIOT_SUMMONER_BASE}/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}`,
      {
        headers: { "X-Riot-Token": RIOT_TOKEN }
      }
    );

    if (!summonerRes.ok) {
      await interaction.editReply({
        content: `❌ No se pudieron obtener los datos del invocador.`
      });
      return;
    }

    const summonerData = (await summonerRes.json()) as SummonerResponse;
    const iconUrl = `https://ddragon.leagueoflegends.com/cdn/${PROFILE_ICON_VERSION}/img/profileicon/${summonerData.profileIconId}.png`;

    // Pick a random verification icon from 0 to 28 that is NOT the current one
    let verificationIconId: number;
    do {
      verificationIconId = Math.floor(Math.random() * 29);
    } while (verificationIconId === summonerData.profileIconId);

    // Store session
    SessionManager.set(interaction.user.id, {
      puuid: accountData.puuid,
      gameName: accountData.gameName,
      tagLine: accountData.tagLine,
      summonerLevel: summonerData.summonerLevel,
      profileIconId: summonerData.profileIconId,
      expectedIconId: verificationIconId
    });

    const embedAccount = new EmbedBuilder()
      .setTitle("🧾 Datos de tu cuenta")
      .setDescription(
        `**Invocador:** ${summonerName}#${tag}\n` +
        `**Nivel:** ${summonerData.summonerLevel}\n\n` +
        `Si esta es tu cuenta, pulsa en "Continuar" para completar la verificación.`
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
      embeds: [embedAccount],
      components: [continueRow]
    });

  } catch (error) {
    console.error("❌ Riot API Error:", error);
    await interaction.editReply({
      content: "❌ Error inesperado al contactar con Riot API."
    });
  }
}
