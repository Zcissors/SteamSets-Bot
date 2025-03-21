// src/commands/help.ts
import { CommandInteraction, EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { Command } from '../types/Command';
import { commands } from './index';
import { sendQuietMessage } from '../utils/channels';

export const help: Command = {
    name: 'help',
    description: 'Lists all available commands',
    allowedChannels: [`${process.env.allowedChannel}`],
    async execute(interaction: CommandInteraction) {
        const embed = new EmbedBuilder()
            .setColor('#2B5F75')
            .setTitle('🤖 Available Commands')
            .setDescription('Here are all the commands you can use:')
            .setTimestamp()
            .setFooter({ text: 'Steam Profile Bot Help' });

        // Dynamically add all commands to the embed
        const commandFields = commands.map(cmd => {
            // Get the options string if the command has options
            const options = cmd.options?.map(opt => 
                `\`${opt.name}${opt.required ? ' (required)' : ' (optional)'}\`: ${opt.description}`
            ).join('\n') || 'No parameters needed';

            return {
                name: `/${cmd.name}`,
                value: `${cmd.description}\n**Parameters:**\n${options}`,
                inline: false
            };
        });

        embed.addFields(commandFields);

        const replyOptions: InteractionReplyOptions = {
            embeds: [embed],
        };

        // Option 1: If sendQuietMessage expects a string message and options separately
        //await sendQuietMessage(interaction, "", { embeds: [embed] });
        
        // Option 2: If you need to reply directly without sendQuietMessage
        await sendQuietMessage(interaction, "", { embeds: [embed] });
    }
};