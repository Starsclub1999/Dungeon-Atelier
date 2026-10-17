'use strict';
const $=id=>document.getElementById(id), clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), TAU=Math.PI*2, clone=x=>JSON.parse(JSON.stringify(x));
let toastTimer;function toast(t){$('toast').textContent=t;$('toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').style.display='none',3500)}
const waveNames=['SAW','SQUARE','PULSE','DOUBLE SINE','SAW / PULSE','RESO I','RESO II','RESO III'];
const noteNames=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];const noteName=n=>noteNames[((n%12)+12)%12]+(Math.floor(n/12)-1);
const scales={minor:[0,2,3,5,7,8,10],phrygian:[0,1,3,5,7,8,10],harmonic:[0,2,3,5,7,8,11],dorian:[0,2,3,5,7,9,10]};
function ampEnv(a,d,s,r){return {s:3,p:[[a,1],[d*.55,Math.min(1,s+.15)],[d*.45,s],[.03,s],[r*.22,s*.7],[r*.28,s*.35],[r*.3,s*.1],[r*.2,0]]}}
function timbreEnv(a,d,s,r){return {s:3,p:[[Math.max(.005,a*.6),1],[d,.65],[d*.6,s],[.02,s],[r*.3,s*.7],[r*.3,s*.35],[r*.25,s*.1],[r*.15,0]]}}
function makePatch(name,cat,desc,w1,w2,depth,attack,decay,sustain,release,detune,rev,echo,extra={}){
 const line=(w,offset)=>({wave:w,wave2:-1,depth,level:offset?0.72:1,oct:0,amp:ampEnv(attack*(offset?1.17:1),decay,sustain,release),dcw:timbreEnv(attack,decay,.65,release),pitch:{s:3,p:[[.025,.5],[.13,.5],[.1,.5],[.02,.5],[.1,.5],[.1,.5],[.1,.5],[.1,.5]]}});
 return {name,cat,desc,lines:[line(w1,0),line(w2,1)],detune,mode:2,ring:0,noise:0,brightness:.7,vibrato:0.003,vibRate:4.2,pitchDepth:0,reverb:rev,delay:echo,delayTime:.375,chorus:.3,drive:0,...extra};
}

function seeded(seed){let x=seed>>>0;return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296}}
function hashString(s){let h=2166136261;for(let c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
function formatTime(t){return Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0')}
function setOptions(el,list,selected){el.replaceChildren();for(let [v,t] of list)el.add(new Option(t,v));el.value=String(selected)}
function listen(id,event,fn){$(id).addEventListener(event,fn)}
