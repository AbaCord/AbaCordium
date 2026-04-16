# AbaCordium

AbaCordium er den offisielle Discord-boten for AbaCord, utviklet for morro og treningens skyld. Den tilbyr hittil hovedsakelig automatisering innad i discord serveren AbaCord. 


## Funksjoner

-  Slash commands
-  Automatisering via events
-  Modulær command- og event-struktur for paralell utvikling

---

## User guide

### 1. Clone the repository

Use either HTTPS or SSH:
```bash
git clone https://github.com/AbaCord/AbaCordium.git # For outsiders
git clone git@github.com:AbaCord/AbaCordium.git # For developers
cd AbaCordium
```

### 3. Sett opp .env
Create a `.env` file:

```
DISCORD_TOKEN={your_token}
CLIENTID={your_bots_id}
GUILDID={test_server_id}
```

### 4. Install dependencies, commands and start the bot
```bash
npm install # Installs from package.json
npm run load # Runs deploy-commands.js
npm start # Runs index.js
```

## Developer guide

### Make a branch

Main is locked and should only be altered by merging with a branch, before making changes to the code make a branch with a name appropriate to the feature you are making:

```bash
git branch {your_branch}
git checkout {your_branch}
```

### Make sensible commits

Split your commits into sensible sizes and name them according to which changes you have made. Do not use `git push --force` ever.

```bash
git add {path_to_specific_files}
git commit -m "{sensible_description}"
git push {your_branch} # Not forcing
```

### Structure

Use the existing structure such that the bot loads your modules correctly: 
```
/commands/utils     -> Slash commands
/events             -> Event handlers
/data               -> Data storage
/data/private       -> Private datastorage (in .gitignore)
deploy-commands.js  -> Loads commands (from docs)
index.js            -> Mainfile (from docs)
```

### Rebase into main

When you are done developing you can rebase and merge your branch into main, try to avoid changing existing files in branches you do development as it will cause merge conflicts.
```bash
git rebase main
git checkout main
git merge {your_branch}
``

## Lisens

Prosjektet er lisensiert under MIT-lisensen (se LICENSE).