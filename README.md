# AbaCordium

AbaCordium er den offisielle Discord-boten for AbaCord, utviklet for morro og treningens skyld. Den tilbyr hittil hovedsakelig automatisering innad i discord serveren AbaCord. 


## Funksjoner

-  Slash commands
-  Automatisering via events
-  Modulær command- og event-struktur for paralell utvikling

---

## Brukerveiledning

### 1. Klon repoet

HTTPS: (for folk utenfor abacord)
```bash
git clone https://github.com/AbaCord/AbaCordium.git
cd AbaCordium
```

SSH: (for utviklere)
```bash
git clone git@github.com:AbaCord/AbaCordium.git
cd AbaCordium
```

### 2. Installer dependencies
```bash
npm install
```

### 3. Sett opp .env
Opprett en `.env` fil:

```
DISCORD_TOKEN=din_bot_token
CLIENTID=din_client_id
GUILDID=test_server_id
```

### 4. Deploy commands
```bash
npm run load
```

### 5. Start boten
```bash
npm start
```

## Struktur

```
/commands/utils     -> Slash commands
/events             -> Event handlers
/data               -> Datalagring
deploy-commands.js  -> Registrerer commands (fra dokumentasjon)
index.js            -> Startfil (fra dokumentasjon)
```


## Workflow

- Ikke bruk ```git push --force``` på main eller delte branches
- Dersom du har problemer med push etter at du har kjørt ```git commit``` kan du prøve:
  ```bash
  git reset --soft origin/main #bytt ut main med relevant branch
  ```
- Splitt opp commits i gunstige deler og skriv tydelige, men korte commitmessages
## Lisens

Prosjektet er lisensiert under MIT-lisensen (se LICENSE).