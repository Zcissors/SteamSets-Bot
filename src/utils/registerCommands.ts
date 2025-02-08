// src/utils/registerCommands.ts
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { commands } from '../commands';
import { config } from '../config';

export async function registerCommands() {
    try {
        console.log('Started refreshing application (/) commands.');

        const commandData = commands.map(command => ({
            name: command.name,
            description: command.description,
            options: command.options
        }));

        const rest = new REST({ version: '10' }).setToken(config.token);

        await rest.put(
            Routes.applicationGuildCommands(config.clientId, config.guildId),
            { body: commandData }
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error registering commands:', error);
        throw error;
    }
}