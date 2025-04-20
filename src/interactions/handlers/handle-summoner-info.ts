import {
    ModalSubmitInteraction,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
  } from "discord.js";
  
  import fetch from "node-fetch";
  import { RiotAccountResponse, SummonerResponse } from "../../types/riot";
  import { SessionManager } from "../../session/session-manager";
  
  const RIOT_API_KEY = process.env.RIOT_API_KEY!;
  const RIOT_ACCOUNT_BASE = "https://europe.api.riotgames.com";
  const RIOT_SUMMONER_BASE = "https://euw1.api.riotgames.com";
  const PROFILE_ICON_VERSION = "15.8.1";
  
  export async function handleSummonerInfo(interaction: ModalSubmitInteraction) {
    const summonerName = interaction.fields.getTextInputValue("summoner-name").trim().replace(/\s+/g, "");
    const tag = interaction.fields.getTextInputValue("summoner-tag").trim().replace(/\s+/g, "");
  
    try {
      await interaction.reply({
        ephemeral: true,
        content: `🔍 Buscando cuenta **${summonerName}#${tag}**...`
      });
  
      const accountRes = await fetch(
        `${RIOT_ACCOUNT_BASE}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(summonerName)}/${encodeURIComponent(tag)}`,
        {
          headers: { "X-Riot-Token": RIOT_API_KEY }
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
          headers: { "X-Riot-Token": RIOT_API_KEY }
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
  
      SessionManager.set(interaction.user.id, {
        puuid: accountData.puuid,
        gameName: accountData.gameName,
        tagLine: accountData.tagLine,
        summonerLevel: summonerData.summonerLevel,
        profileIconId: summonerData.profileIconId
      });
  
      const embed = new EmbedBuilder()
        .setTitle("Datos de tu cuenta")
        .setDescription(`**Invocador:** ${summonerName}#${tag}\n**Nivel:** ${summonerData.summonerLevel}`)
        .setThumbnail(iconUrl)
        .setColor("Green");
  
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("confirm-account")
          .setLabel("Continuar")
          .setStyle(ButtonStyle.Primary)
      );
  
      await interaction.editReply({
        content: "",
        embeds: [embed],
        components: [row]
      });
  
    } catch (error) {
      console.error("❌ Riot API Error:", error);
      await interaction.editReply({
        content: "❌ Error inesperado al contactar con Riot API."
      });
    }
  }
  