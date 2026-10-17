/* CPU microbenchmark, not a browser/device latency certification.
 * The v3 fixture is the exact replaced processor, using the same PD tables.
 * Usage: node tests/audio-benchmark.cjs [report.json]
 */
const {A,fs,path,assert,performance}=require('./harness.cjs');
let clock=0,Legacy;
const Base=class{constructor(){this.port={postMessage(){}}}};
const old=fs.readFileSync(path.join(__dirname,'fixtures/v3-processor.txt'),'utf8');
new Function('AudioWorkletProcessor','registerProcessor','sampleRate','getTime',old.replace(/\bcurrentTime\b/g,'getTime()'))(Base,(_,C)=>Legacy=C,48000,()=>clock);
let Current;new Function('AudioWorkletProcessor','registerProcessor','sampleRate','getTime',A.processorSource.replace(/\bcurrentTime\b/g,'getTime()'))(Base,(_,C)=>Current=C,48000,()=>clock);
const modulePD=new WebAssembly.Module(Buffer.from(A.pdKernelBase64,'base64'));
(async()=>{const tables=await A.buildTables(),results=[];
 for(let backend of ['v3','v4-js','v4-wasm'])for(let voices of [16,32,64]){
  const e=backend==='v3'?new Legacy():new Current({processorOptions:{wasmModule:backend==='v4-wasm'?modulePD:null}});
  e.message({type:'tables',tables});e.message({type:'patch',patch:A.patches[0]});e.message({type:'poly',value:voices});
  for(let i=0;i<voices;i++)e.message({type:'on',note:40+i%36,velocity:.8,id:i,time:0});
  const out=[[new Float32Array(128),new Float32Array(128)],[new Float32Array(128),new Float32Array(128)]],times=[];
  for(let i=0;i<2700;i++){clock=i*128/48000;const before=performance.now();e.process([],out);const duration=performance.now()-before;if(i>=700)times.push(duration)}
  times.sort((a,b)=>a-b);const average=times.reduce((s,n)=>s+n,0)/times.length;
  results.push({backend,voices,averageMs:average,p95Ms:times[Math.floor(times.length*.95)],p99Ms:times[Math.floor(times.length*.99)],maxMs:times.at(-1),quantumMs:128/48});
 }
 const report={runtime:process.version,sampleRate:48000,blockFrames:128,patch:A.patches[0].name,warmupBlocks:700,measuredBlocks:2000,results};
 if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2)+'\n');
 console.table(results.map(r=>({backend:r.backend,voices:r.voices,average_ms:+r.averageMs.toFixed(3),p95_ms:+r.p95Ms.toFixed(3),p99_ms:+r.p99Ms.toFixed(3),max_ms:+r.maxMs.toFixed(3)})));
 // No machine-specific time threshold: correctness tests are separate.
 assert(results.every(r=>Number.isFinite(r.averageMs)&&r.averageMs>0));
})().catch(e=>{console.error(e);process.exitCode=1});
