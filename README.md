# Menekülés a diktátor elől! – v1.3.0

**GitHub Pages-kompatibilis 2D történelmi pixelplatformjáték (TANAK 8.)**

## Újdonság: „Elkaptak!” vereségjelenet

Ha az üldöző eléri a karaktert, a pálya **azonnal megáll**. A játék 0,4 másodperces piros villanást és enyhe, fokozatosan megszűnő kamerarázást mutat, valamint – ha a „Hang: be” aktív – rövid, háromhangos retro vereséghangot játszik. **Az elkapástól számított 1 másodperc után** megjelenik a panel:

- **Elkaptak!**
- **Hitler utolért, a küldetés megszakadt.**
- **Újrapróbálom** / **Főmenü**

Csökkentett mozgás beállításnál a kamerarázás kimarad. A hang kikapcsolva marad, ha a felhasználó ezt korábban választotta. Nincs külső hang- vagy képfájl; a hangot a böngésző generálja.

## Megőrzött elemek

- 10 változatlan történelmi kérdés, 3 nehézségi szint
- 33 platform, 10 szakadék, 22 láda/hordó
- teljes megállás kérdés és visszajelzés alatt
- 5 mp turbó / 3 mp lassítás, pontok, rekordok
- ugrás billentyűzetről vagy mobilról; könnyű módban dupla ugrás
- böngészőn belüli mentések és hangbeállítás ugyanazokkal a kulcsokkal:
  `idofutam_mentes_v1`, `idofutam_rekordok_v1`, `idofutam_hang_v1`
- v1–v3 mentésforma támogatása

## Fájlok

`index.html`, `styles.css`, `game.js`, `questions.js` – a játék működéséhez szükséges fájlok; mind a repository főmappájába kerüljenek.

`GITHUB-FRISSITES.md`, `CHANGELOG.md`, `TESZTEREDMENYEK.md` – útmutató és ellenőrzések.

## Technikai háttér

Nincsenek külső csomagok, adatbázisok, API-k vagy fiókok. A játék személyes adatot nem gyűjt. A pixelvilág és a menekülés fiktív: a történelmi üldözöttek sorsát nem szimulálja.

**Forrás:** a korábban kiadott **v1.2.0** helyi forráskódjára épül. A nyilvános GitHub-repository pillanatnyi fájljai a jelen környezetből nem voltak beolvashatók. Feltöltés előtt készíts biztonsági mentést.
