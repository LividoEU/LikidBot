import {
  ChatInputCommandInteraction,
  PermissionsBitField,
  SlashCommandBuilder
} from "discord.js";
import { deployVerificationMessage } from "../messages/deploy-verification-message";

export const data = new SlashCommandBuilder()
  .setName("iniciar-verificacion")
  .setDescription("Postea el mensaje de verificación en este canal");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
    await interaction.reply({
      content: "❌ Solo administradores pueden usar este comando.",
      ephemeral: true
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  await deployVerificationMessage(interaction.channel!);

  await interaction.editReply({
    content: "✅ Mensaje de verificación desplegado correctamente."
  });
}
