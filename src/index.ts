// src/index.ts
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { config } from './config';
import { commands } from './commands';
import { registerCommands } from './utils/registerCommands';
import { initializeSteamSets } from './services/steamSets';
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
        ]
    });

    try {
        client.steamSets = await initializeSteamSets();
    } catch (error) {
        consola.error('Failed to initialize SteamSets:', error);
        process.exit(1);
    }

    client.once(Events.ClientReady, async () => {
        consola.success('Bot is ready!');
        await registerCommands();
    });

    client.on(Events.InteractionCreate, async interaction => {
        if (!interaction.isCommand()) return;

        const command = commands.find(cmd => cmd.name === interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing command ${command.name}:`, error);
            const reply = interaction.replied ? interaction.followUp : interaction.reply;
            await reply({ content: 'There was an error executing this command!', ephemeral: true });
        }
    });

    await client.login(config.token);
}

main().catch(console.error);