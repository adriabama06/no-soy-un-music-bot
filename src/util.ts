import { Message, MessageActionRow, MessageButton } from 'discord.js';

export async function messageDelete(message: Message, userid?: string, timeout: number = 240000): Promise<boolean> {
    return new Promise(async (resolve) => {
        const row = new MessageActionRow().addComponents(
            new MessageButton()
            .setCustomId('delete')
            .setEmoji('❌')
            .setStyle('SECONDARY'));
        await message.edit({components: [row]});
        
        // sorry i can't find the class for i (interaction i know)
        const filter = (i: any) => i.customId === 'delete' && (userid ? i.user.id === userid : true);

        const collector = message.createMessageComponentCollector({ filter, time: timeout });

        // sorry i can't find the class for i (interaction i know)
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