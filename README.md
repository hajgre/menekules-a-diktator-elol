# MENEKÜLÉS A DIKTÁTOR ELŐL! – v1.0.0

Színes, eredeti pixelgrafikás, oldalsó nézetes történelmi futókaland. TANAK 8. évfolyam számára. A II. világháború korai eseményeit és alapfogalmait gyakoroltatja **10 rövid kérdéssel**. A pálya és a figurák fiktívek: nem történelmi áldozatok menekülésének újrajátszása.

## Indítás

A játékhoz internetkapcsolat a feltöltés után nem szükséges; nincs API-kulcs, adatbázis, külső könyvtár, fiók vagy külső kép/hang. A `index.html` fájlt böngészőben megnyitva, vagy GitHub Pages-en futtatva indul.

## GitHub Pages – új repository

1. Hozz létre egy **új, nyilvános repositoryt** a GitHubon, például `menekules-a-diktator-elol` néven. **A már működő IDŐUGRÁS repositoryt ne módosítsd.**
2. A letöltött ZIP-et a számítógépeden **csomagold ki**, és a benne található fájlokat (`index.html`, `styles.css`, `game.js`, `questions.js`, dokumentációk) a repository **gyökérmappájába** töltsd fel (Add file → Upload files). **Ne a ZIP-et töltsd fel!**
3. Kattints a `Commit changes` gombra.
4. `Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main → Folder: /(root) → Save`.
5. Ha a repository neve `menekules-a-diktator-elol`, a várható cím: `https://hajgre.github.io/menekules-a-diktator-elol/`. Az oldal csak a tényleges közzététel után működik.
6. Nyisd meg, majd ellenőrizd a startot és az első kérdést. A GitHub Pages késleltetve is frissülhet.

## Fájlok

| Fájl | Funkció |
|---|---|
| `index.html` | Játék képernyői, gombjai és szemantikusan felépített kezelőfelület |
| `styles.css` | Reszponzív elrendezés, képernyőn látható szövegek |
| `game.js` | Játékmenet, pixelrajz, ütközés, kérdések, pontozás, mentés |
| `questions.js` | 10 történelmi kérdés és magyarázat; a válaszsorrend változó |
| `TANARI-UTMUTATO.md` | Pedagógiai ajánlások |
| `TESZTEREDMENYEK.md` | Ténylegesen lefuttatott ellenőrzések és korlátok |
| `CHANGELOG.md` | Verziótörténet |
| `GITHUB-FRISSITES.md` | Új verziók feltöltése és visszaállítás |

## Játékszabály

- A főhős automatikusan fut jobbra; ugrás: **Space**, **↑**, **W**, vagy telefonon **UGRÁS**.
- 10 kérdés jelenik meg a kijelölt állomásoknál. **A teljes játékszimuláció megáll**, amíg a tanuló válaszol, és a válasz utáni magyarázatot elolvassa.
- **Jó válasz:** 5 másodperc gyorsítás +100 pont; **rossz válasz:** 3 másodperc lassítás. Hibánál sincs végleges kiesés a kérdésből, a helyes információ megjelenik.
- **Akadályba ütközés:** a digitális üldöző közelebb kerül, −15 pont. **Órakristály:** ugrással gyűjthető, +30 pont.
- Ha az üldöző utolér, a futam véget ér; azonnali újrakezdés lehetséges.
- 10 kérdés és a célkapu elérése után a játék eredményképernyővel zárul.
- **Könnyű:** 2 válaszlehetőség, enyhébb üldözés, díjmentes tipp. **Normál:** 3 válaszlehetőség, tipp −10 pont. **Kihívás:** 3 válaszlehetőség, gyorsabb üldözés, tipp −10 pont.
- **Szünet:** Escape vagy Szünet gomb; másik böngészőfülre váltáskor automatikus megállás.
- Opcionális szintetizált hangok és kérdésfelolvasás. A felolvasás a böngésző magyar hangjától függ.

## Adatvédelem és mentés

A legjobb eredmény és a félbehagyott futam **kizárólag a böngésző helyi tárhelyére** (`localStorage`) kerül. Nem küldünk adatokat szerverre, nincs követőkód, regisztráció, tanulónév vagy statisztikagyűjtés. A félbehagyott futam külön törölhető a főoldalon; ez a rekordokat nem törli. A teljes böngészőadatok törlése a mentést is törli.

## Szakmai megjegyzés

A náci diktatúrát megszemélyesítő pixeles üldöző egyértelműen negatív szereplő. A játék **nem** állítja, hogy a holokauszt áldozatai válaszokkal vagy ügyességgel elkerülhették volna az üldözést. A holokausztra vonatkozó egyetlen feladat fogalomfelismerés és rövid történeti magyarázat; a tényleges áldozatok sorsa nem játékelem. A foglalkozást rövid közös megbeszéléssel érdemes zárni.

## Technikai adatok

- Verzió: **1.0.0**
- Teljesen önálló statikus HTML/CSS/JS játék, 0 külső függőséggel
- Reszponzív asztali és mobilos felület
- Minden történelmi személynév a jóváhagyott listára korlátozott (a játékban csak Hitler szerepel név szerint)
- A karakterek eredeti, Canvas API-val programozott pixelrajzok (nem Super Mario vagy más szerzői joggal védett játék grafikái)
- A `index.html` CSS/JS hivatkozásai verzióparamétert tartalmaznak a böngésző gyorsítótárával kapcsolatos korábbi probléma elkerülésére
