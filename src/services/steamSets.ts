// src/services/steamSets.ts
import { SteamSets } from '@steamsets/client-ts';
import consola from 'consola';
import { config } from '../config';

export async function initializeSteamSets(): Promise<SteamSets> {
    const livenessResponse = await fetch('https://api.steamsets.com/v1/liveness');
    if (!livenessResponse.ok) {
        throw new Error('Failed to connect to SteamSets API');
    }
    
    consola.success('Connected to SteamSets API');
    return new SteamSets({ token: `Bearer ${config.steamSetsApiKey}` });
}