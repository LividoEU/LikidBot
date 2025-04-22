import {
  ButtonInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder
} from "discord.js";
import { SessionManager } from "../sessions/session-manager";
import { PROFILE_ICON_VERSION } from "../../constants/consts";

export async function confirmAccount(interaction: ButtonInteraction): Promise<void> {
  const session = SessionManager.get(interaction.user.id);

  if (!session) {
    await interaction.reply({
      ephemeral: true,
      content: "❌ No se encontró ninguna sesión activa. Por favor, vuelve a comenzar el proceso."
    });
    return;
  }

  const iconUrl = `https://ddragon.leagueoflegends.com/cdn/${PROFILE_ICON_VERSION}/img/profileicon/${session.expectedIconId}.png`;

  const embed = new EmbedBuilder()
    .setTitle("🎯 Verificación de cuenta")
    .setDescription("Para verificar que eres el dueño de esta cuenta, cambia tu icono en el cliente de LoL al siguiente:")
    .setImage(iconUrl)
    .setColor("Orange");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("verify-icon-change")
      .setLabel("He cambiado el icono")
      .setStyle(ButtonStyle.Primary)
  );

  await interaction.reply({
    ephemeral: true,
    embeds: [embed],
    components: [row]
  });
}
