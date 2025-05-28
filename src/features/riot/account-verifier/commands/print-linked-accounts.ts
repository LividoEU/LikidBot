import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionsBitField,
  MessageFlags,
  AttachmentBuilder
} from "discord.js";
import { readFile } from "fs/promises";
import path from "path";

const ACCOUNTS_FILE = path.resolve("src", "features", "riot", "data", "linked-accounts.json");

export const data = new SlashCommandBuilder()
  .setName("print-linked-accounts")
  .setDescription("📄 Muestra el contenido del archivo de cuentas vinculadas (solo admins)");

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
    await interaction.reply({
      content: "❌ Este comando solo está disponible para administradores.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  try {
    const raw = await readFile(ACCOUNTS_FILE, "utf-8");
    const buffer = Buffer.from(raw, "utf-8");
    const attachment = new AttachmentBuilder(buffer, { name: "linked-accounts.json" });

    await interaction.reply({
      content: "📎 Aquí tienes el archivo actual de cuentas vinculadas.",
      files: [attachment],
      flags: MessageFlags.Ephemeral
    });
  } catch (err) {
    console.error("❌ Error reading linked accounts:", err);
    await interaction.reply({
      content: "❌ No se pudo leer el archivo de cuentas vinculadas.",
      flags: MessageFlags.Ephemeral
    });
  }
}
