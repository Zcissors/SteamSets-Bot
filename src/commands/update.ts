import { CommandInteraction, CommandInteractionOptionResolver } from 'discord.js';
import { SteamSets } from '@steamsets/client-ts';
import { Command } from '../types/Command';

export const update: Command = {
    name: 'update',
    allowedChannels: [`${process.env.allowedChannel}`],
    description: 'Update SteamSets profile information',
    options: [
        {
            name: 'vanity',
            type: 3,
            description: 'SteamSets vanity URL name',
            required: true
        }
    ],
    async execute(interaction: CommandInteraction) {
        const steamSets = interaction.client.steamSets as SteamSets;
        await interaction.deferReply();

        try {
            const vanityName = (interaction.options as CommandInteractionOptionResolver).getString('vanity');
            
            if (!vanityName) {
                await interaction.editReply({
                    content: 'Please provide a valid vanity URL name!'
                });
                return;
            }

            await steamSets.account.queue({
                force: false,
                "vanity": {
                    type: "internal",
                    value: vanityName
                }
            });

            //console.log('SteamSets API Response:', JSON.stringify(result, null, 2));
            await interaction.editReply(`Profile has been queued for update. Please allow a few minutes for the changes to take effect.`);
        } catch (error) {
            if ((error as any).status === 429) {
                await interaction.editReply({
                    content: 'Rate limit exceeded. Please try again later.'
                });
            } else {
                await interaction.editReply({
                    content: 'Failed to update Steam profile information. Please check the vanity URL name and try again.'
                });
            }
        }
    }
};
