// Updated src/types/Command.ts to include options type
import { CommandInteraction } from 'discord.js';

interface CommandOption {
    name: string;
    type: number;
    description: string;
    required?: boolean;
}

export interface Command {
    name: string;
    description: string;
    options?: CommandOption[];
    execute: (interaction: CommandInteraction) => Promise<void>;
}