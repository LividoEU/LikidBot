import {
    ButtonInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    InteractionReplyOptions,
  } from "discord.js";
  
  export async function handleStartVerification(interaction: ButtonInteraction) {
    const reply: InteractionReplyOptions = {
      ephemeral: true,
      content: `🧠 Para comenzar el proceso de verificación, asegúrate de tener acceso a tu cuenta de League of Legends.\n\n` +
               `Se te pedirá que cambies tu icono de invocador más adelante como método de validación.`,
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("acknowledge-verification")
            .setLabel("Lo entiendo")
            .setStyle(ButtonStyle.Primary)
        )
      ]
    };
  
    await interaction.reply(reply);
  }
  