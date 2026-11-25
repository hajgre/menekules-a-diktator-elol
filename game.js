/* MENEKÜLÉS A DIKTÁTOR ELŐL! – 1.2.0
 * Külső könyvtár nélküli, eredeti canvas-pixelplatformjáték.
 * A játék világát csak a 'running' állapotban léptetjük.
 */
(() => {
  'use strict';

  const QUESTIONS = window.HISTORY_QUESTIONS;
  if (!Array.isArray(QUESTIONS) || QUESTIONS.length !== 10) {
    document.body.textContent = 'A történelmi feladatbank nem töltődött be. Frissítsd az oldalt!';
    return;
  }
  const $ = (id) => document.getElementById(id);
  const canvas = $('gameCanvas');
  const ctx = canvas.getContext('2d', {alpha:false});
  if (!ctx) { document.body.textContent = 'Ehhez a játékhoz Canvas-t támogató böngésző szükséges.'; return; }
  ctx.imageSmoothingEnabled = false;
  const W = 960, H = 540, GROUND = 420, HERO_X = 274, FINISH = 14550;
  // Az eredeti 10 kérdés változatlan. Közöttük hosszabb ügyességi szakaszok vannak.
  const OLD_Q_POS = [370,890,1410,1930,2450,2970,3490,4010,4530,5050];
  const OLD_FINISH = 5880;
  const Q_POS = [1000,2350,3700,5050,6400,7750,9100,10450,11800,13150];
  const OBSTACLE_HEIGHT = [43,51,48];
  const GRAVITY = 1750, JUMP_STRENGTH = 700;
  const checkpoints = [0,...Q_POS,FINISH];
  const OBSTACLES = checkpoints.slice(1).flatMap((end,section)=>{
    const start=checkpoints[section], length=end-start;
    // A ládák a platformos pályarész ELŐTT és UTÁN helyezkednek el.
    return [.10,.85].map((fraction,index)=>({
      x:Math.round(start+length*fraction),id:section*2+index,type:(section*2+index)%3
    }));
  });
  // 11 külön ügyességi szakasz: az első kettő oktató; a későbbiekben szakadék
  // és fokozatosan mozgó platformok jelennek meg. Minden ugrás teljesíthető
  // az alap futósebességgel és egyetlen jól időzített ugrással is.
  const COURSES = checkpoints.slice(1).map((end,section)=>{
    const start=checkpoints[section], first=section===0?280:390;
    const platforms=[
      {id:section*3,x:start+first,w:175,y:GROUND-72,move:0,phase:section*.7},
      {id:section*3+1,x:start+first+190,w:170,y:GROUND-94,move:section>=4?22:0,phase:section*.7+1},
      {id:section*3+2,x:start+first+395,w:235,y:GROUND-66,move:section>=7?29:0,phase:section*.7+2}
    ];
    const pit=section>=1?{id:section,x:start+first+155,w:455,respawn:start+first-133}:null;
    return {section,platforms,pit};
  });
  const PLATFORMS = COURSES.flatMap(c=>c.platforms);
  const PITS = COURSES.map(c=>c.pit).filter(Boolean);
  function platformRect(p,time){
    const offset=p.move?Math.sin(time*1.25+p.phase)*p.move:0;
    const bob=p.move?Math.cos(time*1.25+p.phase)*9:0;
    return {id:p.id,x:p.x+offset,w:p.w,y:p.y+bob,move:p.move};
  }
  const CRYSTALS = [
    ...OBSTACLES.map(ob=>({x:ob.x+65,id:ob.id,y:GROUND-100})),
    ...COURSES.map((course,i)=>({x:course.platforms[1].x+95,id:OBSTACLES.length+i,y:GROUND-158}))
  ];
  const GAME_SAVE = 'idofutam_mentes_v1';
  const BEST_SAVE = 'idofutam_rekordok_v1';
  const SOUND_SAVE = 'idofutam_hang_v1';
  const LEVELS = {
    easy:{base:202,chaser:164,hit:24,label:'Könnyű',airJumps:1,fallCost:34},
    normal:{base:202,chaser:181,hit:36,label:'Normál',airJumps:0,fallCost:48},
    hard:{base:202,chaser:194,hit:45,label:'Kihívás',airJumps:0,fallCost:60}
  };
  const PANELS = ['menuPanel','questionPanel','feedbackPanel','endPanel','pausePanel'];
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const near=(x,a,b)=>x>=a&&x<=b;
  const pad=n=>String(n).padStart(2,'0');
  const fmtTime=t=>`${pad(Math.floor(t/60))}:${pad(Math.floor(t%60))}`;
  const randomish=(n)=>((Math.sin(n*127.1+81.7)*43758.5453)%1+1)%1;
  const readStore=(key)=>{try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):null;}catch{return null;}};
  const writeStore=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
  const deleteStore=(key)=>{try{localStorage.removeItem(key);}catch{}};

  const data = {
    phase:'menu',difficulty:'easy',progress:0,questionIndex:0,score:0,correct:0,
    gap:226,jump:0,vy:0,grounded:true,supportId:null,airJumps:0,falls:0,elapsed:0,worldClock:0,speedMode:'',speedTime:0,
    flashTime:0,hit:new Set(),coins:new Set(),questionChoices:[],hintShown:false,
    best:readStore(BEST_SAVE)||{},saved:null,sound:false,saveCounter:0,
    finalOutcome:'',lastResultCorrect:false,focusBeforeDialog:null
  };
  data.saved=validSave(readStore(GAME_SAVE));
  data.sound=readStore(SOUND_SAVE)===true;

  let audioCtx=null;
  function blip(freq=620,duration=.07,type='square',volume=.035){
    if(!data.sound)return;
    try{
      const AC=window.AudioContext||window.webkitAudioContext;
      if(!AC)return;
      audioCtx ||= new AC();
      if(audioCtx.state==='suspended') audioCtx.resume().catch(()=>{});
      const osc=audioCtx.createOscillator(), gain=audioCtx.createGain();
      const t=audioCtx.currentTime;
      osc.type=type;osc.frequency.setValueAtTime(freq,t);
      gain.gain.setValueAtTime(volume,t);gain.gain.exponentialRampToValueAtTime(.001,t+duration);
      osc.connect(gain);gain.connect(audioCtx.destination);osc.start(t);osc.stop(t+duration+.005);
    }catch{/* Böngésző nem támogatja a hangot: a játék tovább működik. */}
  }
  const announce=(msg)=>{$('announcer').textContent=msg;};
  function validSave(s){
    if(!s || ![1,2,3].includes(s.version) || !LEVELS[s.difficulty] || !Number.isFinite(s.progress) ||
       !Number.isInteger(s.questionIndex) || !near(s.questionIndex,0,10) ||
       !near(s.progress,0,s.version===1?OLD_FINISH:FINISH) || !Number.isFinite(s.score) ||
       !Number.isFinite(s.gap) || !near(s.gap,45,285) ||
       !Number.isInteger(s.correct) || !near(s.correct,0,10) || s.correct>s.questionIndex ||
       !Number.isFinite(s.elapsed) || !near(s.elapsed,0,36000) ||
       !Array.isArray(s.hit) || !Array.isArray(s.coins)) return null;
    if(s.version===3 && (!Number.isFinite(s.jump) || !near(s.jump,-700,550) ||
       !Number.isFinite(s.vy) || !near(s.vy,-1100,2400) ||
       typeof s.grounded!=='boolean' || !Number.isInteger(s.airJumps) ||
       !near(s.airJumps,0,1) || !Number.isInteger(s.falls) || !near(s.falls,0,999)))return null;
    return s;
  }
  function snapshot(){
    return {version:3,difficulty:data.difficulty,progress:data.progress,
      questionIndex:data.questionIndex,score:data.score,correct:data.correct,
      gap:data.gap,elapsed:data.elapsed,worldClock:data.worldClock,
      jump:data.jump,vy:data.vy,grounded:data.grounded,supportId:data.supportId,
      airJumps:data.airJumps,falls:data.falls,
      hit:[...data.hit],coins:[...data.coins],speedMode:data.speedMode,
      speedTime:data.speedTime};
  }
  function saveGame(){
    if(!['running','paused','feedback'].includes(data.phase))return;
    const save=snapshot();
    if(writeStore(GAME_SAVE,save)){data.saved=save;updateSavedUI();}
  }
  function updateSavedUI(){
    $('resumeBtn').hidden=!data.saved;
    $('resetSavedBtn').hidden=!data.saved;
    $('bestHome').textContent=Object.keys(data.best).length ?
      Object.entries(data.best).map(([key,value])=>`${LEVELS[key]?.label||key}: ${value.score} pont`).join(' · '):'Még nincs eredmény';
  }
  function resetRun(difficulty){
    data.difficulty=LEVELS[difficulty]?difficulty:'easy';
    data.progress=0;data.questionIndex=0;data.score=0;data.correct=0;data.gap=226;
    data.jump=0;data.vy=0;data.grounded=true;data.supportId=null;data.airJumps=0;data.falls=0;
    data.elapsed=0;data.worldClock=0;data.speedMode='';data.speedTime=0;
    data.flashTime=0;data.hit.clear();data.coins.clear();data.hintShown=false;
    data.saveCounter=0;data.saved=null;
    deleteStore(GAME_SAVE);
  }
  function migrateOldProgress(s){
    // Régi mentéseknél a teljesített kérdések száma alapján arányosan őrizzük a szakaszban megtett utat.
    const i=s.questionIndex;
    const oldStart=i===0?0:OLD_Q_POS[i-1];
    const oldEnd=i===10?OLD_FINISH:OLD_Q_POS[i];
    const newStart=checkpoints[i], newEnd=checkpoints[i+1];
    const ratio=clamp((s.progress-oldStart)/(oldEnd-oldStart),0,1);
    return clamp(newStart+(newEnd-newStart)*ratio,0,FINISH);
  }
  function loadRun(s){
    data.difficulty=s.difficulty;data.progress=s.version===1?migrateOldProgress(s):s.progress;
    data.questionIndex=s.questionIndex;
    data.score=Math.max(0,Math.round(s.score));data.correct=s.correct;
    data.gap=clamp(s.gap,48,275);data.jump=s.version===3?s.jump:0;
    data.vy=s.version===3?s.vy:0;data.grounded=s.version===3?s.grounded:true;
    data.supportId=s.version===3&&Number.isInteger(s.supportId)?s.supportId:null;
    data.airJumps=s.version===3?s.airJumps:0;data.falls=s.version===3?s.falls:0;
    data.elapsed=s.elapsed;
    data.worldClock=s.worldClock||0;data.speedMode=s.speedMode||'';
    data.speedTime=clamp(s.speedTime||0,0,5);
    // Régi pályáról átvett tárgyak/akadályok helyei már nem egyeznek, a pontokat megtartjuk.
    data.hit=new Set((s.version===1?[]:s.hit).filter(id=>Number.isInteger(id)&&near(id,0,OBSTACLES.length-1)));
    data.coins=new Set((s.version===1?[]:s.coins).filter(id=>Number.isInteger(id)&&near(id,0,CRYSTALS.length-1)));
    // A régi v1/v2 mentéseket megőrizzük, de nem kezdjük a játékost
    // váratlanul egy, az előző pályán még nem létező szakadék fölött.
    if(s.version!==3){
      const pit=PITS.find(p=>data.progress>=p.x && data.progress<=p.x+p.w);
      if(pit)data.progress=pit.respawn;
      data.grounded=true;data.jump=0;data.vy=0;
    }
    data.hintShown=false;data.saveCounter=0;
    $(`menuPanel`).querySelector(`input[value="${data.difficulty}"]`).checked=true;
  }
  function show(phase,panelName=null){
    data.phase=phase;
    const name=panelName || ({menu:'menuPanel',question:'questionPanel',feedback:'feedbackPanel',won:'endPanel',lost:'endPanel',paused:'pausePanel'}[phase]);
    $('overlay').hidden=phase==='running';
    PANELS.forEach(id=>$(id).hidden=id!==name);
    $('pauseBtn').disabled=phase!=='running';
    $('jumpBtn').disabled=phase!=='running';
    if(phase==='running'){
      canvas.setAttribute('tabindex','-1');
      canvas.focus({preventScroll:true});
    }else if(name){
      const target=$(name).querySelector('button:not([hidden]), input:checked');
      if(target)requestAnimationFrame(()=>{
        if(data.phase===phase)target.focus({preventScroll:true});
      });
    }
    updateHud();
  }
  function startNew(){
    const checked=document.querySelector('input[name="difficulty"]:checked');
    resetRun(checked?.value||'easy');
    show('running');saveGame();announce('A futam elindult. Ugrás: szóköz, felfelé nyíl vagy a gomb.');
    blip(700,.09);setTimeout(()=>{if(data.phase==='running')blip(950,.07);},150);
  }
  function resumeSaved(){
    const saved=validSave(readStore(GAME_SAVE));
    if(!saved){data.saved=null;updateSavedUI();return;}
    loadRun(saved);show('running');announce('Folytatod a mentett futamot.');blip(720,.1);
  }
  function toMenu(){
    if(data.phase==='running'||data.phase==='paused')saveGame();
    show('menu');updateSavedUI();
  }
  function jump(){
    if(data.phase!=='running')return;
    const extraAllowed=!data.grounded && data.airJumps<LEVELS[data.difficulty].airJumps;
    if(!data.grounded&&!extraAllowed)return;
    if(!data.grounded)data.airJumps++;
    data.grounded=false;data.supportId=null;
    data.vy=-JUMP_STRENGTH;data.jump-=1;
    blip(extraAllowed?730:470,.08);
  }
  function pause(){
    if(data.phase!=='running')return;
    saveGame();show('paused');announce('Szünet.');
  }
  function unpause(){
    if(data.phase==='paused'){show('running');announce('A futam folytatódik.');}
  }

  function shuffledOptions(q){
    const indexes=q.options.map((_,i)=>i);
    if(data.difficulty==='easy'){
      const distractors=indexes.filter(i=>i!==q.answer);
      indexes.splice(0,indexes.length,q.answer,distractors[(q.id-1)%distractors.length]);
    }
    for(let i=indexes.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[indexes[i],indexes[j]]=[indexes[j],indexes[i]];}
    return indexes.map(i=>({original:i,text:q.options[i],correct:i===q.answer}));
  }
  function showQuestion(){
    if(data.questionIndex>=QUESTIONS.length)return;
    data.hintShown=false;
    const q=QUESTIONS[data.questionIndex];
    data.questionChoices=shuffledOptions(q);
    $('questionCounter').textContent=`${q.id} / ${QUESTIONS.length} · ${q.era}`;
    $('questionTitle').textContent=q.question;
    $('answerOptions').replaceChildren();
    data.questionChoices.forEach((opt,index)=>{
      const b=document.createElement('button');
      b.type='button';b.className='answer';b.dataset.index=String(index);
      const number=document.createElement('span');number.className='answer-index';number.textContent=String(index+1);
      const label=document.createElement('span');label.textContent=opt.text;
      b.append(number,label);
      b.addEventListener('click',()=>answer(index));
      $('answerOptions').appendChild(b);
    });
    $('hintBox').hidden=true;$('hintBox').textContent='';
    $('hintBtn').disabled=false;$('hintBtn').textContent='💡 Kérek egy tippet';
    stopSpeech();
    show('question');
    $('answerOptions').querySelector('button')?.focus({preventScroll:true});
    announce(`${q.id}. kérdés. A futás és az üldözés megállt.`);
    blip(820,.11);blip(1050,.06);
  }
  function answer(index){
    if(data.phase!=='question')return;
    const choice=data.questionChoices[index];if(!choice)return;
    const q=QUESTIONS[data.questionIndex];
    const correct=choice.correct;
    data.lastResultCorrect=correct;
    data.questionIndex++;
    if(correct){data.correct++;data.score+=100;data.speedMode='boost';data.speedTime=5;}
    else{data.speedMode='slow';data.speedTime=3;}
    $('feedbackSymbol').textContent=correct?'★':'↺';
    $('feedbackSymbol').classList.toggle('wrong',!correct);
    $('feedbackTitle').textContent=correct?'HELYES VÁLASZ!':'SEMMI BAJ, TANULUNK!';
    $('feedbackSpeed').textContent=correct?'⚡ 5 MÁSODPERC GYORSÍTÁS · +100 PONT':'🐢 3 MÁSODPERC LASSÍTÁS';
    $('feedbackInfo').textContent=q.info;
    stopSpeech();show('feedback');
    blip(correct?1000:280,correct?.14:.18,correct?'square':'sawtooth',correct?.028:.023);
    announce(correct?'Helyes válasz. Gyorsítás jár.':'Másik válasz volt helyes. Lassítást kapsz, de továbbmehetsz.');
  }
  function continueRun(){
    if(data.phase!=='feedback')return;
    show('running');
    saveGame();
  }
  function hint(){
    if(data.phase!=='question'||data.hintShown)return;
    const q=QUESTIONS[data.questionIndex];
    data.hintShown=true;
    $('hintBox').textContent=q.hint;
    $('hintBox').hidden=false;
    $('hintBtn').disabled=true;$('hintBtn').textContent=data.difficulty==='easy'?'💡 Tipp megjelenítve':'💡 Tipp megjelenítve · −10 pont';
    if(data.difficulty!=='easy'){data.score=Math.max(0,data.score-10);updateHud();}
    blip(650,.05);
  }
  function stopSpeech(){
    try{if('speechSynthesis' in window)window.speechSynthesis.cancel();}catch{}
  }
  function readQuestion(){
    if(data.phase!=='question')return;
    if(!('speechSynthesis' in window)){announce('Ebben a böngészőben nem érhető el a felolvasás.');return;}
    stopSpeech();
    const q=QUESTIONS[data.questionIndex];
    const txt=`${q.question}. ${data.questionChoices.map((v,i)=>`${i+1}. ${v.text}`).join('. ')}`;
    const utter=new SpeechSynthesisUtterance(txt);
    utter.lang='hu-HU';utter.rate=.86;utter.pitch=1;
    try{window.speechSynthesis.speak(utter);}catch{announce('A böngésző nem tudta elindítani a felolvasást.');}
  }
  function result(outcome){
    if(!['running'].includes(data.phase))return;
    data.finalOutcome=outcome;
    if(outcome==='won'){
      data.score+=Math.round(clamp(data.gap,0,275)/5);
      const rec={score:data.score,correct:data.correct,elapsed:Math.round(data.elapsed)};
      const old=data.best[data.difficulty];
      if(!old||rec.score>old.score||(rec.score===old.score&&rec.elapsed<old.elapsed)){
        data.best[data.difficulty]=rec;
        writeStore(BEST_SAVE,data.best);
      }
      $('endTag').textContent='✓ KÜLDETÉS TELJESÍTVE';
      $('endTitle').textContent='SIKERÜLT A MENEKÜLÉS!';
      $('endDescription').textContent='Elérted a célvonalat, és mind a tíz történelmi kérdéshez eljutottál.';
      $('endIcon').textContent='🏁';
      blip(880,.16);setTimeout(()=>blip(1175,.18),160);
    }else{
      $('endTag').textContent='↻ A FUTAM VÉGET ÉRT';
      $('endTitle').textContent='AZ ÜLDÖZŐ UTOLÉRT!';
      $('endDescription').textContent='Próbáld újra! A helyes válaszok gyorsítanak, az akadályokat pedig átugorhatod.';
      $('endIcon').textContent='⏳';blip(180,.22,'sawtooth',.023);
    }
    $('resultCorrect').textContent=`${data.correct} / 10`;
    $('resultScore').textContent=String(data.score);
    $('resultTime').textContent=fmtTime(data.elapsed);
    const best=data.best[data.difficulty];
    $('bestResult').textContent=best?`${LEVELS[data.difficulty].label} rekord: ${best.score} pont`:'A következő futam lehet a rekordod!';
    data.saved=null;deleteStore(GAME_SAVE);updateSavedUI();
    show(outcome==='won'?'won':'lost');
    announce(outcome==='won'?'Sikerült. Elérted a célt.':'Az üldöző utolért. Újra próbálhatod.');
  }

  function inPit(x){return PITS.find(p=>x>=p.x && x<p.x+p.w)||null;}
  function feetY(){return GROUND+data.jump;}
  function fallingIntoPit(pit){
    const cfg=LEVELS[data.difficulty];
    data.falls++;data.gap=Math.max(0,data.gap-cfg.fallCost);
    data.score=Math.max(0,data.score-35);data.flashTime=.45;
    data.progress=pit.respawn;data.jump=0;data.vy=0;
    data.grounded=true;data.supportId=null;data.airJumps=0;
    blip(190,.2,'sawtooth',.02);
    announce('A szakadékba estél! Újrapróbálhatod a platformokat. Az üldöző közelebb került.');
  }
  function update(dt){
    if(data.phase!=='running')return;
    const config=LEVELS[data.difficulty];
    const speed=data.speedMode==='boost'?302:data.speedMode==='slow'?154:config.base;
    data.worldClock+=dt;data.elapsed+=dt;
    if(data.speedTime>0){data.speedTime-=dt;if(data.speedTime<=0){data.speedTime=0;data.speedMode='';}}
    if(data.flashTime>0)data.flashTime=Math.max(0,data.flashTime-dt);
    let nextProgress=data.progress+speed*dt;
    const oldFeet=feetY();
    const platforms=PLATFORMS.map(p=>platformRect(p,data.worldClock));
    // Valódi emelt platformon való mozgás: az alátámasztás elfogyhat,
    // az új ugrást a platform tetejéről indíthatja a játékos.
    if(data.grounded && data.supportId!==null){
      const support=platforms.find(p=>p.id===data.supportId);
      if(support && nextProgress>=support.x-7 && nextProgress<=support.x+support.w+7){
        data.jump=support.y-GROUND;
      }else{data.grounded=false;data.supportId=null;data.vy=Math.max(0,data.vy);}
    }
    if(data.grounded && data.supportId===null && inPit(nextProgress)){
      data.grounded=false;data.vy=0;
    }
    // A korábbi ugróakadályok megmaradnak, de a platform felett át lehet futni.
    for(const ob of OBSTACLES){
      const entry=ob.x-44;
      if(data.progress<=entry+.001 && nextProgress>=entry && feetY()>GROUND-(OBSTACLE_HEIGHT[ob.type]+7)){
        nextProgress=entry;
        if(!data.hit.has(ob.id)){
          data.hit.add(ob.id);data.gap=Math.max(0,data.gap-config.hit);
          data.score=Math.max(0,data.score-15);data.flashTime=.33;
          blip(150,.11,'sawtooth',.02);
          announce('Akadály! Ugorj át rajta a folytatáshoz.');
        }
        break;
      }
    }
    const actualSpeed=dt>0?(nextProgress-data.progress)/dt:0;
    const oldProgress=data.progress;
    data.progress=nextProgress;
    if(!data.grounded){
      data.jump+=data.vy*dt+.5*GRAVITY*dt*dt;
      data.vy+=GRAVITY*dt;
      // Csak felülről lehet a platformra érkezni, a levegőben nem állhatunk meg.
      if(data.vy>=0){
        const possible=platforms.filter(p=>data.progress>=p.x-9&&data.progress<=p.x+p.w+9&&
          oldFeet<=p.y+11&&feetY()>=p.y);
        if(possible.length){
          const landing=possible.sort((a,b)=>a.y-b.y)[0];
          data.jump=landing.y-GROUND;data.vy=0;data.grounded=true;
          data.supportId=landing.id;data.airJumps=0;
          blip(370,.028);
        }else if(!inPit(data.progress) && oldFeet<=GROUND+3&&feetY()>=GROUND){
          data.jump=0;data.vy=0;data.grounded=true;
          data.supportId=null;data.airJumps=0;
        }
      }
    }
    if(feetY()>H+48){
      const pit=PITS.find(p=>oldProgress>=p.x-30&&oldProgress<=p.x+p.w+120)||
        PITS.find(p=>data.progress>=p.x-30&&data.progress<=p.x+p.w+120);
      if(pit)fallingIntoPit(pit);
      else{data.jump=0;data.vy=0;data.grounded=true;data.supportId=null;}
    }
    data.gap=clamp(data.gap+(actualSpeed-config.chaser)*dt,0,275);
    for(const c of CRYSTALS){
      if(!data.coins.has(c.id) && Math.abs(c.x-data.progress)<25 && Math.abs(feetY()-c.y)<56){
        data.coins.add(c.id);data.score+=30;blip(1170,.09);announce('Időkristály: plusz 30 pont.');
      }
    }
    if(data.gap<=46){result('lost');return;}
    if(data.questionIndex<QUESTIONS.length && data.progress>=Q_POS[data.questionIndex]){
      data.progress=Q_POS[data.questionIndex];showQuestion();return;
    }
    if(data.progress>=FINISH && data.questionIndex===QUESTIONS.length){
      data.progress=FINISH;result('won');return;
    }
    data.saveCounter+=dt;
    if(data.saveCounter>=3){data.saveCounter=0;saveGame();}
    updateHud();
  }

  function updateHud(){
    $('hudQuestions').textContent=`${data.questionIndex} / 10`;
    $('hudScore').textContent=String(data.score);
    $('hudTime').textContent=fmtTime(data.elapsed);
    const percent=clamp(data.progress/FINISH*100,0,100);
    $('progressFill').style.width=percent.toFixed(1)+'%';
    $('progressText').textContent=Math.round(percent)+'%';
    $('chaseFill').style.width=clamp(data.gap/275*100,0,100).toFixed(1)+'%';
    const warning=data.gap<100;
    $('chaseFill').style.background=warning?'linear-gradient(90deg,#f65864,#ff9f8a)':'linear-gradient(90deg,#ffbd67,#65e6b0)';
    $('chaseText').textContent=data.gap<85?'⚠ VESZÉLY!':data.gap<155?'Közeledik!':'Biztonságos';
    const pill=$('speedPill');
    pill.className='speed-pill';
    if(data.speedTime>0 && data.phase==='running'){
      pill.classList.add('visible',data.speedMode==='boost'?'boost':'slow');
      pill.textContent=data.speedMode==='boost'?`⚡ TURBÓ ${data.speedTime.toFixed(1)} mp`:`🐢 LASSÍTÁS ${data.speedTime.toFixed(1)} mp`;
    }else{pill.textContent='';}
  }

  function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));}
  function textAt(msg,x,y,font,color,align='left'){
    ctx.fillStyle=color;ctx.font=font;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(msg,Math.round(x),Math.round(y));ctx.textAlign='left';
  }
  function sky(){
    const colors=[['#6e77a7','#efa27b','#ffd9a2'],['#6878a7','#d8a4a2','#ffd4a0'],['#637c9b','#98a7b7','#dbceb2'],['#67739e','#c48ca0','#ffbb86'],['#65688f','#c29091','#f9bd80']];
    const c=colors[Math.min(4,Math.floor(data.progress/1180))];
    const g=ctx.createLinearGradient(0,0,0,400);g.addColorStop(0,c[0]);g.addColorStop(.62,c[1]);g.addColorStop(1,c[2]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    // Süllyedő, pixeles nap és fénycsíkok
    const sunX=745-data.progress*.017;
    rect(sunX-34,88,68,68,'#fff0b3');rect(sunX-42,101,84,43,'#ffe5a8');
    rect(sunX-34,90,68,7,'#fff5cb');rect(sunX-34,130,68,8,'#ffc987');
    rect(sunX-62,159,130,5,'#f4b38f48');rect(sunX-78,174,158,4,'#f4b38f28');
    for(let i=-2;i<8;i++){
      const off=(i*222 - data.progress*.105)%1500;
      const x=(off+1500)%1500-170;
      const y=54+(i*37%115);
      rect(x,y+9,113,15,'#ffffff45');rect(x+21,y,65,15,'#fffaef71');rect(x+16,y+24,90,6,'#e9e3df55');
    }
    // távoli dombok: lépcsőzetes pixel sziluettek
    for(let i=-2;i<14;i++){
      const x=i*118-((data.progress*.17)%118);
      const peak=295+randomish(i+11)*42;
      rect(x,peak+30,125,GROUND-peak,'#6f7890');
      rect(x+12,peak+14,100,18,'#6f7890');rect(x+25,peak,78,14,'#6f7890');
    }
  }
  function town(){
    // városi házak és tetők: 0,32× parallax
    const offset=data.progress*.32;
    const first=Math.floor(offset/94)-2;
    for(let i=first;i<first+18;i++){
      const x=Math.round(i*94-offset);
      const height=118+(Math.floor(randomish(i+25)*6)*17);
      const top=GROUND-30-height;
      const wall=['#b98d9a','#a3a0b2','#a17e92','#8d8da8','#9c8a9c'][Math.abs(i)%5];
      rect(x,top,89,GROUND-top-27,wall);
      rect(x-5,top-12,99,14,'#5f668d');rect(x+4,top-20,81,9,'#545d83');
      rect(x+22,top-31,45,13,'#626588');
      // ablakok
      for(let row=0;row<3;row++)for(let col=0;col<2;col++){
        const wx=x+16+col*42,wy=top+21+row*35;
        rect(wx,wy,17,22,'#4b5a72');
        if(randomish(i*7+row*4+col)>.36)rect(wx+3,wy+3,11,15,'#e9c592');
        rect(wx+8,wy,2,22,'#7d6c7b');
        rect(wx-3,wy+23,24,4,'#766981');
      }
      rect(x+35,GROUND-65,22,37,'#626078');rect(x+42,GROUND-57,3,8,'#e6c29a');
    }
    // fák és lámpák parallaxban
    const treeOffset=data.progress*.52;
    const firstTree=Math.floor(treeOffset/165)-2;
    for(let i=firstTree;i<firstTree+11;i++){
      const x=Math.round(i*165-treeOffset);
      rect(x+22,GROUND-100,11,75,'#6c6175');
      rect(x+2,GROUND-135,53,42,'#547881');
      rect(x+13,GROUND-158,32,35,'#4d7180');
      rect(x-7,GROUND-117,69,23,'#4b6f74');
      rect(x+13,GROUND-149,12,11,'#769397');
    }
  }
  function middleGround(){
    rect(0,GROUND-38,W,36,'#4d647b');rect(0,GROUND-15,W,18,'#68767c');
    // hátsó kerítés, oszlopok
    const fenceOffset=data.progress*.72;
    const first=Math.floor(fenceOffset/94)-1;
    for(let i=first;i<first+14;i++){
      const x=i*94-fenceOffset;
      rect(x,GROUND-60,8,62,'#586b78');rect(x-3,GROUND-65,14,9,'#809192');
      rect(x,GROUND-44,96,7,'#75858e');rect(x,GROUND-26,96,7,'#6d808d');
    }
  }
  function road(){
    rect(0,GROUND,W,H-GROUND,'#343b55');rect(0,GROUND,W,12,'#6f7180');rect(0,GROUND+10,W,8,'#4b5368');
    const step=64, off=(data.progress*.98)%step;
    for(let i=0;i<19;i++){
      const x=i*step-off;
      rect(x,GROUND+24,55,3,'#5d5b71');
      rect(x+29,GROUND+43,31,5,'#414b61');
      rect(x-12,GROUND+70,51,4,'#526076');
      rect(x+15,GROUND+92,36,5,'#454b65');
    }
    rect(0,H-15,W,15,'#202b46');
    // A szakadékok nem díszletek: alattuk NINCS járható talaj.
    for(const pit of PITS){
      const x=HERO_X+pit.x-data.progress;
      if(x>W+20||x+pit.w<-20)continue;
      rect(x,GROUND, pit.w,H-GROUND,'#10182c');
      rect(x,GROUND+7,pit.w,10,'#29304b');
      rect(x,GROUND+32,pit.w,3,'#4b3d5b');
      rect(x-8,GROUND-4,10,19,'#f1a76a');
      rect(x+pit.w-2,GROUND-4,10,19,'#f1a76a');
      for(let k=0;k<Math.ceil(pit.w/58);k++){
        const dx=x+18+k*58;
        rect(dx,GROUND+48+Math.round(Math.sin(data.worldClock*2+k)*5),29,4,'#45587b');
      }
    }
  }
  function obstacle(x,y,type){
    const bx=Math.round(x-23);
    if(type===0){
      rect(bx,y-43,48,43,'#bd855e');rect(bx+5,y-39,38,35,'#e4ad77');
      rect(bx+5,y-38,7,35,'#b77956');rect(bx+35,y-38,7,35,'#b77956');
      rect(bx+5,y-24,36,5,'#bd815e');rect(bx+14,y-43,5,43,'#8c5a49');
    }else if(type===1){
      rect(bx+7,y-48,36,47,'#53677c');rect(bx+4,y-51,42,9,'#b4b9b4');
      rect(bx+10,y-46,30,7,'#70777c');rect(bx+12,y-18,26,6,'#2a415a');
      rect(bx+17,y-39,15,5,'#a8b5b6');
    }else{
      rect(bx,y-33,49,34,'#7d6b70');rect(bx+5,y-39,40,7,'#9b8a81');
      rect(bx+8,y-26,33,9,'#b9a08a');rect(bx+15,y-48,19,10,'#685f68');
    }
    rect(bx-4,y,58,6,'#243144');
  }
  function drawPlatform(p){
    const x=HERO_X+p.x-data.progress;
    if(x+p.w<-20||x>W+20)return;
    rect(x,p.y,p.w,16,p.move?'#8ddbd5':'#d3bfa6');
    rect(x+4,p.y+4,p.w-8,8,p.move?'#5c9ea8':'#b98f78');
    rect(x+7,p.y+15,p.w-14,16,p.move?'#465e88':'#6e6b7b');
    for(let k=8;k<p.w-8;k+=30){
      rect(x+k,p.y+18,21,4,'#4d506f');
      if(p.move)rect(x+k+6,p.y-4,11,4,'#c2ffed');
    }
    rect(x+4,p.y-4,8,5,'#fff0b9');rect(x+p.w-12,p.y-4,8,5,'#fff0b9');
  }
  function crystal(x,y,t){
    const bob=Math.round(Math.sin(t*3+x*.04)*4);
    rect(x-9,y-16+bob,18,28,'#3a9fad');rect(x-5,y-22+bob,10,35,'#b9f9de');
    rect(x-10,y-12+bob,20,6,'#6ae5d0');rect(x-4,y-20+bob,4,9,'#fff9d5');
    rect(x-16,y+12+bob,6,5,'#74d2d4');rect(x+12,y-23+bob,5,5,'#fef2af');
  }
  function gate(x){
    rect(x-10,GROUND-180,16,181,'#596584');rect(x+84,GROUND-180,16,181,'#596584');
    rect(x-16,GROUND-191,118,17,'#374969');rect(x-9,GROUND-186,103,6,'#ffe1a0');
    rect(x+10,GROUND-151,65,38,'#132e4c');
    textAt('CÉL',x+43,GROUND-133,'bold 25px monospace','#f7e4a8','center');
    for(let k=0;k<8;k++)rect(x+10+k*9,GROUND-80,5,80,'#8db6b6');
  }
  function mainCharacter(x,feet,t,hero=true){
    const run=hero && data.phase==='running' && data.grounded;
    const stride=run?Math.sin(t*18)*10:0;
    const hop=run?Math.abs(Math.sin(t*18))*2:0;
    const px=Math.round(x),py=Math.round(feet-hop);
    // árnyék
    if(hero&&data.grounded){rect(px-19,py+2,41,6,'#19263888');}else rect(px-17,GROUND+2,35,5,'#19263888');
    if(hero){
      // lábak
      rect(px-12,py-16+stride*.35,12,17,'#28395a');rect(px+3,py-16-stride*.35,12,17,'#263755');
      rect(px-14,py-2+stride*.35,17,6,'#1e2a44');rect(px+3,py-2-stride*.35,17,6,'#1e2a44');
      // hátizsák
      rect(px-22,py-56,14,28,'#e6a460');rect(px-26,py-49,5,17,'#b67e52');
      rect(px-13,py-60,30,37,'#377eb7');rect(px-9,py-57,22,30,'#50a2d7');
      rect(px+6,py-53,17,10,'#f8d36e');rect(px+15,py-47,9,17,'#ebba88');
      rect(px-13,py-53,6,24,'#eab687');
      // nyak és arc
      rect(px-6,py-73,13,17,'#f0c99d');rect(px-11,py-94,30,25,'#f5d0a1');
      rect(px-13,py-96,33,9,'#3d456b');rect(px-10,py-101,27,8,'#344d7a');
      rect(px+13,py-85,4,4,'#233b52');rect(px+19,py-82,4,7,'#eec395');
      // jellegzetes sárga sál
      rect(px-11,py-64,30,9,'#ffdc72');rect(px-15,py-61,7,19,'#ffdc72');
    }else{
      // stilizált, egyértelműen negatív karakter, jelvény nélkül
      const stride2=(data.phase==='running'?Math.sin(t*15)*8:0);
      rect(px-12,py-18+stride2*.3,10,18,'#292d3b');rect(px+3,py-18-stride2*.3,10,18,'#252836');
      rect(px-15,py-3+stride2*.3,16,5,'#181c29');rect(px+3,py-3-stride2*.3,15,5,'#181c29');
      rect(px-15,py-55,31,38,'#454b50');rect(px-10,py-57,21,32,'#676e70');
      rect(px-18,py-51,6,25,'#51565b');rect(px+13,py-51,7,25,'#51565b');
      rect(px-7,py-63,15,11,'#e0b38d');
      rect(px-12,py-90,29,27,'#e9b994');rect(px-14,py-94,27,8,'#222a30');
      rect(px-8,py-101,20,10,'#252b30');rect(px-10,py-88,11,7,'#252b30');
      rect(px+10,py-81,3,4,'#1a2730');rect(px+1,py-74,11,5,'#2f292b');
      rect(px-13,py-63,30,3,'#272e36');
    }
  }
  function draw(){
    sky();town();middleGround();road();
    PLATFORMS.map(p=>platformRect(p,data.worldClock)).forEach(drawPlatform);
    const camera=data.progress-HERO_X;
    // peronos feliratok és történelmi kérdésjelzők
    for(let i=0;i<Q_POS.length;i++){
      if(i<data.questionIndex)continue;
      const x=Math.round(HERO_X+Q_POS[i]-data.progress);
      if(!near(x,-70,1030))continue;
      const y=GROUND-136+Math.round(Math.sin(data.worldClock*3+i)*5);
      rect(x-23,y-26,46,47,'#1d567e');rect(x-17,y-20,34,35,'#60c5e4');
      rect(x-11,y+22,22,6,'#21375f');
      textAt('?',x,y-2,'bold 33px monospace','#16344b','center');
    }
    for(const c of CRYSTALS){
      if(data.coins.has(c.id))continue;
      const x=HERO_X+c.x-data.progress;
      if(near(x,-40,1000))crystal(x,GROUND-98,data.worldClock);
    }
    for(const ob of OBSTACLES){
      const x=HERO_X+ob.x-data.progress;
      if(near(x,-70,1000))obstacle(x,GROUND,ob.type);
    }
    if(data.progress>FINISH-950){const x=HERO_X+FINISH-data.progress;if(near(x,-150,1040))gate(x);}
    // Pályajelzés a következő többszintes ugrássorozat előtt.
    if(data.phase==='running'){
      const upcoming=COURSES.find(c=>{
        const dx=c.platforms[0].x-data.progress;
        return dx>0&&dx<250;
      });
      if(upcoming){
        const dx=upcoming.platforms[0].x-data.progress;
        const x=HERO_X+dx;
        rect(x-74,GROUND-232,148,30,'#244e75');
        rect(x-74,GROUND-232,148,3,'#ffe5a3');
        textAt('↑ PLATFORMOK',x,GROUND-216,'bold 18px monospace','#f6f0cf','center');
      }
    }
    // Közeledő akadály jól látható, előre jelzett ugrásfeladattal.
    if(data.phase==='running'){
      const approaching=OBSTACLES.find(ob=>ob.x-data.progress>=0 && ob.x-data.progress<300);
      if(approaching){
        const d=approaching.x-data.progress;
        const x=HERO_X+d;
        rect(x-56,GROUND-176,112,29,d<120?'#973d55':'#254a73');
        rect(x-56,GROUND-176,112,3,'#ffe5a3');
        textAt('↑ UGORJ!',x,GROUND-161,'bold 21px monospace','#fff6cb','center');
      }
    }
    // vízszintes futási sugár és üldöző
    if(data.phase==='running' && data.speedMode==='boost'){
      for(let i=0;i<4;i++)rect(HERO_X-45-i*25,GROUND-55+i*11,36,4,'#fff2be96');
    }
    if(data.gap<270)mainCharacter(HERO_X-data.gap,GROUND,data.worldClock,false);
    if(data.gap>=270){
      rect(18,GROUND-96,86,19,'#1b3044d0');
      textAt('ÜLDÖZŐ ←',60,GROUND-85,'bold 12px monospace','#ffe1be','center');
    }
    mainCharacter(HERO_X,GROUND+data.jump,data.worldClock,true);
    if(data.flashTime>0){ctx.fillStyle=`rgba(252,93,94,${data.flashTime*.45})`;ctx.fillRect(0,0,W,H);}
    // kis díszcsík az alsó sarokban
    rect(18,H-44,112,26,'#132c48cf');
    textAt(`${Math.round(data.progress/FINISH*100)}%  ·  ${data.questionIndex}/10`,27,H-30,'bold 15px monospace','#e6fff2');
  }
  let previousTime=null;
  function frame(time){
    if(previousTime==null)previousTime=time;
    const dt=clamp((time-previousTime)/1000,0,.032);
    previousTime=time;
    update(dt);draw();requestAnimationFrame(frame);
  }
  function onKey(event){
    const tag=event.target?.tagName;
    if(['INPUT','TEXTAREA','SELECT'].includes(tag))return;
    if(data.phase==='question'&&['1','2','3'].includes(event.key)){
      event.preventDefault();answer(Number(event.key)-1);return;
    }
    if(data.phase==='feedback'&&event.key==='Enter'){
      event.preventDefault();continueRun();return;
    }
    if(event.key==='Escape'){
      if(data.phase==='running'){event.preventDefault();pause();}
      else if(data.phase==='paused'){event.preventDefault();unpause();}
      return;
    }
    if(data.phase==='running'&&[' ','ArrowUp','w','W'].includes(event.key)){
      event.preventDefault();if(!event.repeat)jump();
    }
  }

  $('startBtn').addEventListener('click',startNew);
  $('resumeBtn').addEventListener('click',resumeSaved);
  $('continueBtn').addEventListener('click',continueRun);
  $('retryBtn').addEventListener('click',startNew);
  $('backBtn').addEventListener('click',toMenu);
  $('jumpBtn').addEventListener('pointerdown',(e)=>{e.preventDefault();jump();});
  $('jumpBtn').addEventListener('click',(e)=>{if(e.detail===0)jump();}); // billentyűzetes aktiválás, nincs dupla touch-ugrás
  $('pauseBtn').addEventListener('click',pause);
  $('unpauseBtn').addEventListener('click',unpause);
  $('pauseMenuBtn').addEventListener('click',toMenu);
  $('hintBtn').addEventListener('click',hint);
  $('readBtn').addEventListener('click',readQuestion);
  $('soundBtn').addEventListener('click',()=>{
    data.sound=!data.sound;writeStore(SOUND_SAVE,data.sound);
    renderSoundButton();if(data.sound)blip(780,.1);
  });
  $('resetSavedBtn').addEventListener('click',()=>{
    deleteStore(GAME_SAVE);data.saved=null;updateSavedUI();
    announce('A félbehagyott futam mentése törölve. A rekordokat megtartottuk.');
  });
  document.addEventListener('keydown',onKey);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden&&data.phase==='running'){pause();stopSpeech();}
  });
  window.addEventListener('pagehide',()=>{
    if(data.phase==='running'||data.phase==='paused')saveGame();stopSpeech();
  });
  function renderSoundButton(){
    $('soundBtn').textContent=data.sound?'♫ Hang: be':'♪ Hang: ki';
    $('soundBtn').setAttribute('aria-pressed',String(data.sound));
  }

  // Visszaellenőrzésre alkalmas, kizárólag olvasható státuszinformáció.
  Object.defineProperty(window,'idoFutamStatus',{get:()=>Object.freeze({
    phase:data.phase,version:'1.2.0',questions:QUESTIONS.length,answered:data.questionIndex,
    progress:Math.round(data.progress),score:data.score,correct:data.correct,
    gap:Math.round(data.gap),difficulty:data.difficulty,obstacles:OBSTACLES.length,
    platforms:PLATFORMS.length,pits:PITS.length,falls:data.falls,
    grounded:data.grounded,heroHeight:Math.round(-data.jump)
  })});

  renderSoundButton();updateSavedUI();show('menu');updateHud();
  requestAnimationFrame(frame);
})();
