import { CommandInteraction, EmbedBuilder, CommandInteractionOptionResolver } from 'discord.js';
import { SteamSets } from '@steamsets/client-ts';
import { Command } from '../types/Command';

export const mini: Command = {
    name: 'mini',
    description: 'Get Steam mini profile information',
    options: [{
        name: 'vanity',
        type: 3,
        description: 'Steam vanity URL name',
        required: true
    }],
    async execute(interaction: CommandInteraction) {
        const steamSets = interaction.client.steamSets as SteamSets;
        await interaction.deferReply();

        try {
            const vanityName = (interaction.options as CommandInteractionOptionResolver).getString('vanity');
            
            if (!vanityName) {
                await interaction.editReply('Please provide a valid vanity URL name!');
                return;
            }

            const result = await steamSets.account.accountV1GetMeta({
                "vanity": {
                    type: "internal",
                    value: vanityName
                }
            });

            if (!result.v1AccountMetaResponseBody?.ogImage) {
                await interaction.editReply('No profile image found for this user.');
                return;
            }

            const imageBuffer = Buffer.from(result.v1AccountMetaResponseBody.ogImage, 'base64');
            
            // Send the image directly with optional metadata as text
            await interaction.editReply({
                files: [{
                    attachment: imageBuffer,
                    name: 'profile.png'
                }],
            });

        } catch (error) {
            console.error('Error fetching Steam mini profile:', error);
            await interaction.editReply('Failed to fetch Steam mini profile information. Please check the vanity URL name and try again.');
        }
    }
};