// src/index.ts
import { Client, Events, GatewayIntentBits, ActivityType } from 'discord.js';
import { config } from './config';
import { commands } from './commands';
import { registerCommands } from './utils/registerCommands';
import { initializeSteamSets } from './services/steamSets';
import { isAllowedChannel, sendQuietMessage } from './utils/channels';
import { checkAndUpdateSteamSetsClientVersion } from './services/steamSets';
import consola from 'consola';

declare module 'discord.js' {
    interface Client {
        steamSets: any;
    }
}

async function main() {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
        ]
    });
    
    await checkAndUpdateSteamSetsClientVersion();

    try {
        client.steamSets = await initializeSteamSets();
    } catch (error) {
        consola.error('Failed to initialize SteamSets:', error);
        process.exit(1);
    }

    // Set status to "Playing with SteamSets"
    client.once(Events.ClientReady, async () => {
        client.user?.setActivity('with SteamSets', { type: ActivityType.Playing });
    });

    client.once(Events.ClientReady, async () => {
        consola.success('Bot is ready!');
        await registerCommands();
    });

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isCommand()) return;
    
        const command = commands.find(cmd => cmd.name === interaction.commandName);
        if (!command) return;
    
        // Check if command is allowed in this channel
        if (!isAllowedChannel(interaction)) {
            const allowedChannels = command.allowedChannels
                ?.map(id => `<#${id}>`)
                .join(', ');
            await sendQuietMessage(
                interaction,
                `This command can only be used in the following channels: ${allowedChannels}`
            );
            return;
        }
    
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing command ${command.name}:`, error);
            await sendQuietMessage(
                interaction,
                'There was an error executing this command!'
            );
        }
    });

    // client.on('messageCreate', async (message) => {
    //     console.log(message);
    // });

    await client.login(config.token);
}  

main().catch(console.error);

