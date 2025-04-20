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
    .setMinLength(3)
    .setStyle(TextInputStyle.Short);

  const tagInput = new TextInputBuilder()
    .setCustomId("summoner-tag")
    .setLabel("Etiqueta")
    .setPlaceholder("Ej: 0000")
    .setRequired(true)
    .setMinLength(3)
    .setStyle(TextInputStyle.Short);

  const serverInput = new TextInputBuilder()
    .setCustomId("summoner-server")
    .setLabel("Servidor (EUW, LAN, LAS, NA)")
    .setPlaceholder("Ej: EUW")
    .setRequired(true)
    .setStyle(TextInputStyle.Short);

  const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput);
  const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(tagInput);
  const row3 = new ActionRowBuilder<TextInputBuilder>().addComponents(serverInput);

  modal.addComponents(row1, row2, row3);

  await interaction.showModal(modal);
}
