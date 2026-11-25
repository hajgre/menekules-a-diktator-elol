# Teszteredmények – v1.3.1

**Dátum:** 2026-11-25

- `node --check game.js`: sikeres.
- **18 JavaScript-logikai ellenőrzés:** sikeres (részletek: `TESZTEK-JS.log`).
- Helyes és hibás válasz után automatikus, 3 másodperces folytatás tesztelve.
- Visszajelzés alatt a játék és az üldöző mozdulatlan, a játékidő nem telik.
- A 10 kérdéses teljes pálya szimulációja mindhárom nehézségi szinten sikeres.
- Korábbi v1, v2 és v3 mentésformák betöltése, rekordok és gyorsítás/lassítás ellenőrizve.
- Chromium headless: **4** sikeres teszt (asztali és mobilnézet; helyes és hibás válasz, Enter nélküli folytatás, háttérben biztonságos várakozás), JavaScript-hiba nélkül. `TESZTEK-BONGESZO.json`.

**Korlátok:** Az élő GitHub Pages-verziót a jelen környezetből nem lehetett közvetlenül beolvasni. Valódi mobilkészüléken és tanulókkal még nem teszteltük.
