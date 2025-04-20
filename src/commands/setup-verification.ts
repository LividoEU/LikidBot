import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import { deployVerificationMessage } from "../setup/deploy-verification-message";

export const data = new SlashCommandBuilder()
  .setName("setup-verification")
  .setDescription("Postea el mensaje de verificación en este canal");

export async function execute(interaction: ChatInputCommandInteraction) {
  try {
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
      await interaction.reply({ content: "❌ Solo administradores pueden usar este comando.", ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    await deployVerificationMessage(interaction.channel!);

    await interaction.editReply({ content: "✅ Mensaje de verificación desplegado correctamente." });
  } catch (error) {
    console.error("❌ Error en setup-verification:", error);
    if (!interaction.replied) {
      await interaction.reply({ content: "❌ Error al ejecutar el comando.", ephemeral: true });
    }
  }
}
