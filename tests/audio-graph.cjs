/* API integration test; native filters/convolution and actual device deadlines
 * still require a real browser. The production worklet code runs here. */
const {A,C,vm,assert}=require('./harness.cjs');
const nodes=[];let context;
class Param{constructor(v=0){this.value=v}setValueAtTime(v){this.value=v}setTargetAtTime(v){this.value=v}cancelScheduledValues(){}}
class Node{constructor(type,outputs=1){this.type=type;this.outputs=outputs;this.connections=[];for(let key of ['gain','frequency','Q','delayTime','threshold','knee','ratio','attack','release'])this[key]=new Param();nodes.push(this)}connect(to,output=0,input=0){assert(to);assert(output<this.outputs);this.connections.push({to,output,input});return to}start(){}disconnect(){}}
class Context{constructor(options){assert.equal(options.sampleRate,48000);this.sampleRate=48000;this.baseLatency=.01;this.currentTime=0;this.state='running';this.destination=new Node('destination');this.audioWorklet={addModule:async()=>{}};context=this}async resume(){this.state='running'}createBiquadFilter(){return new Node('filter')}createWaveShaper(){return new Node('shaper')}createGain(){return new Node('gain')}createDelay(){return new Node('delay')}createConvolver(){return new Node('convolver')}createOscillator(){return new Node('oscillator')}createDynamicsCompressor(){return new Node('compressor')}createAnalyser(){let n=new Node('analyser');n.getFloatTimeDomainData=a=>a.fill(0);return n}createBuffer(channels,length,sampleRate){const data=Array.from({length:channels},()=>new Float32Array(length));return {getChannelData:i=>data[i],duration:length/sampleRate}}}
class Worklet extends Node{
 constructor(ctx,name,options){super(name,options.numberOfOutputs);this.options=options;this.port={onmessage:null,postMessage:(message,transfer=[])=>this.processor.message?this.processor.message(structuredClone(message,{transfer})):this.processor.port.onmessage({data:structuredClone(message,{transfer})})};
  const self=this,Base=class{constructor(){this.port={postMessage:m=>self.port.onmessage?.({data:structuredClone(m)})}}};
  if(name==='cz-pd-engine')this.processor=new (A.createPDProcessor(Base,ctx.sampleRate,()=>ctx.currentTime))(options);
  else{let Processor;new Function('AudioWorkletProcessor','registerProcessor',A.pcmProcessorSource)(Base,(_,C)=>Processor=C);this.processor=new Processor()}
 }
}
C.window.AudioContext=Context;C.AudioWorkletNode=Worklet;C.WebAssembly=WebAssembly;C.URL={createObjectURL:()=> 'blob:test',revokeObjectURL(){}};
(async()=>{
 assert(await vm.runInContext('startAudio()',C));const synth=nodes.find(n=>n.type==='cz-pd-engine');
 assert(synth.processor.wasm);assert.deepEqual(synth.options.outputChannelCount,[2,2]);assert.equal(nodes.filter(n=>n.type==='convolver').length,1);assert.equal(nodes.filter(n=>n.type==='oscillator').length,1);
 // The drive keeps its original tanh transfer but handles dense-chord peaks
 // beyond +/-1 without the old flat, clipped table boundary.
 const curve=nodes.find(n=>n.type==='shaper').curve;
 const shaped=x=>{const position=(x*.125+1)*.5*(curve.length-1),i=Math.floor(position),f=position-i;return curve[i]+(curve[Math.min(curve.length-1,i+1)]-curve[i])*f};
 for(let x=-7;x<=7;x+=.025)assert(Math.abs(shaped(x)-Math.tanh(x*1.2))<1e-6);
 assert(shaped(1.5)>shaped(1.01));
 assert(synth.connections.some(c=>c.output===0));assert(synth.connections.some(c=>c.output===1));
 const licensed=A.seqPatches.findIndex(p=>p.provenance==='licensed');A.loadSeq(licensed);await vm.runInContext('toggleAll()',C);assert(synth.processor.transport);
 await vm.runInContext('toggleRecord()',C);assert(vm.runInContext('take.credits.size>0',C),'recording started mid-score loses attribution');
 const capture=nodes.find(n=>n.type==='pcm-capture'),out=[[new Float32Array(128),new Float32Array(128)],[new Float32Array(128),new Float32Array(128)]];
 let energy=0;for(let i=0;i<600;i++){context.currentTime=i*128/48000;synth.processor.process([],out);for(let x of out[0][0])energy+=x*x;capture.processor.process([[out[0][0],out[0][1]]],[])}
 assert(energy>0);await vm.runInContext('toggleRecord()',C);assert(vm.runInContext('take.frames===76800&&!take.busy&&!take.active',C));assert(vm.runInContext('take.url!==null',C));
 A.stopTransport();renderTail();assert(!synth.processor.transport);console.log('Audio initialization: WASM, two stereo buses, one shared convolver, actual score + PCM start/stop/flush and credits: OK.');
 function renderTail(){for(let i=0;i<100;i++){context.currentTime+=128/48000;synth.processor.process([],out)}}
})().catch(e=>{console.error(e);process.exitCode=1});
