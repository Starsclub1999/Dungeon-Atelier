/* Exercises the production processor and WebAssembly binary. No browser audio
 * graph is mocked into this test: it measures the DSP/transport, not hardware. */
const {A,C,vm,assert,performance}=require('./harness.cjs');
let clock=0;
const received=[];
const Base=class{constructor(){this.port={postMessage:m=>{if(m.type==='ended')received.push({...m})}}}};
let Processor;new Function('AudioWorkletProcessor','registerProcessor','sampleRate','getTime',A.processorSource.replace(/\bcurrentTime\b/g,'getTime()'))(Base,(_,C)=>Processor=C,48000,()=>clock);
const wasmModule=new WebAssembly.Module(Buffer.from(A.pdKernelBase64,'base64'));
const output=()=>[[new Float32Array(128),new Float32Array(128)],[new Float32Array(128),new Float32Array(128)]];
function render(e,out,frames,from=0,check){for(let i=0;i<frames;i+=128){clock=(from+i)/48000;e.process([],out);if(check)check(out,i)}}
function kit(){return A.drumKits[0]}
(async()=>{
 const tables=await A.buildTables(),buffers=Array.from({length:6},(_,i)=>A.renderPercussion(kit(),i,48000));
 function engine(wasm=true){const e=new Processor({processorOptions:{wasmModule:wasm?wasmModule:null}});e.message({type:'tables',tables});e.message({type:'patch',patch:A.patches[0]});e.message({type:'poly',value:64});e.message({type:'kit',buffers});return e}
 // Both implementations must agree, including all 8 wave types, ring, noise,
 // octave changes, pitch envelopes, interpolation and envelope stage boundaries.
 let a=engine(false),b=engine(),left=output(),right=output(),seed=1701,originalRandom=Math.random;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return (seed>>>0)/4294967296};
 let maxError=0;
 try{Math.random=random;for(let k=0;k<8;k++){
  const patch=JSON.parse(JSON.stringify(A.patches[k]));patch.lines[0].wave=k;patch.lines[0].wave2=(k+2)%8;patch.lines[1].wave=(k+4)%8;patch.noise=.07;patch.ring=.3;patch.pitchDepth=24;
  for(let e of [a,b])e.message({type:'patch',patch});
  let start=clock;seed=1701+k;a.start(48+k,.7,k,false);seed=1701+k;b.start(48+k,.7,k,false);
  for(let j=0;j<500;j++){clock=start+j*128/48000;a.process([],left);b.process([],right);for(let channel=0;channel<2;channel++)for(let i=0;i<128;i++)maxError=Math.max(maxError,Math.abs(left[0][channel][i]-right[0][channel][i]));if(j===300){a.off(k);b.off(k)}}
 }}finally{Math.random=originalRandom}
 assert(maxError<2e-6,'WASM / JS mismatch '+maxError);console.log('WASM / JS equivalence across waveforms, modulation and live patch crossfades:',maxError);
 // A held 64-note chord must not run out of voices, drop to silence, or grow memory.
 let dense=engine(),out=output(),memory=dense.memory,pool=dense.pool;
 for(let i=0;i<64;i++)dense.message({type:'on',note:36+i%48,velocity:.7,id:'live'+i,time:0});
 let minEnergy=Infinity,peak=0,maxVoices=0;
 render(dense,out,48000*12,0,(audio,i)=>{let energy=0;for(let x of audio[0][0]){assert(Number.isFinite(x));energy+=x*x;peak=Math.max(peak,Math.abs(x))}if(i>48000*2)minEnergy=Math.min(minEnergy,energy);maxVoices=Math.max(maxVoices,dense.activeCount)});
 assert(minEnergy>1e-6);assert.equal(maxVoices,64);assert.strictEqual(dense.memory,memory);assert.strictEqual(dense.pool,pool);assert.equal(memory.byteLength,4194304);
 dense.message({type:'panic'});render(dense,out,48000,48000*12);assert.equal(dense.activeCount,0);
 console.log('64 held voices for 12s: no silent blocks, fixed 4 MiB kernel memory, clean panic. Peak:',peak.toFixed(3));
 // Many off events far in the future must not hide an earlier live note in the heap.
 let heap=engine();for(let i=0;i<3000;i++)heap.message({type:'off',id:'future'+i,time:10+i*.001,seq:true});heap.message({type:'on',note:60,velocity:.8,id:'manual',time:0,seq:false});
 render(heap,out,256);assert(heap.pool.some(v=>v.active&&v.id==='manual'));heap.message({type:'cancel'});assert.equal(heap.jobCount,0);assert(heap.pool.some(v=>v.active&&v.id==='manual'&&!v.released));
 // Voice stealing and rapid timbre edits keep the fixed pool bounded, and all notes release.
 for(let i=0;i<120;i++){clock=i*.015;for(let n=0;n<10;n++)heap.message({type:'on',note:36+(i+n)%60,velocity:.65,id:'churn'+i+'_'+n,time:clock,seq:true});if(i%3===0)heap.message({type:'patch',patch:A.patches[i%A.patches.length]});render(heap,out,720,Math.round(clock*48000));assert(heap.activeCount<=128)}
 heap.message({type:'panic'});render(heap,out,48000,48000*3);assert.equal(heap.activeCount,0);
 console.log('Future-event heap, cancel/live separation, 1,200-note churn and patch switching: OK.');
 // Render a complete licensed MIDI with drums after ONE message. This deliberately
 // provides no subsequent page timer, scheduler, heartbeat or main-thread refill.
 const songs=A.seqPatches.filter(p=>p.provenance==='licensed').map(p=>({p,score:A.prepareScore(p)})).sort((x,y)=>y.score.notes.length-x.score.notes.length);
 let chosen=songs[0],score=chosen.score,drums=Array.from({length:6},()=>Array(score.length).fill(0));
 for(let tr=0;tr<6;tr++)for(let hit of score.drums[tr])drums[tr][hit.s]=Math.max(drums[tr][hit.s],hit.v);
 A.setScoreFixture({...score,drums,bpm:chosen.p.bpm});let message=A.packAudioTransport(.02),expected=message.seqEvents.length/10,expectedDrums=message.drumEvents.length/5,e=engine();
 let onCount=0,drumCount=0,start=e.start.bind(e),drum=e.startDrum.bind(e);e.start=(...args)=>{if(args[3])onCount++;start(...args)};e.startDrum=(...args)=>{drumCount++;drum(...args)};
 e.message(message);let frames=Math.ceil((message.span*15/message.bpm+.1)*48000),started=performance.now();
 render(e,out,frames,0,audio=>{for(let bus of audio)for(let channel of bus)for(let x of channel)assert(Number.isFinite(x))});
 assert.equal(onCount,expected);assert.equal(drumCount,expectedDrums);assert(received.some(m=>m.run===message.run));assert.equal(e.transport,null);
 console.log('Complete score without page scheduling:',chosen.p.name,'—',onCount,'notes,',drumCount,'drum hits,',(frames/48000).toFixed(1)+'s; rendered in',((performance.now()-started)/1000).toFixed(2)+'s.');
 // Unequal loop lengths, swung fractional notes, resume and a one-shot ending.
 A.setScoreFixture({notes:[{s:.25,n:60,l:7.75,v:.7},{s:12,n:67,l:3.75,v:.5}],length:16,drums:Array.from({length:6},()=>Array(32).fill(0)),bpm:120});
 vm.runInContext('drumLength=32;drumLoop={start:0,end:32};drums[0][0]=1;drums[1][17]=.8;swing=.2;transportCursor=4;loopOn=true',C);
 let loop=A.packAudioTransport(0),looper=engine(),events=[];start=looper.start.bind(looper);looper.start=(note,vel,id,seq)=>{events.push({note,frame:Math.round(clock*48000)});start(note,vel,id,seq)};looper.message(loop);
 render(looper,out,48000*9);assert(events.some(m=>m.note===60));assert(events.filter(m=>m.note===67).length>=4);assert(looper.transport);looper.message({type:'cancel'});assert.equal(looper.transport,null);
 console.log('Independent loop lengths, fractional timing, swing, seek/resume: OK.');
})().catch(error=>{console.error(error);process.exitCode=1});
