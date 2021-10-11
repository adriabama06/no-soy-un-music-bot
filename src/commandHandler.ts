import { readdirSync } from 'fs';
import { join } from 'path';

import { CommandInterface } from "./interfaces";

export function loadCommands(CommandsDirectory: string, Commands: Map<string, CommandInterface>, Alias: Map<string, CommandInterface>, reload: boolean = false): {CommandsDirectory: string, Commands: Map<string, CommandInterface>, Alias: Map<string, CommandInterface>} {
    
    const Files = readdirSync(join(__dirname, CommandsDirectory)).filter(e => e.endsWith('.js')); // don't search .ts becuse ather build we convert to .js and .d.ts
    if(reload) {
        Commands.clear();
        Alias.clear();
    }
    for(const File of Files) {
        const commandTs = require(join(__dirname, CommandsDirectory, File)) as any;
        var command: CommandInterface = commandTs.default; // because on transform ts -> js add the prefix default and make errors
        if(!command.name) {
            continue;
        }
        //console.log(command.params?.es);
        Commands.set(command.name, command);
        if(command.alias && command.alias.length >= 1) {
            for(const AliasName of command.alias) {
                Alias.set(AliasName, command);
            }
        }
    }
    return {CommandsDirectory, Commands, Alias};
}