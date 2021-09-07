const Discord = require('discord.js');

/**
 * @returns {Promise<'time' | 'react'>}
 * @param {Discord.Message} message
 * @param {string[]} toreact
 * @param {string} whocando
 * @param {number} time
 */
const waitReaction = async (message, react, whocando, removeAll = true, deleteMsg = true, time = 120000) => {
    return new Promise(async (resolve) => {
        await message.react(react);
        const filter = (reaction, user) => {
            return (reaction.emoji.name == react) && (user.id == whocando);
        }
        const collector = message.createReactionCollector({filter: filter, time: time });
        collector.on('collect', async (reaction, user) => {
            if(!user.id == whocando || user.id == message.client.user.id) {
                return;
            }
            if(react == reaction.emoji.name) {
                collector.emit('end');
            }
        });
        collector.once('end', async (collected, reason) => {
            if(removeAll === true) {
                await message.reactions.removeAll();
            }
            if(deleteMsg === true) {
                message.delete({ timeout: 1000 });
            }
            if(reason != undefined) {
                resolve("time");
                return;
            }
            resolve("react");
        });
    });
}

module.exports = {
    waitReaction,
}