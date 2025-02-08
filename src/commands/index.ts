// src/commands/index.ts
import { Command } from '../types/Command';
import { Profile } from './Profile';
import { mini } from './mini';
import { help } from './help';

export const commands: Command[] = [
    Profile,
    mini,
    help
];