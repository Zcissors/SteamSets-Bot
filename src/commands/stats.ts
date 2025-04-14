import { CommandInteraction, CommandInteractionOptionResolver } from 'discord.js';
import { SteamSets } from '@steamsets/client-ts';
import { Command } from '../types/Command';
import consola from 'consola';

export const stats: Command = {
    name: 'stats',
    allowedChannels: [`${process.env.allowedChannel}`],
    description: 'Get SteamSets Stats information',
    options: [
        
    ],
    async execute(interaction: CommandInteraction) {
        const steamSets = interaction.client.steamSets as SteamSets;
        await interaction.deferReply();

        try {
            const result = await steamSets.stats.get();
            
            if (!result) {
                await interaction.editReply({
                    content: 'No stats available!'
                });
                return;
            }

            // Log the API response for debugging
            console.log('SteamSets API Response:', JSON.stringify(result, null, 2));
            
            const stats = result.v1Stats;

            if (!stats) {
                await interaction.editReply({
                    content: 'No stats available!'
                });
                return;
            }

            let statsString = '```json\n{\n';
            for (const [key, value] of Object.entries(stats)) {
                statsString += `  "${key}": ${value},\n`;
            }
            statsString += '}\n```';

            await interaction.editReply(statsString);
        } catch (error) {
            consola.error('Error fetching statistics:', error);
            await interaction.editReply({
                content: 'Failed to fetch statistics!'
            });
        }
    }
};
