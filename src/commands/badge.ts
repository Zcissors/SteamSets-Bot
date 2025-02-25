import { CommandInteraction, CommandInteractionOptionResolver} from 'discord.js';
import { SteamSets } from '@steamsets/client-ts';
import { Command } from '../types/Command';
import consola from 'consola';
const { createCanvas, loadImage } = require('canvas');


export const BadgeInfo: Command = {
    name: 'badge',
    allowedChannels: [`${process.env.allowedChannel}`],
    description: 'Gets information about a Steam badge',
    options: [
        {
            name: 'appid',
            type: 3,
            description: 'Game AppID',
            required: true
        }
    ],
    async execute(interaction: CommandInteraction) {
        const steamSets = interaction.client.steamSets as SteamSets;
        await interaction.deferReply();
        try {
            const appId = (interaction.options as CommandInteractionOptionResolver).getString('appid');
            
            if (!appId) {
                await interaction.editReply({
                    content: 'Please provide a valid AppID!'
                });
                return;
            } else {
                consola.log('AppID:', appId);
                const result = await steamSets.app.appV1ListBadges({ appId: Number(appId) });
                if (!result.v1AppBadgeListResponseBody || !result.v1AppBadgeListResponseBody.badges) {
                    await interaction.editReply('No badge information found.');
                    return;
                }
                const badges = result.v1AppBadgeListResponseBody.badges;
                const nonFoilBadges = badges.filter(badge => !badge.isFoil).sort((a, b) => a.highestLevel - b.highestLevel);
                const foilBadges = badges.filter(badge => badge.isFoil);

                const badgeInfo = [
                    ...nonFoilBadges.map(badge => ({
                        image: badge.badgeImage,
                        name: badge.name,
                        level: badge.highestLevel,
                        scarcity: badge.scarcity,
                        isFoil: badge.isFoil,
                    })),
                    ...foilBadges.map(badge => ({
                        image: badge.badgeImage,
                        name: badge.name,
                        level: badge.highestLevel,
                        scarcity: badge.scarcity,
                        isFoil: badge.isFoil,
                    }))
                ];

                try {
                    // Create the initial canvas
                    let canvas = createCanvas(550, 550); // 600x600 canvas wid
                    let ctx = canvas.getContext('2d');
                
                    // Load and draw background image
                    const backgroundImage = await loadImage('https://cdn.steamsets.com/missing_app_bg.png');
                    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
                
                    // Set up the title, centered at the top of the canvas
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = '30px Sans';
                    ctx.textAlign = 'center';
                    const titleText = `${badges.length > 0 ? badges[0].appName : 'Unknown App'}`;
                    const maxWidth = canvas.width - 40; // 20px padding on each side
                    const lineHeight = 30;
                    const words = titleText.split(' ');
                    let line = '';
                    let y = 50;

                    for (let n = 0; n < words.length; n++) {
                        const testLine = line + words[n] + ' ';
                        const metrics = ctx.measureText(testLine);
                        const testWidth = metrics.width;
                        if (testWidth > maxWidth && n > 0) {
                            ctx.fillText(line, canvas.width / 2, y);
                            line = words[n] + ' ';
                            y += lineHeight;
                        } else {
                            line = testLine;
                        }
                    }
                    ctx.fillText(line, canvas.width / 2, y);
                    
                    ctx.font = '16px Sans';
                    
                    // Define badge grid parameters
                    const badgeWidth = 80;
                    const badgeHeight = 80;
                    const gridSize = 3; // 3 badges per row
                    const padding = 50; // Padding on left and right
                    const textAreaHeight = 80; // Space below each badge for text
                    const cellWidth = (canvas.width - (padding * 2)) / gridSize;
                    const rowHeight = badgeHeight + textAreaHeight + 20; // Total height per badge row
                    
                    let row = 0;
                    let col = 0;
                    
                    // Loop through badges and position them in a 3x3 grid
                    for (let i = 0; i < badgeInfo.length; i++) {
                        const badge = badgeInfo[i];
                        
                        // Calculate position within the grid
                        let xPosition = padding + col * cellWidth + (cellWidth - badgeWidth) / 2;
                        let yPosition = 100 + row * rowHeight;
                        
                        col++;
                        if (col >= gridSize) {
                            col = 0;
                            row++;
                        }
                        
                        try {
                            // Load and draw the badge image
                            const image = await loadImage(`https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/items/${appId}/${badge.image}`);
                            ctx.drawImage(image, xPosition, yPosition, badgeWidth, badgeHeight);
                            
                            // Set font style for text
                            ctx.font = '16px Arial Bold';
                            ctx.fillStyle = '#FFFFFF';
                            ctx.textAlign = 'center';
                            
                            // Display badge level below the badge
                            if (badge.isFoil) {
                                ctx.fillText(`Level ${badge.level} (Foil)`, xPosition + badgeWidth / 2, yPosition + badgeHeight + 20);
                            } else {
                                ctx.fillText(`Level ${badge.level}`, xPosition + badgeWidth / 2, yPosition + badgeHeight + 20);
                            }
                            
                            // Display badge name
                            ctx.font = '14px Roboto Bold';
                            const badgeName = badge.name;
                            const badgeNameMaxWidth = badgeWidth + 20; // Allow some padding
                            const badgeNameWords = badgeName.split(' ');
                            let badgeNameLine = '';
                            let badgeNameY = yPosition + badgeHeight + 40;

                            for (let n = 0; n < badgeNameWords.length; n++) {
                                const testLine = badgeNameLine + badgeNameWords[n] + ' ';
                                const metrics = ctx.measureText(testLine);
                                const testWidth = metrics.width;
                                if (testWidth > badgeNameMaxWidth && n > 0) {
                                    ctx.fillText(badgeNameLine, xPosition + badgeWidth / 2, badgeNameY);
                                    badgeNameLine = badgeNameWords[n] + ' ';
                                    badgeNameY += 16; // Move to next line
                                } else {
                                    badgeNameLine = testLine;
                                }
                            }
                            ctx.fillText(badgeNameLine, xPosition + badgeWidth / 2, badgeNameY);
                            badgeNameY += 16; // Move to next line for scarcity information
                            // Display scarcity information
                            if (badge.scarcity !== undefined && badge.scarcity !== null) {
                                ctx.fillText(`Scarcity: ${badge.scarcity}`, xPosition + badgeWidth / 2, badgeNameY);
                            }
                        } catch (imageError) {
                            // If image loading fails, log the error and show a placeholder
                            console.error(`Failed to load image for badge ${badge.name}:`, imageError);
                            ctx.fillStyle = '#dddddd';
                            ctx.fillRect(xPosition, yPosition, badgeWidth, badgeHeight);
                            ctx.fillStyle = '#000000';
                            ctx.textAlign = 'center';
                            ctx.fillText('Image Error', xPosition + badgeWidth / 2, yPosition + badgeHeight / 2);
                        }
                    }
                
                    // Calculate the total height needed for the canvas
                    const totalHeight = row * rowHeight;
                    if (totalHeight > canvas.height) {
                        // Resize canvas if necessary
                        const newCanvas = createCanvas(550, totalHeight);
                        const newCtx = newCanvas.getContext('2d');
                        
                        // Redraw the background on the new canvas
                        const newBackgroundImage = await loadImage('https://cdn.steamsets.com/missing_app_bg.png');
                        newCtx.drawImage(newBackgroundImage, 0, 0, newCanvas.width, newCanvas.height);
                        
                        // Copy the original drawing onto the new canvas
                        newCtx.drawImage(canvas, 0, 0);
                        canvas = newCanvas;
                    }
                
                    // Convert the canvas to a buffer and send as an attachment
                    const buffer = canvas.toBuffer();
                    const attachment = { files: [{ attachment: buffer, name: 'badges.png' }] };
                    await interaction.followUp(attachment);
                } catch (error) {
                    // Handle errors gracefully
                    console.error('Error generating badge image:', error);
                    await interaction.editReply('Error generating badge image: ' + (error as Error).message);
                }
                
                
                
            }
        }
        catch (error) {
            console.error('Error getting badge information:', error);
            await interaction.editReply('Error getting badge information: ' + (error as Error).title);
        }
    }
};
