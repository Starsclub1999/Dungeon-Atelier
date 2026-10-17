/* Real-time processor. All voice/envelope/heap storage is allocated before use.
 * The score clock lives here, beside synthesis, independent of the page timer.
 * This factory also supplies the compatible local-file implementation and tests.
 */
function createPDProcessor(Base, sampleRate, getTime) {
 const TABLE_FLOATS=8*13*8*1024,PARAM_BYTES=TABLE_FLOATS*4,LEFT=PARAM_BYTES+256,RIGHT=LEFT+8192,MAX_BLOCK=2048;
 const cuts=[400,200,100,50,25,12,6,3],CONTROL=128,POOL=128,patternKinds=['seq','drum'],drumPans=[-.08,.12,-.22,.2,.28,-.2];
 function definition(d){return {s:d.s,t:d.p.map(p=>Math.max(1,Math.ceil(p[0]*sampleRate))),v:d.p.map(p=>p[1])}}
 class Envelope {
  constructor(){this.value=0;this.left=Infinity;this.delta=0;this.done=true;this.released=false;this.stage=0;this.def=null}
  begin(d){this.def=d;this.value=0;this.stage=0;this.released=false;this.done=false;this.segment()}
  segment(){if(this.stage>7){this.done=true;this.left=Infinity;this.delta=0;return}if(!this.released&&this.stage>this.def.s){this.left=Infinity;this.delta=0;return}this.left=this.def.t[this.stage];this.target=this.def.v[this.stage];this.delta=(this.target-this.value)/this.left}
  advance(n){this.value+=this.delta*n;this.left-=n;if(this.left<=0){this.value=this.target;this.stage++;this.segment()}}
  release(){if(this.released||this.done)return;this.released=true;this.stage=this.def.s+1;this.segment()}
 }
 const makeVoice=()=>({active:false,id:null,note:0,vel:0,seq:false,released:false,killed:false,age:0,fade:0,fadeDelta:0,panL:0,panR:0,seed:1,lastL:0,lastR:0,patch:null,lines:[0,1].map(()=>({a:new Envelope(),d:new Envelope(),p:new Envelope(),phase:0,freq:0,step:0,band:0}))});
 return class PDEngine extends Base {
  constructor(options={}){
   super();this.pool=Array.from({length:POOL},makeVoice);this.activeCount=0;this.age=0;this.patch=null;this.spec=null;this.tables=null;
   this.jobs=new Array(16384);this.jobCount=0;this.limit=32;this.bend=0;this.mod=0;this.counter=0;this.transport=null;this.kit=null;this.tuning=1;
   this.drumPool=Array.from({length:64},()=>({active:false,pos:0,step:1,velocity:0,panL:0,panR:0,buffer:null,fade:1,fadeDelta:0,age:0}));
   this.memory=null;this.wasm=null;
   const module=options.processorOptions?.wasmModule;
   if(module)try{this.wasm=new WebAssembly.Instance(module).exports;this.memory=this.wasm.memory.buffer}catch(e){this.wasm=null}
   if(!this.memory)this.memory=new ArrayBuffer(4194304);
   this.P=new Float64Array(this.memory,PARAM_BYTES,24);this.I=new Int32Array(this.memory,PARAM_BYTES+192,9);
   this.outL=new Float32Array(this.memory,LEFT,MAX_BLOCK);this.outR=new Float32Array(this.memory,RIGHT,MAX_BLOCK);
   this.tableMemory=new Float32Array(this.memory,0,TABLE_FLOATS);this.residualL=0;this.residualR=0;this.headroom=1;this.voiceReport={type:'voices',count:0};
   this.keyReport={type:'keys',keys:new Uint8Array(128)};this.keysDirty=false;
   this.port.onmessage=e=>this.message(e.data);
  }
  get voices(){return this.pool.filter(v=>v.active)} // diagnostics only, never called by render
  compilePatch(p){return {p,lines:p.lines.map(l=>({a:definition(l.amp),d:definition(l.dcw),p:definition(l.pitch)}))}}
  message(m){
   switch(m.type){
    case 'tables':this.tableMemory.set(m.tables);this.tables=this.tableMemory;break;
    case 'patch':this.changePatch(m.patch);break;
    case 'on':case 'off':case 'drum':this.enqueue(m);break;
    case 'bend':this.bend=m.value;break;
    case 'mod':this.mod=m.value;break;
    case 'poly':this.setVoiceLimit(m.value);break;
    case 'kit':this.kit=m.buffers;break;
    case 'tune':this.tuning=Math.pow(2,m.value/12);break;
    case 'transport':this.cancelSequence();this.transport=m;this.initTransport(m);break;
    case 'cancel':this.cancelSequence();break;
    case 'cancelDrums':this.fadeDrums();break;
    case 'panic':this.jobCount=0;this.transport=null;for(let i=0;i<POOL;i++)if(this.pool[i].active)this.kill(this.pool[i]);this.fadeDrums();break;
   }
  }
  setVoiceLimit(value){
   this.limit=Math.max(4,Math.min(64,value|0));let live=0;for(let i=0;i<POOL;i++)if(this.pool[i].active&&!this.pool[i].killed)live++;
   while(live>this.limit){let victim=null,oldest=Infinity,quiet=Infinity;
    for(let i=0;i<POOL;i++){let v=this.pool[i];if(!v.active||v.killed)continue;let level=Math.max(v.lines[0].a.value,v.lines[1].a.value)*v.vel*v.fade;
     if(v.released){if(level<quiet){quiet=level;victim=v}}else if(quiet===Infinity&&v.age<oldest){oldest=v.age;victim=v}}
    if(!victim)break;this.kill(victim);live--;
   }
  }
  changePatch(p){
   let next=this.compilePatch(p);this.patch=p;this.spec=next;
   // Crossfade old parameters into the new sound. Envelope positions and phases survive.
   for(let i=0;i<POOL;i++){let v=this.pool[i];if(!v.active||v.killed)continue;let tail=null;
    for(let j=0;j<POOL;j++)if(!this.pool[j].active){tail=this.pool[j];break}
    if(tail){tail.active=true;this.activeCount++;for(let key of ['id','note','vel','seq','released','age','fade','fadeDelta','panL','panR','seed','lastL','lastR','patch'])tail[key]=v[key];tail.killed=false;
     for(let j=0;j<2;j++){let from=v.lines[j],to=tail.lines[j];to.phase=from.phase;to.freq=from.freq;to.step=from.step;to.band=from.band;for(let kind of ['a','d','p'])Object.assign(to[kind],from[kind])}this.kill(tail)
    }else{this.residualL+=v.lastL;this.residualR+=v.lastR}
    v.patch=next;v.fade=0;v.fadeDelta=1/(sampleRate*.012);
    for(let j=0;j<2;j++){let l=v.lines[j];l.freq=440*Math.pow(2,(v.note-69+p.lines[j].oct*12+(j?p.detune/100:0))/12);for(let kind of ['a','d','p']){let env=l[kind],def=next.lines[j][kind];if(Number.isFinite(env.left)&&!env.done){env.left=Math.max(1,Math.round(env.left/env.def.t[env.stage]*def.t[env.stage]));env.target=def.v[env.stage];env.delta=(env.target-env.value)/env.left}env.def=def}}
   }
  }
  enqueue(m){if(this.jobCount===this.jobs.length)return;let i=this.jobCount++;while(i>0){let p=(i-1)>>1;if(this.jobs[p].time<=m.time)break;this.jobs[i]=this.jobs[p];i=p}this.jobs[i]=m}
  pop(){const result=this.jobs[0],last=this.jobs[--this.jobCount];this.jobs[this.jobCount]=undefined;if(this.jobCount){let i=0;while(i*2+1<this.jobCount){let c=i*2+1;if(c+1<this.jobCount&&this.jobs[c+1].time<this.jobs[c].time)c++;if(last.time<=this.jobs[c].time)break;this.jobs[i]=this.jobs[c];i=c}this.jobs[i]=last}return result}
  cancelSequence(){this.transport=null;let keep=0;for(let i=0;i<this.jobCount;i++)if(!this.jobs[i].seq)this.jobs[keep++]=this.jobs[i];for(let i=keep;i<this.jobCount;i++)this.jobs[i]=undefined;this.jobCount=keep; // restore heap after stable compaction
   for(let i=(keep>>1)-1;i>=0;i--){let at=i,v=this.jobs[i];while(at*2+1<keep){let c=at*2+1;if(c+1<keep&&this.jobs[c+1].time<this.jobs[c].time)c++;if(v.time<=this.jobs[c].time)break;this.jobs[at]=this.jobs[c];at=c}this.jobs[at]=v}
   for(let i=0;i<POOL;i++)if(this.pool[i].active&&this.pool[i].seq)this.release(this.pool[i]);
  }
  release(v){if(v.released)return;v.released=true;if(v.seq)this.keysDirty=true;for(let n=0;n<2;n++){let l=v.lines[n];l.a.release();l.d.release();l.p.release()}}
  kill(v){if(v.killed)return;v.killed=true;if(v.seq)this.keysDirty=true;v.fadeDelta=-Math.max(.000001,v.fade)/(sampleRate*.012)}
  start(note,velocity,id,seq){
   if(!this.spec||!this.tables)return;let live=0,slot=null,victim=null,oldest=Infinity,quiet=Infinity;
   for(let i=0;i<POOL;i++){let v=this.pool[i];if(!v.active){if(!slot)slot=v;continue}if(v.killed)continue;live++;let level=Math.max(v.lines[0].a.value,v.lines[1].a.value)*v.vel*v.fade;
    if(v.released){if(level<quiet){quiet=level;victim=v}}else if(quiet===Infinity&&v.age<oldest){oldest=v.age;victim=v}}
   if(live>=this.limit&&victim)this.kill(victim);
   if(!slot){let score=Infinity;for(let i=0;i<POOL;i++){let v=this.pool[i],a=Math.max(v.lines[0].a.value,v.lines[1].a.value)*v.fade*v.vel;if(a<score){score=a;slot=v}}this.residualL+=slot.lastL;this.residualR+=slot.lastR}else this.activeCount++;
   let v=slot,p=this.spec.p;v.active=true;v.id=id;v.note=note;v.vel=velocity;v.seq=seq;v.released=false;v.killed=false;v.age=++this.age;v.fade=0;v.fadeDelta=1/(sampleRate*.004);v.patch=this.spec;v.seed=(Math.random()*2147483647)|1;if(seq)this.keysDirty=true;
   let pan=(note%7-3)*.025;v.panL=velocity*.18*(1-pan);v.panR=velocity*.18*(1+pan);v.lastL=v.lastR=0;
   for(let n=0;n<2;n++){let l=v.lines[n],d=this.spec.lines[n];l.a.begin(d.a);l.d.begin(d.d);l.p.begin(d.p);l.phase=Math.random()*.02;l.freq=440*Math.pow(2,(note-69+p.lines[n].oct*12+(n?p.detune/100:0))/12);l.step=0}
  }
  off(id){for(let i=0;i<POOL;i++){let v=this.pool[i];if(v.active&&v.id===id)this.release(v)}}
  startDrum(track,velocity){if(!this.kit?.[track])return;let slot=null,old=null;for(let i=0;i<this.drumPool.length;i++){let v=this.drumPool[i];if(!v.active){slot=v;break}if(!old||v.age<old.age)old=v}let v=slot||old;v.active=true;v.buffer=this.kit[track];v.pos=0;v.step=this.tuning;v.velocity=velocity;v.fade=1;v.fadeDelta=0;v.age=++this.age;let pan=drumPans[track],angle=(pan+1)*Math.PI/4;v.panL=Math.cos(angle)*velocity;v.panR=Math.sin(angle)*velocity}
  fadeDrums(){for(let i=0;i<this.drumPool.length;i++)if(this.drumPool[i].active)this.drumPool[i].fadeDelta=-1/(sampleRate*.012)}
  initTransport(t){t.frame=Math.round(t.time*sampleRate);t.stepFrames=sampleRate*15/t.bpm;t.end=t.loop?Infinity:t.frame+(t.span-t.cursor)*t.stepFrames;t.started=false;
   for(let kind of patternKinds){let len=t[kind+'Length'],events=t[kind+'Events'];t[kind+'Base']=Math.floor(t.cursor/len)*len;t[kind+'Index']=0;while(t[kind+'Index']<events.length&&events[t[kind+'Index']]<t.cursor%len-1e-8)t[kind+'Index']+=5;this.advancePattern(t,kind)}
  }
  advancePattern(t,kind){let events=t[kind+'Events'],i=t[kind+'Index'];if(!events.length){t[kind+'Next']=Infinity;return}if(i>=events.length){i=0;t[kind+'Index']=0;t[kind+'Base']+=t[kind+'Length']}t[kind+'Next']=t.frame+(t[kind+'Base']+events[i]-t.cursor)*t.stepFrames}
  dispatchTransport(frame){let t=this.transport;if(!t||frame<t.frame)return;
   if(!t.started){t.started=true;for(let i=0;i<t.resume.length;i+=3)this.start(t.resume[i],t.resume[i+1],t.resume[i+2],true)}
   if(frame>=Math.ceil(t.end)){this.transport=null;for(let i=0;i<POOL;i++)if(this.pool[i].active&&this.pool[i].seq)this.release(this.pool[i]);this.port.postMessage({type:'ended',run:t.run});return}
   for(let kind of patternKinds){let events=t[kind+'Events'];while(t[kind+'Next']<=frame){let i=t[kind+'Index'];if(kind==='drum')this.startDrum(events[i+2],events[i+3]);else if(events[i+1]===0)this.off(events[i+4]);else this.start(events[i+2],events[i+3],events[i+4],true);t[kind+'Index']+=5;this.advancePattern(t,kind)}}
  }
  wave(w,depth,band,phase){let x=phase*1024,i=x|0,f=x-i,di=Math.max(0,Math.min(12,depth*12)),d=di|0,a=((w*13+d)*8+band)*1024,b=d===12?a:a+8192,j=(i+1)&1023,T=this.tables;let v=T[a+i]+(T[a+j]-T[a+i])*f,z=T[b+i]+(T[b+j]-T[b+i])*f;return v+(z-v)*(di-d)}
  renderJS(offset,count){const p=this.P,q=this.I,L=this.outL,R=this.outR;let ph0=p[0],st0=p[1],ph1=p[8],st1=p[9],a0=p[3],d0=p[5],a1=p[11],d1=p[13],fade=p[16],seed=q[8];
   for(let i=offset,end=i+count;i<end;i++){ph0+=st0;ph0-=Math.floor(ph0);ph1+=st1;ph1-=Math.floor(ph1);st0+=p[2];st1+=p[10];let s0=0,s1=0;
    if(q[6]){s0=this.wave(q[0],d0,q[2],ph0);if(q[1]<8)s0=(s0+this.wave(q[1],d0,q[2],ph0))*.5;s0*=a0*p[7]}
    if(q[7]){s1=this.wave(q[3],d1,q[5],ph1);if(q[4]<8)s1=(s1+this.wave(q[4],d1,q[5],ph1))*.5;s1*=a1*p[15]}
    let x=s0*p[18]+s1*p[19]+s0*s1*p[20];if(p[21]){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;x+=((seed>>>0)/2147483648-1)*p[21]*a0}let gain=x*Math.min(1,Math.max(0,fade));L[i]+=gain*p[22];R[i]+=gain*p[23];a0+=p[4];d0+=p[6];a1+=p[12];d1+=p[14];fade+=p[17]}
   p[0]=ph0;p[8]=ph1;q[8]=seed;
  }
  renderVoice(v,offset,count,frame){const p=v.patch.p,P=this.P,I=this.I;let cursor=0;
   while(cursor<count&&v.active){let n=Math.min(count-cursor,p.pitchDepth?32:128);
    for(let j=0;j<2;j++){let l=v.lines[j];n=Math.min(n,l.a.left,l.d.left,l.p.left)}
    if(v.killed)n=Math.min(n,Math.max(1,Math.ceil(v.fade/-v.fadeDelta)));
    for(let j=0;j<2;j++){let l=v.lines[j],spec=p.lines[j],pitch=l.p.value+l.p.delta,depth=spec.depth,base=j*8;
     let amount=p.vibrato+this.mod*.018,rate=6.28318530718*p.vibRate/sampleRate,vib=1+Math.sin((frame+cursor)*rate)*amount,vibEnd=1+Math.sin((frame+cursor+n)*rate)*amount,factor=p.pitchDepth||this.bend?Math.pow(2,(this.bend+(pitch-.5)*p.pitchDepth)/12):1,endFactor=p.pitchDepth?Math.pow(2,(this.bend+(pitch+l.p.delta*n-.5)*p.pitchDepth)/12):factor,freq=l.freq*factor*vib,step=freq/sampleRate,endStep=l.freq*endFactor*vibEnd/sampleRate,max=1/(Math.max(step,endStep)*2.3),band=0;while(band<7&&cuts[band]>max)band++;
     P[base]=l.phase;P[base+1]=step;P[base+2]=(endStep-step)/n;P[base+3]=l.a.value+l.a.delta;P[base+4]=l.a.delta;P[base+5]=(l.d.value+l.d.delta)*depth;P[base+6]=l.d.delta*depth;P[base+7]=spec.level;
     I[j*3]=spec.wave;I[j*3+1]=spec.wave2<0||spec.wave2===spec.wave?8:spec.wave2;I[j*3+2]=band;
    }
    P[16]=v.fade+v.fadeDelta;P[17]=v.fadeDelta;P[18]=(p.mode===0?1:p.mode===2?.65:0)*(1-p.ring);P[19]=(p.mode===1?1:p.mode===2?.65:0)*(1-p.ring);P[20]=(p.mode===3?1.5:0)*(1-p.ring)+2*p.ring;P[21]=p.noise;P[22]=v.panL;P[23]=v.panR;
    I[6]=P[18]!==0||P[20]!==0?1:0;I[7]=P[19]!==0||P[20]!==0?1:0;I[8]=v.seed;
    let end=offset+cursor+n-1,beforeL=this.outL[end],beforeR=this.outR[end];
    if(this.wasm)this.wasm.render(offset+cursor,n);else this.renderJS(offset+cursor,n);
    v.lastL=this.outL[end]-beforeL;v.lastR=this.outR[end]-beforeR;v.seed=I[8];v.fade=Math.min(1,v.fade+v.fadeDelta*n);if(!v.killed&&v.fade>=1)v.fadeDelta=0;
    for(let j=0;j<2;j++){let l=v.lines[j];l.phase=P[j*8];l.a.advance(n);l.d.advance(n);l.p.advance(n)}cursor+=n;
    let a=v.lines[0].a,b=v.lines[1].a;if(v.killed&&v.fade<=.000001||v.released&&(a.done||a.released&&a.stage>6&&a.value<.00005)&&(b.done||b.released&&b.stage>6&&b.value<.00005)){v.active=false;this.activeCount--;}
   }
  }
  renderDrums(L,R,offset,count){if(!L)return;for(let j=0;j<this.drumPool.length;j++){let v=this.drumPool[j];if(!v.active)continue;let buffer=v.buffer,pos=v.pos,fade=v.fade;for(let i=offset,end=offset+count;i<end;i++){let k=pos|0;if(k>=buffer.length-1||fade<=0){v.active=false;break}let x=(buffer[k]+(buffer[k+1]-buffer[k])*(pos-k))*fade;L[i]+=x*v.panL;R[i]+=x*v.panR;pos+=v.step;fade+=v.fadeDelta}v.pos=pos;v.fade=fade}}
  process(inputs,outputs){let L=outputs[0][0],R=outputs[0][1]||L,drL=outputs[1]?.[0],drR=outputs[1]?.[1]||drL,length=L.length;
   this.outL.fill(0,0,length);this.outR.fill(0,0,length);if(drL){drL.fill(0);drR.fill(0)}let offset=0,frame=Math.round(getTime()*sampleRate);
   while(offset<length){while(this.jobCount&&Math.ceil(this.jobs[0].time*sampleRate)<=frame){let m=this.pop();if(m.type==='on')this.start(m.note,m.velocity,m.id,m.seq);else if(m.type==='drum')this.startDrum(m.track,m.velocity);else this.off(m.id)}this.dispatchTransport(frame);
    let boundary=Math.min(frame+length-offset,frame+(CONTROL-frame%CONTROL));if(this.jobCount)boundary=Math.min(boundary,Math.ceil(this.jobs[0].time*sampleRate));let t=this.transport;if(t)boundary=Math.min(boundary,Math.ceil(t.started?Math.min(t.seqNext,t.drumNext,t.end):t.frame));let n=Math.max(1,boundary-frame);
    for(let j=0;j<POOL;j++)if(this.pool[j].active)this.renderVoice(this.pool[j],offset,n,frame);
    this.renderDrums(drL,drR,offset,n);offset+=n;frame+=n;
   }
   // Slow gain recovery keeps long releases stable; fast attenuation leaves room for dense chords.
   let energy=0;for(let i=0;i<POOL;i++){let v=this.pool[i];if(v.active){let a=v.lines[0].a.value,b=v.lines[1].a.value;energy+=v.vel*v.vel*v.fade*v.fade*Math.max(a*a,b*b)}}
   let target=this.activeCount>12?Math.min(1,Math.sqrt(4/Math.max(4,energy))):1,coefficient=1-Math.exp(-1/(sampleRate*(target<this.headroom?.008:.2)));
   for(let i=0;i<length;i++){this.headroom+=(target-this.headroom)*coefficient;this.residualL*=.994;this.residualR*=.994;L[i]=(this.outL[i]+this.residualL)*this.headroom;R[i]=(this.outR[i]+this.residualR)*this.headroom}
   if(this.keysDirty){this.keyReport.keys.fill(0);for(let i=0;i<POOL;i++){let v=this.pool[i];if(v.active&&v.seq&&!v.released&&!v.killed)this.keyReport.keys[v.note]=1}this.port.postMessage(this.keyReport);this.keysDirty=false}
   if(++this.counter%16===0){this.voiceReport.count=this.activeCount;this.port.postMessage(this.voiceReport)}return true;
  }
 };
}
