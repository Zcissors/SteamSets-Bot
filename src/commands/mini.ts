import { CommandInteraction, CommandInteractionOptionResolver } from 'discord.js';
import { SteamSets } from '@steamsets/client-ts';
import { Command } from '../types/Command';

export const mini: Command = {
    name: 'mini',
    allowedChannels: [`${process.env.allowedChannel}`],
    description: 'Get SteamSets mini profile information',
    options: [
        {
            name: 'vanity',
            type: 3,
            description: 'Steamsets vanity URL or SteamID64',
            required: false
        },
        {
            name: 'steamid',
            type: 3,
            description: 'SteamID64',
            required: false
        }
    ],
    async execute(interaction: CommandInteraction) {
        const steamSets = interaction.client.steamSets as SteamSets;
        await interaction.deferReply();

        try {
            const vanity = (interaction.options as CommandInteractionOptionResolver).getString('vanity');
            const steamId = (interaction.options as CommandInteractionOptionResolver).getString('steamid');
            
            if (vanity) {
                const result = await steamSets.account.getMeta({
                    "vanity": {
                        type: "internal",
                        value: vanity
                    }
                });
                if (result.v1AccountMetaResponseBody) {
                    const steamId = result.v1AccountMetaResponseBody.steamId;
                    const imageUrl = `https://cdn.steamsets.com/og/account/${steamId}.png`;

                    await interaction.editReply({
                        content: imageUrl,
                    });
                    console.log('Profile image:', imageUrl);
                } else {
                    await interaction.editReply('No profile image found for this user.');
                }
            } else if (steamId) {
                const imageUrl = `https://cdn.steamsets.com/og/account/${steamId}.png`;

                await interaction.editReply({
                    content: imageUrl,
                });
                console.log('Profile image:', imageUrl);
            } else {
                await interaction.editReply('Please provide a valid vanity URL name or SteamID64.');
            }

        } catch (error) {
            console.error('Error fetching Steam mini profile:', error);
            await interaction.editReply('Failed to fetch Steam mini profile information. Please check the vanity URL name or SteamID64 and try again.');
        }
    }
};
