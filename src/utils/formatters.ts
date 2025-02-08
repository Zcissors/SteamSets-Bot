// src/utils/formatters.ts
import { EmbedBuilder } from 'discord.js';

export function formatProfileEmbed(info: any): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setColor('#2B5F75')  // Steam's brand color
        .setTitle(info.name || 'Unknown Profile')
        .setDescription('Steam Account Information')
        .setURL(`https://beta.steamsets.com/account/${info.steamId}`);

    // Only set URL if it's a valid non-empty string
    if (info.profileUrl && typeof info.profileUrl === 'string' && info.profileUrl.startsWith('http')) {
        embed.setURL(info.profileUrl);
    }

    // Add fields with null checking
    const fields = [
        { 
            name: 'Profile Name', 
            value: info.name ? (info.name.length > 20 ? info.name.substring(0, 20) + "..." : info.name) : 'N/A', 
            inline: true 
        },
        { 
            name: 'Badges', 
            value: info.normalBadges ? Intl.NumberFormat().format(info.normalBadges) : 'N/A', 
            inline: true 
        },
        { 
            name: ' XP', 
            value: info.xp ? Intl.NumberFormat().format(info.xp) : 'N/A', 
            inline: true 
        },
        { 
            name: 'Level', 
            value: info.level ? Intl.NumberFormat().format(info.level) : 'N/A', 
            inline: true 
        },
        { 
            name: 'Steam ID', 
            value: info.steamId || 'N/A', 
            inline: true 
        },
        { 
            name: 'Steam Sets Score', 
            value: info.steamSetsScore ? Intl.NumberFormat().format(info.steamSetsScore) : 'N/A', 
            inline: true 
        },
        { 
            name: 'Steam Vanity', 
            value: info.steamVanity || 'N/A', 
            inline: true 
        },
        { 
            name: 'VAC Bans', 
            value: info.vacBans ? Intl.NumberFormat().format(info.vacBans) : 'N/A', 
            inline: true 
        },
        { 
            name: 'Total Playtime', 
            value: info.playtime ? Intl.NumberFormat().format((info.playtime / 60).toFixed(0)) + " Hours" : 'N/A', 
            inline: true 
        }
    ];

    

    embed.addFields(fields);

    // Add timestamp and footer
    embed.setTimestamp()
        .setFooter({ text: 'Steam Profile Information' });

    // Add avatar if it exists and can form a valid URL
    if (info.avatar && typeof info.avatar === 'string') {
        const avatarUrl = `https://avatars.fastly.steamstatic.com/${info.avatar}_full.jpg`;
        embed.setThumbnail(avatarUrl);
    }

    return embed;
}