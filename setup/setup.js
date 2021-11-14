const child_process = require('child_process');
const path = require('path');

var getNpm = () => {
    if(process.platform === 'win32') {
        return 'npm.cmd';
    }
    return 'npm';
}

var npm = child_process.spawn(getNpm(), ['i', '--save'], {
    cwd: path.join(__dirname, '../'),
});
npm.on('error', async (err) => {
    console.error(`Hubo un error al generar el subprocess: NPM:
    
    ${err}`);
});

npm.on('spawn', async () => {
    console.log('Iniciando la instalacion');
});

npm.on('close', async () => {
    console.log('Instalacion finalizada, creando base de datos');
    console.log('Estiba: "ok" para generar la base de datos, configura antes el config.json que hay la carpeta del bot (../config.json) Recuerda que tienes que tener creada la base de datos, el script se encarga de crear las tablas!');
    process.stdin.on('data', async (data) => {
        if(data.toString('utf8').toLowerCase().includes('ok')) {
            console.log('conectando...');
            const mysql = require('mysql');
            const config = require('../config.json');
            const connection = mysql.createConnection({
                host: config.mysql.host,
                user: config.mysql.username,
                password: config.mysql.password,
                database: config.mysql.database,
            });
            connection.connect();
            console.log('conectado!');
            async function queryPromise(sql) {
                return new Promise((r) => {
                    connection.query(sql, async (error, results, fields) => {
                        if(error) {
                            console.log(error);
                            console.log("DevResults:");
                            console.log(results);
                            r("error");
                        }
                        r(results);
                    });
                });
            }
            var sqls = [
                `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";`,
                `SET time_zone = "+00:00";`,
                'CREATE TABLE `info` (`id` varchar(30) NOT NULL, `language` varchar(30) NOT NULL, `user` varchar(30) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8;',
                'CREATE TABLE `prefix` (`id` varchar(30) NOT NULL, `prefix` varchar(30) NOT NULL DEFAULT \'' + config.discord.defaultprefix + '\', `user` varchar(30) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8;',
                'CREATE TABLE `queues` (`id` varchar(30) NOT NULL, `queue` varchar(535) NOT NULL, `user` varchar(30) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8;',
                'CREATE TABLE `safesearch` (`id` varchar(30) NOT NULL, `safesearch` int(30) NOT NULL DEFAULT 1, `user` varchar(30) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8;'
            ];
            console.log('creando bases de datos');
            for(var sql of sqls) {
                await queryPromise(sql);
            }
            console.log('Base de datos creada!');
            console.log('Quieres instalar ffmpeg?');
            console.log('Si ya lo tienes en path global, escriba "no", si quieres que sea local (solo para este bot) escriba: "local", si quiere global exriba: "global" (aun no disponible la version global)');
        }
        if(data.toString('utf8').toLowerCase().includes('no')) {
            console.log('Pues ya puedes iniciar tu bot!');
            process.exit();
        }
        if(data.toString('utf8').toLowerCase().includes('local')) {
            var n = child_process.spawn(getNpm(), ['i', 'ffmpeg-static', '--save'], {
                cwd: path.join(__dirname, '../'),
            });
            n.on('error', async (err) => {
                console.error(`Hubo un error al generar el subprocess: NPM:
                
                ${err}`);
            });
            
            n.on('spawn', async () => {
                console.log('Instalando ffmpeg local');
            });            
            n.on('close', async () => {
                console.log('FFmpeg instalado local. Pues ya puedes iniciar tu bot!');
                process.exit();
            });
        }
    });
});