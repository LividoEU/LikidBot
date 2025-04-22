import {
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} from "discord.js";

export async function showSummonerInfoModal(interaction: ButtonInteraction): Promise<void> {
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

  const roleInput = new TextInputBuilder()
  .setCustomId("summoner-role")
  .setLabel("Rol (Top, Jgl, Mid, Adc, Supp)")
  .setPlaceholder("Ej: Top")
  .setRequired(true)
  .setStyle(TextInputStyle.Short);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(tagInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(serverInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(roleInput)
  );

  await interaction.showModal(modal);
}
