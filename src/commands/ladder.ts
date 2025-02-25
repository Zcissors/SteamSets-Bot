// src/commands/ladder.ts
import { CommandInteraction, EmbedBuilder, CommandInteractionOptionResolver } from 'discord.js';
import { SteamSets } from '@steamsets/client-ts';
import { Command } from '../types/Command';
import consola from 'consola';

export const ladder: Command = {
    name: 'ladder',
    allowedChannels: [`${process.env.allowedChannel}`],
    description: 'Get Steam XP leaderboard rankings',
    options: [
        {
            name: 'start',
            type: 4, // INTEGER type
            description: 'Starting rank (default: 1)',
            required: false
        },
        {
            name: 'end',
            type: 4, // INTEGER type
            description: 'Ending rank (default: 10)',
            required: false
        }
    ],
    async execute(interaction: CommandInteraction) {
        const steamSets = interaction.client.steamSets as SteamSets;
        await interaction.deferReply();

        try {
            const startRank = (interaction.options as CommandInteractionOptionResolver).getInteger('start') || 1;
            const endRank = (interaction.options as CommandInteractionOptionResolver).getInteger('end') || 10;

            // Validate rank range
            if (startRank < 1) {
                await interaction.editReply('Starting rank must be 1 or higher.');
                return;
            }
            if (endRank <= startRank) {
                await interaction.editReply('Ending rank must be greater than starting rank.');
                return;
            }
            if (endRank - startRank > 25) {
                await interaction.editReply('Cannot display more than 25 ranks at once.');
                return;
            }

            const result = await steamSets.leaderboard.getAccount({
                end: endRank,
                leaderboard: "xp",
            });

            if (!result.v1AccountLeaderboardResponseBody?.accounts) {
                await interaction.editReply('No leaderboard data found.');
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('#2B5F75')
                .setTitle('🏆 Steam XP Leaderboard')
                .setDescription(`Displaying ranks ${startRank} to ${endRank}`)
                .setTimestamp()
                .setFooter({ text: 'Steam XP Leaderboard • Updated' });

            try {
                // Format leaderboard entries
                const leaderboardEntries = result.v1AccountLeaderboardResponseBody?.accounts.map((account, index) => {
                    const rank = startRank + index;
                    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏅';
                    return {
                        name: `${medal} Rank #${rank}`,
                        value: `**${account.name || 'Unknown'}**\nLevel: ${account.level || 'N/A'}\nXP: ${account.xp || 'N/A'}`,
                        inline: false
                    };
                });

                embed.addFields(leaderboardEntries);

                await interaction.editReply({ embeds: [embed] });
            } catch (error) {
                consola.error('Error formatting leaderboard entries:', error);
                await interaction.editReply('Failed to format leaderboard entries. Please try again later.');
            }

        } catch (error) {
            consola.error('Error fetching leaderboard:', error);
            await interaction.editReply('Failed to fetch leaderboard information. Please try again later.');
        }
    }
};