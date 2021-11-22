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

/**
 * @param {Discord.Message} message 
 * @param {string} userid
 * @param {number} timeout optional defaut 240000 (4 minutes)
 * @returns {Promise<boolean>}
 */
const messageDelete = async (message, userid, timeout = 240000) => {
    return new Promise(async (resolve) => {
        const row = new Discord.MessageActionRow().addComponents(
            new Discord.MessageButton()
            .setCustomId('delete')
            .setEmoji('❌')
            .setStyle('SECONDARY'));
        await message.edit({components: [row]});

        const filter = (i) => i.customId === 'delete' && (userid === undefined ? true : i.user.id === userid);

        const collector = message.createMessageComponentCollector({ filter, time: timeout });

        collector.on('collect', async (i) => {
            if (i.customId === 'delete') {
                await i.deferUpdate();
                collector.stop('user');
            }
        });
        
        collector.on('end', async (collected, reason) => {
            if(message.deleted == false && message.deletable == true && typeof message.delete == 'function') {
                await message.delete();
            }
            if(reason && reason === 'user') {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

/**
 * @param {number} time
 * @returns {string}
 */
 function MilisecondsToTime(time) {
    return new Date(time).toISOString().substr(11, 8);
}

module.exports = {
    waitReaction,
    messageDelete,
    MilisecondsToTime
}