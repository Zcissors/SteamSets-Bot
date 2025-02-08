// src/commands/steamProfile.ts
import { CommandInteraction, EmbedBuilder, CommandInteractionOptionResolver } from 'discord.js';
import { SteamSets } from '@steamsets/client-ts';
import { Command } from '../types/Command';
import { formatProfileEmbed } from '../utils/formatters';

export const Profile: Command = {
    name: 'profile',
    description: 'Get SteamSets profile information',
    options: [{
        name: 'vanity',
        type: 3,
        description: 'SteamSets vanity URL name',
        required: true
    }],
    async execute(interaction: CommandInteraction) {
        const steamSets = interaction.client.steamSets as SteamSets;
        await interaction.deferReply();

        try {
            const vanityName = (interaction.options as CommandInteractionOptionResolver).getString('vanity');
            
            if (!vanityName) {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle('Error')
                            .setDescription('Please provide a valid vanity URL name!')
                    ]
                });
                return;
            }

            const result = await steamSets.account.getInfo({
                "vanity": {
                    type: "internal",
                    value: vanityName
                }
            });

            // Log the API response for debugging
            console.log('SteamSets API Response:', JSON.stringify(result, null, 2));
            const embedInfo = result.v1AccountInfoResponseBody;
            const embed = formatProfileEmbed(embedInfo);
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error fetching Steam profile:', error);
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('Error')
                        .setDescription('Failed to fetch Steam profile information. Please check the vanity URL name and try again.')
                ]
            });
        }
    }
};