// src/commands/ladder.ts
import { CommandInteraction, EmbedBuilder, CommandInteractionOptionResolver } from 'discord.js';
import { SteamSets } from '@steamsets/client-ts';
import { Command } from '../types/Command';
import consola from 'consola';

export const ladder: Command = {
    name: 'ladder',
    allowedChannels: [`${process.env.allowedChannel}`],
    description: 'Get Steam XP leaderboard rankings',
    async execute(interaction: CommandInteraction) {
        const steamSets = interaction.client.steamSets as SteamSets;
        await interaction.deferReply();

        try {
            const result = await steamSets.leaderboard.getAccount({
                leaderboard: "xp",
            });

            if (!result.v1AccountLeaderboardResponseBody?.accounts) {
                await interaction.editReply('No leaderboard data found.');
                return;
            }

            const embed = new EmbedBuilder()
                .setColor('#2B5F75')
                .setTitle('🏆 Steam XP Leaderboard')
                .setTimestamp()
                .setFooter({ text: 'Steam XP Leaderboard • Updated' });

            try {
                // Format leaderboard entries
                const leaderboardEntries = result.v1AccountLeaderboardResponseBody?.accounts.map((account, index) => {
                    const rank = index + 1;
                    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏅';
                    return {
                        name: `${medal} Rank #${rank}`,
                        value: account ? `**${account.name || 'Unknown'}**\nLevel: ${account.level || 'N/A'}\nXP: ${account.xp || 'N/A'}` : 'Account data is unavailable',
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