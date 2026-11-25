# GitHub Pages feltöltés, frissítés és visszaállítás

**Vigyázat:** a játék különálló projekt; a meglévő `idougras-1941` repositoryhoz ne nyúlj.

## Első feltöltés

1. Új GitHub repository létrehozása (például `menekules-a-diktator-elol`).
2. A letöltött ZIP **kicsomagolása**.
3. A kicsomagolt fájlok feltöltése a repository gyökérmappájába, `Commit changes`.
4. `Settings → Pages → Deploy from a branch → main → /(root) → Save`.
5. A közzétett link ellenőrzése a böngészőben.

## Biztonságos verziófrissítés

1. A repositoryban **Code → Download ZIP**: ez a visszaállítási példány.
2. A frissített fájlokat töltsd fel a **meglévő azonos nevű fájlok helyére**, a könyvtárstruktúrát megtartva.
3. Írj verziót jelölő commitüzenetet, például `feat: történelmi pályabővítés v1.1.0`.
4. Ha változnak a `game.js`, `questions.js` vagy `styles.css` fájlok, frissítsd az `index.html` végén a fájlhivatkozásokban a `?v=` értékeket is.
5. A GitHub Pages frissülése után próbáld ki külön a startot, 1 kérdést, a szünetet és az újrakezdést.

## Visszaállítás

Ha egy új verzió meghibásodik, a GitHub régebbi commitját visszaállíthatod, vagy a mentett Code → Download ZIP fájljaival felülírhatod a hibás verzió fájljait. Commit után a Pages újra közzéteszi a fájlokat. Az előző verzió mentései nem feltétlenül kompatibilisek minden későbbi frissítéssel; ezt új verziónként tesztelni kell.
