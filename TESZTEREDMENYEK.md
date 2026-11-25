# Tényleges ellenőrzések – v1.2.0

**Dátum:** 2026-11-25

## Sikeres ellenőrzések

- `node --check game.js` – JavaScript-szintaxis rendben.
- Automatikus JS-szimuláció mindhárom nehézségi szinten: a 10 kérdés és 11 platformos szakasz végigjárható, **55 ugrás**, 33 platformra landolás, **0 szakadékba esés** a tesztbot pontos ugrásaival. A bot nem valós tanuló, hanem ellenőrzés.
- 10 kérdés és 22 korábbi akadály száma változatlan.
- Kérdéskor és magyarázat közben a játékidő és a platformok belső ideje sem halad.
- Könnyű szinten dupla ugrás, normál és kihívás fokozaton csak egy ugrás.
- Szándékos leeséskor büntetés és biztonságos újrakezdési pont; a megválaszolt kérdések száma megmarad.
- Mozgó platformok helyzete ténylegesen változik a játékidővel.
- Helyes válasz turbója és hibás válasz lassítása ellenőrizve.
- Régi v1/v2 mentések betöltése; v3 levegőbeli mentés; meglévő böngészőtárhely-kulcsok változatlanok.
- Mobilos érintés csak egy ugrást vált ki; billentyűzettel külön ugrás indítható.
- **Valódi Chromium headless böngészőben** tesztelve: a játék indul, a menü megjelenik, desktop Space és mobil pointerdown ugrás működik; nem volt JavaScript-hiba. Képernyőképek: `preview-v120-menu-desktop.png`, `preview-v120-run-mobile.png`, `preview-v120-platform-course.png`.

## Korlátok

- A programozott bot ismerte a pályát: a diákok tényleges teljesíthetősége pedagógiai próba során derül ki.
- Fizikai telefonos és minden böngészőt lefedő teszt **nem** történt.
- A GitHubon közzétett éles változat ellenőrzése még hátravan.
- A nyilvános GitHub jelenlegi forrása nem volt közvetlenül elérhető; a korábban átadott v1.1.0 verzió szolgált kiindulásul.
