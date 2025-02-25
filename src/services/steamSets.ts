// src/services/steamSets.ts
import { SteamSets } from '@steamsets/client-ts';
import consola from 'consola';
import { config } from '../config';
import { execSync } from 'child_process';

export async function initializeSteamSets(): Promise<SteamSets> {
    const livenessResponse = await fetch('https://api.steamsets.com/v1/liveness');
    if (!livenessResponse.ok) {
        throw new Error('Failed to connect to SteamSets API');
    }
    
    consola.success('Connected to SteamSets API');
    return new SteamSets({ token: `Bearer ${config.steamSetsApiKey}` });
}

export function checkAndUpdateSteamSetsClientVersion(): string {
    try {
        const localVersionOutput = execSync('npm list @steamsets/client-ts --depth=0').toString().trim();
        const localVersionMatch = localVersionOutput.match(/@steamsets\/client-ts@(.*)/);
        const localVersion = localVersionMatch ? localVersionMatch[1] : 'unknown';
        consola.info(`Local @steamsets/client-ts version: ${localVersion}`);
        
        const originVersion = execSync('npm view @steamsets/client-ts version').toString().trim();
        consola.info(`Origin @steamsets/client-ts version: ${originVersion}`);
        
        if (localVersion === originVersion) {
            consola.success('Local version matches origin version');
        } else {
            consola.warn('Local version does not match origin version');
            if (localVersion < originVersion) {
                consola.info('Updating local @steamsets/client-ts to the latest version...');
                execSync('npm install @steamsets/client-ts@latest');
                consola.success('Local @steamsets/client-ts has been updated to the latest version');
            }
        }
        
        return localVersion;
    } catch (error) {
        consola.error('Failed to get or update @steamsets/client-ts version', error);
        throw error;
    }
}