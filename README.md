# no soy un music bot
Bot de musica que he creado con el codigo publico para que mas gente pueda descargarlo o pueda ver el codigo por si nececitan ayuda

## Mi bot de musica:
Si quieres probar el bot, puedes invitarlo aqui:
[no soy un "MusicBot"](https://discord.com/api/oauth2/authorize?client_id=767017761725087774&permissions=415067598640&scope=bot%20applications.commands)

### Descargar:
[no-soy-un-music-bot.zip](https://github.com/adriabama06/no-soy-un-music-bot/releases/download/v0.0.6/no-soy-un-music-bot.zip) - Para descargar en Windows y poder descomprimir facilmente sin programas externos

[no-soy-un-music-bot.tar](https://github.com/adriabama06/no-soy-un-music-bot/releases/download/v0.0.6/no-soy-un-music-bot.tar) - Para descomprimir en Linux si prefiere

[no-soy-un-music-bot.7z](https://github.com/adriabama06/no-soy-un-music-bot/releases/download/v0.0.6/no-soy-un-music-bot.7z) - Por si lo quieres en 7zip

Ejecutar tras descargar para instalar los npm, este automaticamente compilara TypeScript:
```cmd
# En la carpeta
npm i --save
```
### Como ejecutar?
```cmd
npm start
# o tambien
node .
```

## Importante:
Es importante crear la base de datos, tienes en ./setup un .sql para phpmyadmin o directamente en setup.js ya te genera las **tablas** *(tienes que crear tu la base de datos)* para poder funcionar

## Objetivos:

- [x] Crear cliente para conectar la base de datos [MariaDB](https://mariadb.org/) con el bot
- [x] Preparar todo sobre los prefix y conecciones con la base de datos
- [x] Poner comandos de musica: `play - stop - queue - pause - resume - safesearch`
- [x] Guardar informacion de cuando el bot ha sido invitado y guardar queues
- [x] Actualizar todo a TypeScript
- [x] Modificar el sistema de manejo de datos
- [ ] (En proseso) añadir quik.db para que no sea nececario usar una base de datos [mysql](https://github.com/mysqljs/mysql)
- [ ] Pulir el codigo
- [ ] Crear una DashBoard
- [ ] Podeis añadir cosas que me haya dejado o cosas que puedo añadir en https://github.com/adriabama06/no-soy-un-music-bot/issues/new
- [ ] Ya ire añadiendo objetivos
- [ ] Tener el bot listo y dejarlo listo para que todos lo puedan usar

#### Este proyecto usa:

- [discord.js](https://github.com/discordjs/discord.js) - Para el bot de discord
- [mysql](https://github.com/mysqljs/mysql) - Para el acceso a una Base de Datos [MariaDB](https://mariadb.org/)
- [ytdl-core](https://github.com/fent/node-ytdl-core) - Para obtener la informacion de forma rapida de un video de [YouTube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)
- [ytdl-core-discord](https://github.com/amishshah/ytdl-core-discord) - Para tener la entrada de video en [Opus](https://opus-codec.org/) para evitar usar ffmpeg para que vaya más rapido # no lo uso temporalmente por pruebas que estoy haciendo
