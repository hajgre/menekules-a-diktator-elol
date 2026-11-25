# Teszteredmények – v1.1.0

2026. november 25.

## Ezen kiadásban ténylegesen végzett ellenőrzések

A JavaScript-vezérlőt valódi JS futtatókörnyezetben, egy DOM/Canvas-helyettesítőteszttel futtattuk. A belső állapotot kizárólag a teszt memóriájában tettük elérhetővé, ez a tesztkapu **nem** része az átadott `game.js` fájlnak.

| Vizsgálat | Eredmény |
|---|---|
| `node --check` – `game.js`, `questions.js` | Sikeres |
| Feladatok és akadályok: 10 kérdés, 22 akadály | Sikeres |
| Első kérdés 1000, továbbiak 1350 pályaegységenként | Sikeres |
| Akadály megállítja a futót, amíg nem ugrik | Sikeres |
| Egy akadálynál egyszeri büntetés, ugrással továbblépés | Sikeres |
| Teljes 10 kérdés és 22 akadály – könnyű | Sikeres |
| Teljes 10 kérdés és 22 akadály – normál | Sikeres |
| Teljes 10 kérdés és 22 akadály – kihívás | Sikeres |
| Kérdés/megoldás közben a játékidő, haladás és üldözés nem változik | Sikeres |
| Hibás válasz utáni három másodperces lassítás | Sikeres |
| v1.0.0 mentés átváltása, pontok megtartása | Sikeres |
| v1.1.0 mentés létrehozása és visszatöltése szimulált tárhelyről | Sikeres |
| Ugrás gomb eseménykezelője | Sikeres |

## Nem ellenőrzött részek

- A Chromium grafikus böngészős tesztje a futtatási környezetben navigációs korlátozásba ütközött; így **nincs új v1.1.0-s képernyőképes validáció**. Az előző v1.0.0-s mobilos/asztali képernyőképeket nem tekintjük új tesztnek.
- Fizikai telefon és Safari/Firefox alatt a frissített változatot nem próbáltuk ki.
- A felolvasás tényleges hangkimenetét és a GitHub Pages éles HTTPS-es futását a feltöltés után kell ellenőrizni.

## Ismert korlát

Az ügyességi teljesítmény nem egyenlő a történelmi tudással. A megtorpanás és az üldöző miatti vereség a mozgásmechanikához tartozik; pedagógiai értékeléskor a kérdések helyességét külön érdemes figyelembe venni.
