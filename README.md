# MENEKÜLÉS A DIKTÁTOR ELŐL! – v1.2.0

**Eredeti 2D pixelplatformjáték** a II. világháborúról, TANAK 8. osztály számára. Nincs szükség regisztrációra, internetes API-ra vagy külső könyvtárra.

## Újdonságok

- 11 platformos ügyességi szakasz, összesen **33 magasított platform**; a későbbi pályákon egyes platformok mozognak.
- **10 szakadék**, melyeket a platformokon ugrálva kell áthidalni.
- **22 láda/hordó** (a v1.1.0 akadályai), változatos ugrási lehetőségek.
- Leeséskor biztonságos előző pontról lehet újra próbálkozni, de az üldöző közelebb jut, és pontlevonás történik.
- Könnyű szinten egy második ugrás is lehetséges a levegőben. Normál és kihívás szinten egy ugrás jár elrugaszkodásonként.
- 10 változatlan, történelmileg ellenőrzött rövid kérdés; kérdéskor **minden mozgás és időmérés megáll**, a válasz utáni ismertetőnél is.
- Helyes válasz: 5 másodperc turbó, +100 pont. Hibás: 3 másodperc lassítás, továbbjutási lehetőséggel.

## Irányítás

Az automatikusan futó karaktert ugrással irányítod: **Szóköz, ↑, W**, illetve mobilon **UGRÁS**. Számítógépen 1/2/3 a válaszok, Enter a kérdés utáni folytatás, Esc a szünet.

TIPP: az ugrást még a platform előtt indítsd! A platform tetejéről újabb ugrással juthatsz át a következőre. Könnyű fokozaton a levegőben még egyszer megnyomhatod az ugrást.

## GitHub Pages – frissítés

Lásd a `GITHUB-FRISSITES.md` fájlt. Fő fájlok: `index.html`, `styles.css`, `game.js`, `questions.js`. **Az IDŐUGRÁS játékát ne módosítsd.**

## Mentés és adatvédelem

A program a meglévő `idofutam_mentes_v1`, `idofutam_rekordok_v1` és `idofutam_hang_v1` böngészőtárhely-kulcsokat használja tovább. A mentés formátuma v3, a v1 és v2 mentésekből történő folytatás támogatott. Az összes adat **helyileg, a böngészőben** marad. Nem gyűjtünk személyes adatokat.

## Történelmi keret

Az üldöző karikatúraszerű negatív szereplő; a futópálya teljesen fiktív, **nem** a történelmi üldözöttek túlélésének szimulációja. A kérdések a már tanult tényeket ismétlik. A játék nem használja a holokauszt áldozatainak sorsát játékkockázatként.

## Fejlesztői ellenőrzés

A helyi JS- és böngészős tesztek eredményét a `TESZTEREDMENYEK.md` tartalmazza. Az éles GitHub Pages-t a feltöltés után külön ellenőrizni kell.
