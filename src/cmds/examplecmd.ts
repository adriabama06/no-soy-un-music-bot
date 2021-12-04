import { CommandInterface } from "../interfaces";

const command: CommandInterface = {
    name: 'example',
    info: {
        es: 'Comando de prueba',
        en: 'Command test'
    },
    longinfo: {
        es: 'Ejecuta un comando de prueba',
        en: 'Execute test command'
    },
    params: {
        es: [
            {
                name: 'user',
                type: 'USER',
                required: false,
                description: 'a quien quieres probar'
            }
        ],
        en: [
            {
                name: 'user',
                type: 'USER',
                required: false,
                description: 'who we like test'
            }
        ]
    },
    alias: ["exarg1", "exarg2"],
    run: async ({interaction}): Promise<boolean | void> => {
        interaction.channel?.send({ content: `hola ${interaction.options.getUser('user') ? interaction.options.getUser('user')?.avatarURL({ dynamic: true }) : ', no user set'}`});
        return true;
    }
}


export default command;