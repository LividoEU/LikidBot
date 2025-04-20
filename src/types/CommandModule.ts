import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export interface CommandModule {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
