# Twitch Watcher Bot

> Discord x Twitch hook

Un bot (de pruebas) que conecta el chat de un canal de twitch con un canal de discord a traves de filtros con expresiones regulares

## First Steps

> 1. Una vez iniciado el bot, ejecuta `/join [canal]` para unirte a un canal de twitch
> 2. Luego ejecuta `/filter add [nombreDelFiltro] [regExp] [canalesDeTwitch ...]` para establecer un filtro y setearlo a un canal de twitch o varios
> 3. Y para visualizar el filtro, utiliza `/log add [nombreDelFiltro]` para que el bot envie todo mensaje del chat que cumpla los requisitos del filtro

## Instalacion

1. Ejecuta `git clone https://github.com/TheNochtgamer/TwitchWatcher twitchwatcher`
2. Ejecuta `pnpm i` o `npm i`
3. Ejecuta `cd twitchwatcher`
4. Ejecuta `mv .example.env .env`
5. Rellenas el archivo `.env` con la informacion indicada
6. Ejecuta `pnpm start`
7. Listo!
