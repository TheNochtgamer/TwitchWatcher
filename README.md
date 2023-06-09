# Twitch Watcher Bot
> Discord x Twitch hook

Un bot (de pruebas) que conecta el chat de un canal de twitch con un canal de discord a traves de filtros con expresiones regulares

Una vez iniciado el bot, utiliza `/join [canal]` para unirte a un canal de twitch y despues el `/filter add [nombreDelFiltro] [regExp] [canalesDeTwitch ...] {flags} {canalDeDiscord} {inverted}` para establecer un filtro

## Instalacion

1. `git clone https://github.com/TheNochtgamer/TwitchWatcher twitchwatcher`
0. `pnpm i` o `npm i`
0. `cd twitchwatcher`
0. `mv .example.env .env`
1. Rellenas el archivo .env con la informacion indicada
2. Y ejecutas `pnpm start`