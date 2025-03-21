// src/utils/channels.ts
import { CommandInteraction, TextChannel, EmbedBuilder } from 'discord.js';

export async function sendQuietMessage(
    interaction: CommandInteraction, 
    message: string,
    options: { embeds?: EmbedBuilder[] } = {}
): Promise<void> {
    try {
        await interaction.reply({ 
            content: message, 
            embeds: options.embeds,
            flags: 64 // Ephemeral flag
        });
    } catch (error) {
        console.error('Error sending quiet message:', error);
    }
}

const allowedChannels = process.env.ALLOWED_CHANNELS?.split(",").map(id => id.trim()) || [];

export function isAllowedChannel(interaction: CommandInteraction): boolean {
    if (allowedChannels.length === 0) return true; // No restriction if empty
    return allowedChannels.includes(interaction.channelId);
}