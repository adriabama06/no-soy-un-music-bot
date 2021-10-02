# no soy un music bot
Bot de musica que he creado con el codigo publico para que mas gente pueda descargarlo o pueda ver el codigo por si nececitan ayuda
Ejecutar tras descargar para instalar los npm:
```cmd
npm i --save
```

## Durante el desarollo!
Por ahora mientras programo el bot tengo un archivo en el que tengo mi configuracion, ese no se sube porque le he puesto `config.json` y en [.gitignore](https://github.com/adriabama06/no-soy-un-music-bot/blob/028b87ced7c086ee2b76339783512c87b4e57f09/.gitignore) he añadido que no se suba y sea ignorado, el de ejemplo es el [config.json.back](https://github.com/adriabama06/no-soy-un-music-bot/blob/b9a8369cfc61b3e8e04fbd93a60c01bd5f737c4a/config.json.back)

## Objetivos:

- [x] crear cliente para conectar la base de datos [MariaDB](https://mariadb.org/) con el bot
- [x] preparar todo sobre los prefix y conecciones con la base de datos
- [x] poner comandos de musica: `play - stop - queue - pause - resume - safesearch`
- [ ] guardar informacion de cuando el bot ha sido invitado y guardar queues
- [ ] ya ire añadiendo objetivos
- [ ] tener el bot listo y dejarlo listo para que todos lo puedan usar

#### Este proyecto usa:

- [discord.js](https://github.com/discordjs/discord.js) - Para el bot de discord
- [mysql](https://github.com/mysqljs/mysql) - Para el acceso a una Base de Datos [MariaDB](https://mariadb.org/)
- [ytdl-core](https://github.com/fent/node-ytdl-core) - Para obtener la informacion de forma rapida de un video de [YouTube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
- [ytdl-core-discord](https://github.com/amishshah/ytdl-core-discord) - Para tener la entrada de video en opus para evitar usar ffmpeg para que vaya más rapido