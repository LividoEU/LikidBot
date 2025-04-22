import {
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionsBitField,
  SlashCommandBuilder
} from "discord.js";
import { deployVerificationMessage } from "../messages/deploy-verification-message.js";

export const data = new SlashCommandBuilder()
  .setName("iniciar-verificacion")
  .setDescription("Postea el mensaje de verificación en este canal");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
    await interaction.reply({
      content: "❌ Solo administradores pueden usar este comando.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  await deployVerificationMessage(interaction.channel!);

  await interaction.editReply({
    content: "✅ Mensaje de verificación desplegado correctamente."
  });
}
