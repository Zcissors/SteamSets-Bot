// src/commands/index.ts
import { Command } from '../types/Command';
import { Profile } from './Profile';
import { mini } from './mini';
import { help } from './help';
import { ladder } from './ladder';
import { update } from './update';
import { BadgeInfo} from './badge';

export const commands: Command[] = [
    Profile,
    mini,
    help,
    ladder,
    update,
    BadgeInfo
];