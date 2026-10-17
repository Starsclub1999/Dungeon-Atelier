/* Preset voice budgets are computed on the UI thread, never in the render loop. */
const voiceBudgets=[4,8,16,32,64];
let polyphonyAuto=true,polyphonyPeak=0,polyphonyUpdateTimer=null;
function timbreVoiceBudget(p){
 if(voiceBudgets.includes(p.voices))return p.voices;
 return ({Bass:4,Keys:8,Arcane:8,Bells:16,Organ:16,Choir:32,Pad:32,Drone:32,Strings:32})[p.cat]||16;
}
function voiceReleaseSeconds(p){
 const lines=p.mode===0?[p.lines[0]]:p.mode===1?[p.lines[1]]:p.lines;
 return Math.max(...lines.map(l=>l.amp.p.slice(l.amp.s+1).reduce((sum,pt)=>sum+pt[0],0)));
}
function scoreVoiceDemand(score=notes,p=patch,tempo=bpm){
 if(!score.length)return 0;const tail=voiceReleaseSeconds(p)*tempo/15,events=[];
 for(const n of score){events.push([n.s,1],[n.s+n.l+tail,-1])}
 events.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);let count=0,peak=0;for(const event of events){count+=event[1];if(count>peak)peak=count}return peak;
}
function refreshPolyphonyControls(){
 const el=$('polyphony');if(!el)return;el.value=polyphony;$('polyAuto').classList.toggle('active',polyphonyAuto);$('polyAuto').setAttribute('aria-pressed',String(polyphonyAuto));
 $('polyphonyInfo').textContent=polyphonyAuto?(language==='en'?'AUTO · SCORE PEAK ':'АВТО · ПИК ПАРТИИ ')+polyphonyPeak:(language==='en'?'MANUAL VOICE LIMIT':'РУЧНОЙ ЛИМИТ ГОЛОСОВ');
 $('voiceCount').textContent=String(voiceLoad).padStart(2,'0')+' / '+String(polyphony).padStart(2,'0');
}
function setPolyphony(value,{manual=false}={}){
 if(!voiceBudgets.includes(+value))return;if(manual)polyphonyAuto=false;polyphony=+value;node?.port.postMessage({type:'poly',value:polyphony});refreshPolyphonyControls();
}
function applyPresetPolyphony(){
 if(polyphonyUpdateTimer){clearTimeout(polyphonyUpdateTimer);polyphonyUpdateTimer=null}if(!polyphonyAuto){refreshPolyphonyControls();return}
 polyphonyPeak=scoreVoiceDemand();const required=Math.max(timbreVoiceBudget(patch),polyphonyPeak);
 setPolyphony(voiceBudgets.find(n=>n>=required)||64);
}
function queuePolyphonyUpdate(){if(!polyphonyAuto)return;if(polyphonyUpdateTimer)clearTimeout(polyphonyUpdateTimer);polyphonyUpdateTimer=setTimeout(applyPresetPolyphony,150)}
function setupPolyphony(){
 $('polyphony').onchange=e=>setPolyphony(+e.target.value,{manual:true});$('polyAuto').onclick=()=>{polyphonyAuto=!polyphonyAuto;if(polyphonyAuto)applyPresetPolyphony();else refreshPolyphonyControls()};applyPresetPolyphony();
}
