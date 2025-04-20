import {
    ButtonInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
  } from "discord.js";
  
  export async function showSummonerInfoModal(interaction: ButtonInteraction) {
    const modal = new ModalBuilder()
      .setCustomId("summoner-info")
      .setTitle("Introduce tu cuenta de LoL");
  
    const nameInput = new TextInputBuilder()
      .setCustomId("summoner-name")
      .setLabel("Nombre de invocador")
      .setPlaceholder("Ej: MiCuentaSmurf")
      .setRequired(true)
      .setStyle(TextInputStyle.Short);
  
    const tagInput = new TextInputBuilder()
      .setCustomId("summoner-tag")
      .setLabel("Etiqueta")
      .setPlaceholder("Ej: EUW")
      .setRequired(true)
      .setStyle(TextInputStyle.Short);
  
    const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput);
    const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(tagInput);
  
    modal.addComponents(row1, row2);
  
    await interaction.showModal(modal);
  }
  