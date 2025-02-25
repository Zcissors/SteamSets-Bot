// src/utils/channels.ts
import { CommandInteraction, TextChannel } from 'discord.js';

export async function sendQuietMessage(interaction: CommandInteraction, message: string): Promise<void> {
    try {
        await interaction.reply({ content: message, ephemeral: true });
    } catch (error) {
        console.error('Error sending quiet message:', error);
    }
}

export function isAllowedChannel(interaction: CommandInteraction, allowedChannels?: string[]): boolean {
    if (!allowedChannels || allowedChannels.length === 0) return true;
    return allowedChannels.includes(interaction.channelId);
}