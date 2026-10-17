const {A,C,els,D,vm,assert,fs,path,root,html}=require('./harness.cjs');
const run=s=>vm.runInContext(s,C),flatten=el=>[el.textContent||'',...(el.children||[]).map(flatten)].join(' ');
(async()=>{
 // Voice demand includes released DCA voices, not reverb, and counts note-off before note-on at a tie.
 const short=JSON.parse(JSON.stringify(A.patches.find(p=>p.cat==='Bass')));for(const line of short.lines)for(let i=4;i<8;i++)line.amp.p[i][0]=.001;
 const score=[{s:0,n:48,l:1,v:.7},{s:1.1,n:52,l:1,v:.7}];C.voiceFixture={short,score};
 assert.equal(run('scoreVoiceDemand(voiceFixture.score,voiceFixture.short,60)'),1);run('voiceFixture.short.lines.forEach(l=>l.amp.p.slice(4).forEach(pt=>pt[0]=.25))');assert.equal(run('scoreVoiceDemand(voiceFixture.score,voiceFixture.short,60)'),2);
 run('patch=clone(voiceFixture.short);notes=[{s:0,n:48,l:2,v:.7}];seqPatchIndex=0;polyphonyAuto=true;applyPresetPolyphony()');assert.equal(run('polyphony'),4);
 run('notes=Array.from({length:40},(_,i)=>({s:0,n:36+i,l:8,v:.7}));applyPresetPolyphony()');assert.equal(run('polyphony'),64);assert.equal(els.polyphony.value,64);
 run('setPolyphony(8,{manual:true});selectPatch(0);loadSeq(0)');assert.equal(run('polyphony'),8);assert.equal(run('polyphonyAuto'),false);
 run("download=(data)=>{globalThis.savedSession=JSON.parse(data)};exportSession()");assert.equal(C.savedSession.polyphonyAuto,false);assert.equal(C.savedSession.polyphony,8);
 await run('async f=>importSession(f)')({size:20000,text:async()=>JSON.stringify(C.savedSession)});assert.equal(run('polyphony'),8);assert.equal(run('polyphonyAuto'),false);
 run('polyphonyAuto=true;applyPresetPolyphony()');assert(run('voiceBudgets.includes(polyphony)'));console.log('AUTO accounts for score + release, scales up and down; manual mode and session round trip: OK.');
 // Both language editions have the same real chapter/page topology and resolved live-bank counts.
 const content=run('helpBookContent');assert.equal(content.ru.length,12);assert.deepEqual(Array.from(content.ru,c=>c.id),Array.from(content.en,c=>c.id));
 for(const lang of ['ru','en'])for(const chapter of content[lang]){assert(chapter.pages.length>=2&&chapter.pages.length%2===0);for(const page of chapter.pages){const text=[page.heading,...page.paragraphs,...page.bullets].join(' ');assert(!/<\/?\w/.test(text));if(lang==='en')assert(!/[А-Яа-яЁё]/.test(text),page.heading)}}
 C.document.documentElement={lang:'ru'};run("startup.visible=true;startup.stage='description';language='ru';openHelpBook(true)");assert.equal(run('helpBook.open'),true);assert.equal(els.studioMain.inert,true);assert.equal(els.startup.inert,true);
 run('selectBookChapter(8)');const ru=flatten(els.bookLeft);assert(/[А-Яа-яЁё]/.test(ru));run("setLanguage('en')");assert.equal(run('helpBook.chapter'),8);const en=flatten(els.bookLeft);assert(!/[А-Яа-яЁё]/.test(en));assert.notEqual(ru,en);assert(!en.includes('{{'));
 run('turnBook(1)');assert.equal(run('helpBook.chapter'),9);run('turnBook(-1)');assert.equal(run('helpBook.chapter'),8);run('closeHelpBook()');assert.equal(els.studioMain.inert,true);assert.equal(els.startup.inert,false);assert.equal(run('startup.stage'),'description');
 run('startup.visible=false;openHelpBook();closeHelpBook()');assert.equal(els.studioMain.inert,false);assert.equal(els.recordResult.inert,false);console.log('12 bilingual chapters / 24 pages, bookmarks, page turns, language retention and intro return: OK.');
 // Actual opening/menu functions now use larger music envelopes without touching studio routing.
 run('globalThis.tones=[];deviceAudio={currentTime:0};deviceSounds=true;deviceTone=(...args)=>{tones.push(args);return null};playOpeningMusic()');assert.equal(C.tones.length,9);assert(C.tones.every(t=>t[3]>=.07&&t[3]<=.08));assert(C.tones.some(t=>t[5]>=1&&t[6]>=1));run('tones=[];startMenuMusic()');assert.equal(C.tones[0][3],.055);run('stopMenuMusic()');
 // The five-second clock begins only from START. No logo/background shortcut or skip UI remains.
 let now=0,id=0;const originalTimers={setTimeout:C.setTimeout,clearTimeout:C.clearTimeout},timers=new Map(),listeners=[];C.setTimeout=(fn,ms)=>{timers.set(++id,{fn,at:now+ms});return id};C.clearTimeout=id=>timers.delete(id);C.window.addEventListener=(name,fn)=>listeners.push({name,fn});
 const advance=ms=>{now+=ms;for(const [id,t]of [...timers])if(t.at<=now){timers.delete(id);t.fn()}};
 run('globalThis.openingCalls=0;globalThis.menuCalls=0;startDeviceAudio=async()=>null;playOpeningMusic=()=>openingCalls++;startMenuMusic=()=>menuCalls++;stopMenuMusic=()=>{};startup.stage="ready";startup.visible=true;startup.busy=false;setupStartup()');
 assert.equal(els.introReady.hidden,false);assert.equal(els.introLogoWrap.hidden,true);assert.equal(els.introBegin.textContent,'START');assert.equal(els.introLogo.onclick,undefined);assert(!html.includes('id="introSkip"'));assert(!html.includes('id="introPrompt"'));
 const handler=listeners.find(l=>l.name==='keydown').fn;handler({key:'a'});assert.equal(run('startup.stage'),'ready');await els.introBegin.onclick();assert.equal(run('startup.stage'),'logo');assert.equal(C.openingCalls,1);assert.equal(els.introReady.hidden,true);assert.equal(els.introLanguage.hidden,true);assert.equal(els.introAbout.hidden,true);assert.equal(els.introSound.hidden,true);assert.equal(els.introLogoWrap.hidden,false);
 advance(4999);assert.equal(run('startup.stage'),'logo');advance(1);assert.equal(run('startup.stage'),'language');assert.equal(C.menuCalls,1);run("chooseStartupLanguage('en')");assert.equal(els.introEnter.textContent,'ENTER THE DUNGEON');assert.equal(els.introHelpLabel.textContent,'HELP BOOK');await els.introHelp.onclick();assert.equal(run('helpBook.open'),true);run('closeHelpBook();closeStartup();showStartup()');advance(1000);assert.equal(els.startup.hidden,false);assert.equal(run('startup.stage'),'ready');assert.equal(C.openingCalls,1);
 console.log('Only START activates logo, exactly 5 seconds → language → translated Help / Enter; replay race: OK.');
 C.setTimeout=originalTimers.setTimeout;C.clearTimeout=originalTimers.clearTimeout;
 // Reducing an active voice budget fades excess voices even if no new notes arrive.
 let clock=0,Processor;const reports=[],Base=class{constructor(){this.port={postMessage:m=>reports.push(structuredClone(m))}}};new Function('AudioWorkletProcessor','registerProcessor','sampleRate','getTime',A.processorSource.replace(/\bcurrentTime\b/g,'getTime()'))(Base,(_,P)=>Processor=P,48000,()=>clock);
 const engine=new Processor({processorOptions:{wasmModule:new WebAssembly.Module(Buffer.from(A.pdKernelBase64,'base64'))}});engine.message({type:'tables',tables:await A.buildTables()});engine.message({type:'patch',patch:A.patches[0]});engine.message({type:'poly',value:64});for(let i=0;i<64;i++)engine.start(36+i,.65,i,true);
 const outputs=[[new Float32Array(128),new Float32Array(128)]];for(let block=0;block<400;block++){clock=block*128/48000;engine.process([],outputs)}assert.equal(engine.voices.filter(v=>!v.killed).length,64);engine.message({type:'poly',value:4});assert.equal(engine.voices.filter(v=>!v.killed).length,4);
 let energy=0;for(let block=400;block<440;block++){clock=block*128/48000;engine.process([],outputs);for(const sample of outputs[0][0]){assert(Number.isFinite(sample));energy+=sample*sample}}assert.equal(engine.voices.length,4);assert(energy>0);assert.equal(engine.memory.byteLength,4194304);
 console.log('64 → 4 held voices: smooth retirement completes without new note-on, finite audible WASM output: OK.');
 const css=fs.readFileSync(path.join(root,'css/studio-v51.css'),'utf8');assert(html.indexOf('id="helpOpen"')<html.indexOf('id="audioStart"'));assert(html.indexOf('id="polyphony"')<html.indexOf('id="settingsModal"'));
 function luminance(hex){const channels=hex.match(/../g).map(c=>parseInt(c,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return channels.reduce((n,c,i)=>n+c*[.2126,.7152,.0722][i],0)}
 assert(css.includes('#libraryModal .patchcard strong,#libraryModal .patchcard small{color:#354b34'));for(const background of ['b0be96','bbc6a3'])assert((luminance(background)+.05)/(luminance('354b34')+.05)>4.5);
 console.log('Help before Audio, visible synth polyphony, LCD names/descriptions at >4.5:1 contrast: OK.');
})().catch(e=>{console.error(e);process.exitCode=1});
