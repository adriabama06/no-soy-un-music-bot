# no soy un music bot
Bot de musica que he creado con el codigo publico para que mas gente pueda descargarlo o pueda ver el codigo por si nececitan ayuda

Ejecutar tras descargar para instalar los npm:
```cmd
# En la carpeta
npm i --save
```
o (recomendado)
```cmd
# En la carpeta
node setup\setup.js # Para windows
node setup/setup.js # Para linux
```

## Desarollo:
Como ejecutar?
```cmd
# TypeScript (Desarollo)
npm run build && node .

# JavaScript Version Funcional
node index.js
```

## Importante:
Es importante crear la base de datos, tienes en ./setup un .sql para phpmyadmin o directamente en setup.js ya te genera las **tablas** *(tienes que crear tu la base de datos)* para poder funcionar

## Objetivos:

- [x] Crear cliente para conectar la base de datos [MariaDB](https://mariadb.org/) con el bot
- [x] Preparar todo sobre los prefix y conecciones con la base de datos
- [x] Poner comandos de musica: `play - stop - queue - pause - resume - safesearch`
- [x] Guardar informacion de cuando el bot ha sido invitado y guardar queues
- [ ] (En proseso) Actualizar todo a TypeScript
- [ ] Crear una DashBoard
- [ ] Podeis añadir cosas que me haya dejado o cosas que puedo añadir en https://github.com/adriabama06/no-soy-un-music-bot/issues/new
- [ ] Ya ire añadiendo objetivos
- [ ] Tener el bot listo y dejarlo listo para que todos lo puedan usar

#### Este proyecto usa:

- [discord.js](https://github.com/discordjs/discord.js) - Para el bot de discord
- [mysql](https://github.com/mysqljs/mysql) - Para el acceso a una Base de Datos [MariaDB](https://mariadb.org/)
- [ytdl-core](https://github.com/fent/node-ytdl-core) - Para obtener la informacion de forma rapida de un video de [YouTube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
- [ytdl-core-discord](https://github.com/amishshah/ytdl-core-discord) - Para tener la entrada de video en opus para evitar usar ffmpeg para que vaya más rapido # no lo uso temporalmente por pruebas que estoy haciendo
