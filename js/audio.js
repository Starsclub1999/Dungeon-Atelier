async function startAudio(){
 if(startPromise)return startPromise;
 if(ctx&&engineReady){await ctx.resume();return true}
 startPromise=(async()=>{try{
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('Web Audio недоступен');
  ctx=new AC({latencyHint:'interactive',sampleRate:48000});await ctx.resume();tables=await buildTables();
  let wasmModule=null;
  try{if(typeof WebAssembly!=='undefined'){const bytes=Uint8Array.from(atob(pdKernelBase64),c=>c.charCodeAt(0));wasmModule=await WebAssembly.compile(bytes)}}catch(e){console.info('PD JavaScript kernel selected',e)}
  const blob=new Blob([processorSource],{type:'application/javascript'}),url=URL.createObjectURL(blob);
  try{await ctx.audioWorklet.addModule(url);node=new AudioWorkletNode(ctx,'cz-pd-engine',{numberOfInputs:0,numberOfOutputs:2,outputChannelCount:[2,2],processorOptions:{wasmModule}});$('engineStatus').textContent=wasmModule?'AudioWorklet · WebAssembly · 48 kHz':'AudioWorklet · PD · 48 kHz'}
  catch(e){console.info('Using compatible buffer renderer',e);node=makeFallback(wasmModule);$('engineStatus').textContent='PD · совместимый режим'}finally{URL.revokeObjectURL(url)}
  node.port.onmessage=e=>{if(e.data.type==='voices'){voiceLoad=e.data.count;$('voiceCount').textContent=String(voiceLoad).padStart(2,'0')+' / '+String(polyphony).padStart(2,'0')}else if(e.data.type==='ended')finishAudioTransport(e.data.run);else if(e.data.type==='keys')setPlaybackKeys(e.data.keys)};
  node.port.postMessage({type:'tables',tables},[tables.buffer]);tables=null;node.port.postMessage({type:'patch',patch:clone(patch)});node.port.postMessage({type:'poly',value:polyphony});
  filter=ctx.createBiquadFilter();filter.type='lowpass';filter.Q.value=.5;node.connect(filter,0,0);
  const shaper=ctx.createWaveShaper(),preDrive=ctx.createGain(),curve=new Float32Array(16384);preDrive.gain.value=.125;for(let i=0;i<curve.length;i++){let x=i*2/(curve.length-1)-1;curve[i]=Math.tanh(x*9.6)}shaper.curve=curve;shaper.oversample='2x';filter.connect(preDrive);preDrive.connect(shaper);
  master=ctx.createGain();master.gain.value=masterVolume;dry=ctx.createGain();dry.gain.value=.8;shaper.connect(dry);dry.connect(master);
  // A single linear convolver serves both buses, with independent pre-convolution sends.
  // This is equivalent to summing two convolvers with the same impulse response.
  reverb=ctx.createConvolver();let ir=ctx.createBuffer(2,Math.floor(ctx.sampleRate*4.4),ctx.sampleRate),seed=1977;
  const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return (seed>>>0)/4294967296};
  for(let c=0;c<2;c++){let a=ir.getChannelData(c),smooth=0;for(let i=0;i<a.length;i++){smooth=smooth*.58+(rand()*2-1)*.42;let t=i/ctx.sampleRate;a[i]=smooth*Math.exp(-t*1.55)*Math.min(1,t*35);if(i%Math.floor(ctx.sampleRate*.113)===0)a[i]+=.12*Math.exp(-t)}}
  reverb.buffer=ir;revGain=ctx.createGain();shaper.connect(revGain);revGain.connect(reverb);reverb.connect(master);
  delay=ctx.createDelay(2);feedback=ctx.createGain();feedback.gain.value=.37;const delayTone=ctx.createBiquadFilter();delayTone.type='lowpass';delayTone.frequency.value=2600;delayGain=ctx.createGain();shaper.connect(delay);delay.connect(delayTone);delayTone.connect(feedback);feedback.connect(delay);delayTone.connect(delayGain);delayGain.connect(master);
  chorusDelay=ctx.createDelay(.1);chorusDelay.delayTime.value=.019;chorusGain=ctx.createGain();chorusLfo=ctx.createOscillator();chorusLfo.frequency.value=.27;chorusDepth=ctx.createGain();chorusDepth.gain.value=.004;chorusLfo.connect(chorusDepth);chorusDepth.connect(chorusDelay.delayTime);chorusLfo.start();shaper.connect(chorusDelay);chorusDelay.connect(chorusGain);chorusGain.connect(master);
  drumBus=ctx.createGain();drumBus.gain.value=drumVolume*.58;drumBus.connect(master);drumTone=ctx.createBiquadFilter();drumTone.type='lowpass';drumTone.Q.value=.5;node.connect(drumTone,1,0);drumTone.connect(drumBus);drumRoomGain=ctx.createGain();drumBus.connect(drumRoomGain);drumRoomGain.connect(reverb);
  limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-8;limiter.knee.value=5;limiter.ratio.value=12;limiter.attack.value=.003;limiter.release.value=.2;master.connect(limiter);
  analyser=ctx.createAnalyser();analyser.fftSize=8192;analyser.smoothingTimeConstant=.75;limiter.connect(analyser);analyser.connect(ctx.destination);
  await prepareDrumKit();applyDrumMix();await setupRecorder();engineReady=true;node.port.postMessage({type:'bend',value:bend});node.port.postMessage({type:'mod',value:mod});node.port.postMessage({type:'tune',value:drumTuning});applyFX();
  $('audioStart').innerHTML='<span class="led on" id="audioLed"></span>Звук включён';$('audioStart').classList.add('active');$('latencyStatus').textContent=Math.round((ctx.baseLatency||.01)*1000)+' ms base · '+Math.round(ctx.sampleRate/1000)+' kHz';toast('Студия включена · играйте или запустите секвенсоры');return true;
 }catch(e){console.error(e);toast('Не удалось включить звук: '+e.message);$('audioStart').textContent='Повторить включение';return false}finally{startPromise=null}})();return startPromise;
}
// file:// fallback: same score clock and kernel, four channels split into two stereo buses.
function makeFallback(wasmModule){
 let fallbackPort={onmessage:null,postMessage:m=>processor.message(m)},clock=0;
 const Base=class{constructor(){this.port={postMessage:m=>fallbackPort.onmessage?.({data:m})}}};
 const Processor=createPDProcessor(Base,ctx.sampleRate,()=>clock),processor=new Processor({processorOptions:{wasmModule}}),sp=ctx.createScriptProcessor(2048,0,4),split=ctx.createChannelSplitter(4),buses=[ctx.createChannelMerger(2),ctx.createChannelMerger(2)];
 for(let i=0;i<4;i++)split.connect(buses[i>>1],i,i%2);sp.connect(split);
 sp.onaudioprocess=e=>{clock=e.playbackTime;processor.process([],[[e.outputBuffer.getChannelData(0),e.outputBuffer.getChannelData(1)],[e.outputBuffer.getChannelData(2),e.outputBuffer.getChannelData(3)]])};
 return {port:fallbackPort,connect:(destination,output=0,input=0)=>buses[output].connect(destination,0,input)};
}
function applyFX(){if(!master)return;let now=ctx.currentTime;filter.frequency.setTargetAtTime(400+Math.pow(patch.brightness,2)*14500,now,.035);revGain.gain.setTargetAtTime(patch.reverb*.8,now,.06);delayGain.gain.setTargetAtTime(patch.delay*.65,now,.05);delay.delayTime.setTargetAtTime(patch.delayTime,now,.08);chorusGain.gain.setTargetAtTime(patch.chorus*.42,now,.05);master.gain.setTargetAtTime(powered?masterVolume:0,now,.025);dry.gain.setTargetAtTime(.8+patch.drive*.3,now,.035)}
function noteOn(n,vel=velocity,id='live'+(++uid),time,seq=false){if(!node||!powered)return id;n=clamp(n+transpose,0,127);node.port.postMessage({type:'on',note:n,velocity:vel,id,time:time??ctx.currentTime,seq});if(!seq)liveNotes.set(id,{note:n,released:false});return id}
function noteOff(id,time,force=false){if(!node)return;if(sustain&&!force&&liveNotes.has(id)){liveNotes.get(id).released=true;return}node.port.postMessage({type:'off',id,time:time??ctx.currentTime,seq:typeof id==='string'&&id.startsWith('sq')});liveNotes.delete(id)}
function releaseAll(){for(let id of liveNotes.keys())noteOff(id,undefined,true);heldKeys.clear();pointerKeys.clear();document.querySelectorAll('.key.down').forEach(k=>k.classList.remove('down'))}
function panic(){stopTransport();releaseAll();node?.port.postMessage({type:'panic'});if(master){master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(0,ctx.currentTime,.005);setTimeout(()=>{if(powered)master.gain.setTargetAtTime(masterVolume,ctx.currentTime,.02)},160)}toast('Все ноты остановлены')}
function setSustain(v){sustain=v;$('sustainBtn').classList.toggle('active',v);if(!v)for(let [id,n] of [...liveNotes])if(n.released)noteOff(id,undefined,true)}
