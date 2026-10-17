/* Device feedback has its own output, entirely outside the studio/WAV graph. */
let deviceAudio=null,deviceGain=null,menuTimer=null,menuVoices=[],lastDeviceClick=0;
let deviceSounds=true;try{deviceSounds=localStorage.getItem('dungeon-device-sounds')!=='off'}catch(e){}
async function startDeviceAudio(){
 if(!deviceSounds)return null;
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
 if(!deviceAudio){deviceAudio=new AC({latencyHint:'interactive',sampleRate:48000});deviceGain=deviceAudio.createGain();deviceGain.gain.value=.45;deviceGain.connect(deviceAudio.destination)}
 await deviceAudio.resume();return deviceAudio;
}
function deviceTone(frequency,time,duration,volume,type='sine',attack=.004,release=.025,detune=0){
 if(!deviceAudio||!deviceSounds)return null;
 const oscillator=deviceAudio.createOscillator(),gain=deviceAudio.createGain();oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,time);if(detune)oscillator.detune.value=detune;
 gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(volume,time+Math.min(attack,duration*.45));gain.gain.setValueAtTime(volume,Math.max(time+attack,time+duration-release));gain.gain.linearRampToValueAtTime(0,time+duration);
 oscillator.connect(gain);gain.connect(deviceGain);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()};oscillator.start(time);oscillator.stop(time+duration+.005);return {oscillator,gain,end:time+duration};
}
async function deviceClick(kind='key'){
 if(!deviceSounds)return;let now=performance.now();if(now-lastDeviceClick<28)return;lastDeviceClick=now;
 if(!await startDeviceAudio())return;let t=deviceAudio.currentTime+.003;
 if(kind==='page'){deviceTone(280,t,.022,.013,'triangle',.002,.02);deviceTone(390,t+.017,.026,.009,'triangle',.003,.021)}
 else if(kind==='memory'){deviceTone(1120,t,.043,.032,'sine',.003,.022);deviceTone(560,t,.024,.009,'triangle',.002,.018)}
 else if(kind==='switch'){deviceTone(145,t,.022,.045,'square',.001,.018);deviceTone(860,t+.006,.013,.012,'triangle',.001,.011)}
 else if(kind==='drum'){deviceTone(180,t,.018,.025,'triangle',.001,.016)}
 else if(kind==='scope'){deviceTone(1850,t,.018,.014,'sine',.001,.015)}
 else{deviceTone(310,t,.017,.025,'triangle',.001,.014);deviceTone(1230,t,.012,.01,'sine',.001,.01)}
}
function setDeviceSounds(enabled){deviceSounds=!!enabled;try{localStorage.setItem('dungeon-device-sounds',enabled?'on':'off')}catch(e){}if(!enabled)stopMenuMusic();const control=$('deviceSounds');if(control)control.checked=deviceSounds;if(deviceGain&&deviceAudio)deviceGain.gain.setTargetAtTime(enabled?.45:0,deviceAudio.currentTime,.03)}
function playOpeningMusic(){
 if(!deviceAudio||!deviceSounds)return;stopMenuMusic();let t=deviceAudio.currentTime+.04;
 // Original rising modal phrase, slow attack and a hand-shaped final decay.
 const notes=[45,52,57,59,60,64,69];notes.forEach((n,i)=>{let voice=deviceTone(440*Math.pow(2,(n-69)/12),t+i*.32,4.5-i*.32,.075,'triangle',1.05,1.45);if(voice)menuVoices.push(voice)});
 [33,45].forEach(n=>{let voice=deviceTone(440*Math.pow(2,(n-69)/12),t,4.7,.072,'sine',1.8,1.8);if(voice)menuVoices.push(voice)})
}
function startMenuMusic(){
 stopMenuMusic();if(!deviceAudio||!deviceSounds)return;
 const phrase=[57,64,60,59,57,52,55,52];let next=deviceAudio.currentTime+.08,index=0;
 const fill=()=>{if(!deviceAudio||!deviceSounds)return;while(next<deviceAudio.currentTime+.7){let n=phrase[index%phrase.length],voice=deviceTone(440*Math.pow(2,(n-69)/12),next,2.35,.055,'sine',.6,1.3);if(voice)menuVoices.push(voice);next+=1.35;index++}menuVoices=menuVoices.filter(v=>v.end>deviceAudio.currentTime)};
 fill();menuTimer=setInterval(fill,180);
}
function stopMenuMusic(){if(menuTimer){clearInterval(menuTimer);menuTimer=null}if(deviceAudio)for(let v of menuVoices)try{v.gain.gain.cancelScheduledValues(deviceAudio.currentTime);v.gain.gain.setTargetAtTime(0,deviceAudio.currentTime,.055);v.oscillator.stop(deviceAudio.currentTime+.3)}catch(e){}menuVoices=[]}
function setupDeviceAudio(){
 document.addEventListener('pointerdown',e=>{if(!e.isTrusted)return;let el=e.target.closest?.('button,select,input[type=checkbox],label:has(input[type=checkbox])');if(!el||el.closest('#keyboard,#pads,.startup'))return;let kind=el.closest('.conductor')?'memory':el.matches('input[type=checkbox],label:has(input[type=checkbox])')?'switch':el.closest('.drums')?'drum':el.closest('.scope')?'scope':'key';deviceClick(kind)},true);
 document.addEventListener('click',e=>{if(e.isTrusted&&e.detail===0&&e.target.closest?.('button,input[type=checkbox]')&&!e.target.closest('#keyboard,#pads,.startup'))deviceClick(e.target.matches('input[type=checkbox]')?'switch':e.target.closest('.conductor')?'memory':'key')},true);
 window.addEventListener('pagehide',()=>{stopMenuMusic();deviceAudio?.suspend()});
 const input=$('deviceSounds');if(input){input.checked=deviceSounds;input.onchange=()=>setDeviceSounds(input.checked)}
}
