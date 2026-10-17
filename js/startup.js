/* START is the sole user-gesture gate. Opening music stays outside WAV. */
const startup={stage:'ready',timer:null,closeTimer:null,visible:true,busy:false};
const startupText={
 ru:{language:'ВЫБЕРИТЕ ЯЗЫК',description:'ВАША НОЧНАЯ МАСТЕРСКАЯ',body:'Фазовые хоры, пыльные колокола и музыка забытых залов. Четыре прибора, одна студия — и время, которое движется только в вашем ритме.',hint:'Начните с MOROK: выберите жанр, затем общий пресет. Или играйте мышью, MIDI-клавиатурой и клавишами A W S E D F…',enter:'ВОЙТИ В ПОДЗЕМЕЛЬЕ',help:'СПРАВКА',sound:'ЗВУК',on:'ВКЛ',off:'ВЫКЛ'},
 en:{language:'CHOOSE YOUR LANGUAGE',description:'YOUR MIDNIGHT WORKSHOP',body:'Phase-distorted choirs, dusty bells, and music from forgotten halls. Four instruments, one studio — and time that follows your own rhythm.',hint:'Start with MOROK: choose a genre, then a performance preset. Or play with your mouse, MIDI keyboard, and the keys A W S E D F…',enter:'ENTER THE DUNGEON',help:'HELP BOOK',sound:'SOUND',on:'ON',off:'OFF'}
};
function startupCopy(){return startupText[typeof language!=='undefined'?language:'ru']||startupText.ru}
function renderStartup(){
 const overlay=$('startup');if(!overlay)return;const text=startupCopy();overlay.dataset.stage=startup.stage;
 $('introReady').hidden=startup.stage!=='ready';$('introLogoWrap').hidden=!['logo','language','description'].includes(startup.stage);
 $('introLanguage').hidden=startup.stage!=='language';$('introAbout').hidden=startup.stage!=='description';$('introSound').hidden=!['language','description'].includes(startup.stage);
 $('introBegin').textContent='START';$('introLanguageTitle').textContent=text.language;$('introDescriptionTitle').textContent=text.description;$('introDescription').textContent=text.body;$('introHint').textContent=text.hint;$('introEnter').textContent=text.enter;$('introHelpLabel').textContent=text.help;
 $('introSound').textContent=text.sound+' · '+(deviceSounds?text.on:text.off);$('introSound').setAttribute('aria-pressed',String(deviceSounds));
 for(const code of ['ru','en'])$('introLang'+code.toUpperCase())?.classList.toggle('selected',typeof language!=='undefined'&&language===code);
}
function startupStage(stage){startup.stage=stage;renderStartup();if(stage==='language'){startMenuMusic();$('introLang'+(language==='en'?'EN':'RU'))?.focus({preventScroll:true})}}
async function beginStartup(){
 if(startup.stage!=='ready'||startup.busy)return;startup.busy=true;$('introBegin').disabled=true;
 try{await startDeviceAudio()}catch(e){}startupStage('logo');$('startup').focus({preventScroll:true});playOpeningMusic();
 startup.timer=setTimeout(()=>{startup.timer=null;startup.busy=false;startupStage('language')},5000);
}
function chooseStartupLanguage(code){setLanguage(code);startupStage('description');deviceClick('memory');$('introEnter')?.focus({preventScroll:true})}
function closeStartup(){
 if(!startup.visible||startup.stage!=='description')return;startup.visible=false;startup.stage='closed';if(startup.timer)clearTimeout(startup.timer);stopMenuMusic();renderStartup();document.body.classList.remove('intro-open');$('recordResult').inert=false;$('studioMain').inert=false;
 startup.closeTimer=setTimeout(()=>{$('startup').hidden=true;startup.closeTimer=null;$('audioStart')?.focus({preventScroll:true})},620);
}
function showStartup(){
 if(typeof closeHelpBook==='function')closeHelpBook(false);stopTransport();releaseAll();closeReference();document.querySelectorAll('.veil.open').forEach(v=>v.classList.remove('open'));
 if(startup.timer)clearTimeout(startup.timer);if(startup.closeTimer)clearTimeout(startup.closeTimer);stopMenuMusic();startup.timer=startup.closeTimer=null;startup.visible=true;startup.busy=false;startup.stage='ready';
 $('startup').hidden=false;$('startup').inert=false;$('introBegin').disabled=false;document.body.classList.add('intro-open');$('recordResult').inert=true;$('studioMain').inert=true;renderStartup();drawIntroWall();$('introBegin')?.focus({preventScroll:true});
}
function drawIntroWall(frame=0){
 const c=$('introWall');if(!c||!startup.visible)return;const g=c.getContext('2d');const W=Math.ceil(innerWidth/4),H=Math.ceil(innerHeight/4);if(c.width!==W||c.height!==H){c.width=W;c.height=H}
 g.fillStyle='#10151b';g.fillRect(0,0,W,H);const size=30;
 for(let row=0;row<Math.ceil(H/15);row++)for(let col=-1;col<W/size+1;col++){const x=col*size+(row%2)*15,y=row*15,n=((row*71+col*37+888)%9);g.fillStyle=['#283035','#222b31','#2d3336'][n%3];g.fillRect(x,y,size-2,13);g.fillStyle='#3a4141';g.fillRect(x+1,y+1,size-4,1);g.fillStyle='#151d22';g.fillRect(x+2,y+12,size-4,1);if(n%3===0){g.fillStyle='#1a2429';g.fillRect(x+6,y+5,4,1);g.fillRect(x+8,y+6,1,3)}}
 for(const x of [Math.round(W*.16),Math.round(W*.84)]){
  const y=Math.round(H*.43),f=Math.floor(Math.sin(frame*.19+x)*1.8);
  for(let r=8;r>0;r--){g.globalAlpha=.012;g.fillStyle='#ffac42';g.fillRect(x-r*5,y-r*5,r*10,r*10)}g.globalAlpha=1;
  g.fillStyle='#0d1319';g.fillRect(x-4,y+7,10,7);g.fillRect(x-1,y+11,4,17);g.fillStyle='#535351';g.fillRect(x-3,y+8,7,2);g.fillStyle='#5d4130';g.fillRect(x,y+3,3,19);g.fillStyle='#35281f';g.fillRect(x+2,y+5,2,17);
  g.fillStyle='#73432a';g.fillRect(x-4,y-10+f,10,17-f);g.fillStyle='#b96b2d';g.fillRect(x-3,y-12+f,8,16-f);g.fillStyle='#e4a447';g.fillRect(x-1,y-10-f,5,15+f);g.fillStyle='#f7db87';g.fillRect(x,y-4+f,3,8-f);g.fillStyle='#c47b35';g.fillRect(x+4,y-15-f,1,2);
 }
}
function setupStartup(){
 if(!$('startup')||!document.documentElement)return;document.body.classList.add('intro-open');$('recordResult').inert=true;$('studioMain').inert=true;
 $('introBegin').onclick=beginStartup;$('introEnter').onclick=closeStartup;$('introHelp').onclick=()=>openHelpBook(true);$('introLangRU').onclick=()=>chooseStartupLanguage('ru');$('introLangEN').onclick=()=>chooseStartupLanguage('en');
 $('introSound').onclick=async()=>{setDeviceSounds(!deviceSounds);if(deviceSounds){try{await startDeviceAudio()}catch(e){}if(startup.stage==='language'||startup.stage==='description')startMenuMusic()}renderStartup()};$('replayIntro').onclick=showStartup;
 window.addEventListener('keydown',e=>{
  if(!startup.visible||typeof helpBook!=='undefined'&&helpBook.open)return;
  if(startup.stage==='logo'){if(['Tab','Escape','Enter',' '].includes(e.key)){e.preventDefault();e.stopImmediatePropagation()}return}
  if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();return}
  if(e.key==='Tab'){const buttons=[...$('startup').querySelectorAll('button:not([disabled])')].filter(el=>el.getClientRects().length);if(!buttons.length)return;const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&(document.activeElement===first||!$('startup').contains(document.activeElement))){e.preventDefault();last.focus()}else if(!e.shiftKey&&(document.activeElement===last||!$('startup').contains(document.activeElement))){e.preventDefault();first.focus()}}
 },true);
 renderStartup();drawIntroWall();$('introBegin').focus({preventScroll:true});
}
