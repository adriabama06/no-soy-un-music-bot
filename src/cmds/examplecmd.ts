import { CommandInterface, CommandRunInterface } from "../interfaces";

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
                name: "video",
                type: 'USER',
                required: false,
                description: "a quien quieres probar"
            },
        ],
        en: [
            {
                name: "video",
                type: 'USER',
                required: false,
                description: "who we like test"
            },
        ]
    },
    alias: ["exarg1", "exarg2"],
    run: async ({interaction}: CommandRunInterface): Promise<boolean | void> => {
        interaction.reply({ content: `hola ${interaction.options.getString('video') ? interaction.options.getString('video') : interaction.member?.user.id}`});
        return true;
    }
}


export default command;