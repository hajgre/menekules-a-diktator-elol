# Teszteredmények – Menekülés a diktátor elől! v1.0.0

2026. november 25.

## Elvégzett vizsgálatok

| Vizsgálat | Eredmény |
|---|---|
| JavaScript szintaxis (`node --check game.js` és `questions.js`) | Sikeres |
| Chromium desktop megjelenítés (1440×1000), képernyőkép | Sikeres |
| Chromium mobilnézet (390×844), képernyőkép | Sikeres |
| Indítás és első történelmi kérdés | Sikeres |
| **Kérdés közbeni teljes megállás** – pozíció, játékidő, üldöző távolsága, háttér animációja | Sikeres: az értékek változatlanok |
| Mind a 10 kérdés helyes megválaszolása, könnyű szint | Sikeres, célba érés |
| Mind a 10 kérdés helyes megválaszolása, normál szint | Sikeres, célba érés |
| Mind a 10 kérdés helyes megválaszolása, kihívás szint | Sikeres, célba érés |
| Válaszok száma: könnyű=2, normál/nehéz=3 | Sikeres |
| Hibás válasz után 3 mp lassítás | Sikeres |
| Tipp megjelenítése | Sikeres |
| Szünet – idő, szereplők, pontszám nem változik | Sikeres |
| Félbehagyott futam mentése, menüből folytatás | Sikeres az automatizált helyi tárhely-szimulációban |
| Üldöző utoléri a játékost ismételt hibás válaszoknál | Sikeres – vereség megjelenik |
| Nincs futás közbeni JavaScript-hiba a tesztelt útvonalakon | Sikeres |

A végigjátszásokat a Chromium böngészőben automatizáltunk; a mozgást és időléptetést a **teszt során, csak memóriában hozzáadott** belső teszthurokkal gyorsítottuk. Ez a tesztkód nem része az átadott játékfájloknak. A valós sebességű első kérdésig történő játékmenetet külön böngészőpróbával ellenőriztük.

## Még nem ellenőrzött

- A közzétett GitHub Pages URL valódi hálózati kiszolgálását a feltöltés után kell tesztelni.
- Valódi fizikai mobilkészüléken, Safari / Firefox külön ellenőrzés nem történt; csak Chromium mobilméretet vizsgáltunk.
- A böngészőfüggő magyar szövegfelolvasás hangminőségét és tényleges audio-kimenetét nem ellenőriztük.
- Az automatizált teszt mentéstárolót szimulált, valós GitHub-origin helyi tárhelyét nem teszteltük.

## Ismert működési korlátok

- A felolvasás csak akkor működik, ha a böngésző támogatja a SpeechSynthesis funkciót és van megfelelő hang.
- A motoros feladatok miatt a pontszám nem kizárólag történelmi tudást tükröz.
- Rekordok és mentések böngésző-/eszközfüggők; böngészőadatok törlésekor elvesznek.
