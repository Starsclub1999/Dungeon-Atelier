'use strict';
// Rebuild the licensed/public-domain score bank offline from the bundled MIDI files.
// No dependencies, randomized notes, or third-party song transcriptions are involved.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),dist=fs.existsSync(path.join(root,'dist/index.html'))?path.join(root,'dist'):root;
const manifest=JSON.parse(fs.readFileSync(path.join(dist,'assets/licenses/repertoire-manifest.json'),'utf8'));
const context=vm.createContext({Uint8Array,DataView,TextDecoder});
vm.runInContext(fs.readFileSync(path.join(dist,'js/midi.js'),'utf8'),context);
const round=x=>+x.toFixed(5),built=[];
function peakPoly(notes){let e=[];for(let n of notes)e.push([n[0],1],[n[0]+n[2],-1]);e.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);let live=0,peak=0;for(let x of e){live+=x[1];peak=Math.max(live,peak)}return peak}
function authoredPercussion(length,meter,kit,notes){
 const hits=Array.from({length:6},()=>[]),bar=meter*4;
 const rare=['monastery','cathedral','ossuary','funeral','mist','frostbells','willow','heartbeat','dust'].includes(kit);
 const dense=['goblin','barbarian','ritualdeep','adventure8','crypt16','fmcrypt','machine'].includes(kit);
 const active=new Set(notes.map(n=>Math.floor(n[0]/bar)));
 const put=(tr,s,v)=>{s=Math.round(s);if(s>=0&&s<length)hits[tr].push([s,v])};
 for(let s=0,b=0;s<length;s+=bar,b++){
  if(!active.has(b))continue;
  const last=s+bar>=length;
  if(rare){if(b%2===0)put(0,s,.22);if(b%8===0)put(4,s,.17);if(b%8===7)put(3,s+bar-4,.18)}
  else{put(0,s,dense?.38:.29);if(!last&&b%2===0)put(3,s+(meter===3?8:8),.20);if(b%4===3&&!last)put(1,s+bar-4,.19);if(b%8===0)put(4,s,.16)}
  if(dense&&!last){put(0,s+Math.floor(bar/2),.23);if(b%4===3){put(3,s+bar-3,.24);put(3,s+bar-1,.19)}}
 }
 return hits;
}
for(const original of manifest){
 const p={...original},bytes=fs.readFileSync(path.join(dist,p.midiAsset));
 const hash=crypto.createHash('sha256').update(bytes).digest('hex');
 if(hash!==p.sha256)throw Error('Original MIDI hash mismatch: '+p.id);
 context.sourceBuffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
 const midi=vm.runInContext('parseMidi(sourceBuffer)',context),unit=midi.bpm/15;
 const all=midi.tracks.flatMap(t=>t.notes),melodic=all.filter(n=>n.ch!==9),gm=all.filter(n=>n.ch===9);
 if(!melodic.length)throw Error('Empty melodic score: '+p.id);
 const end=Math.max(midi.duration,...all.map(n=>n.end))*unit;
 const cycle=Math.ceil(end/16)*16,repeats=Math.max(1,Math.ceil(62/(cycle*15/p.bpm)));
 const length=cycle*repeats,notes=[],drums=Array.from({length:6},()=>[]);
 for(let r=0;r<repeats;r++){
  for(let n of melodic)notes.push([round(n.start*unit+r*cycle),n.n,round((n.end-n.start)*unit),round(n.v),n.ch]);
  for(let n of gm){context.gmNote=n.n;const tr=vm.runInContext('gmTrack(gmNote)',context);drums[tr].push([Math.round(n.start*unit+r*cycle),round(n.v)])}
 }
 notes.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 p.sourceBpm=midi.bpm;p.sourceDuration=midi.duration;p.sourceNoteCount=melodic.length;p.sourceTempoChanges=midi.tempoChanges;
 p.sourceCycle=cycle;p.scoreRepeats=repeats;p.scoreLength=length;p.scorePoly=Math.min(64,Math.max(32,peakPoly(notes)+8));
 p.percussionSource=gm.length?'source MIDI channel 10':'new studio accompaniment';
 p.descriptionEn='Complete '+(p.sourceType==='game-score'?'original game MIDI':'published score')+'; '+p.credit+'. '+(p.mediaDescription?p.mediaDescription+' ':'')+'Played with a PD synth patch at '+p.bpm+' BPM. '+(repeats>1?'The complete score is repeated '+repeats+' times, without random note changes. ':'No random note changes. ')+(gm.length?'Source GM drums mapped to the studio’s six percussion voices.':'A quiet, newly authored percussion accompaniment is added; it is not claimed to be part of the historical score.')+' '+p.sourceNote;
 p.description='Полная опубликованная партитура; '+p.credit+'. Тембр PD, темп '+p.bpm+' BPM. '+(repeats>1?'Партитура повторена целиком '+repeats+' раза, без случайных изменений нот. ':'Без случайных изменений нот. ')+(gm.length?'Исходные GM-ударные распределены по 6 голосам студии.':'Добавлено тихое авторское сопровождение ударных; это не часть исторической партитуры.');
 if(p.sourceType==='chant-realization')p.description+=' Все ноты полного хорала сохранены из GABC; ритм адаптирован к ровной пульсации с паузами для дыхания. Это не утверждение об единственном исторически правильном ритме.';
 p._notes=notes;p._drums=gm.length?drums:authoredPercussion(length,p.meter,p.kit,notes);
 built.push(p);
 console.log(p.id+' | '+notes.length+' notes | '+(length*15/p.bpm).toFixed(1)+' s | '+repeats+' score cycle(s)');
}
const code="'use strict';\n// Verified source files, credits and licenses: assets/licenses/repertoire-sources.md\n// Compact note rows: start, MIDI pitch, length, velocity, source channel.\nconst repertoireScores="+JSON.stringify(built)+`;\nfor(const p of repertoireScores){
 if(!genres.includes(p.genre))genres.push(p.genre);
 p.score={length:p.scoreLength,notes:p._notes.map(n=>({s:n[0],n:n[1],l:n[2],v:n[3],channel:n[4],role:'score'})),drums:p._drums.map(a=>a.map(h=>({s:h[0],v:h[1]})))};
 delete p._notes;delete p._drums;
 p.root=0;p.base=48;p.scale='minor';p.style='score';p.seed=1;
 const si=seqPatches.push(p)-1;
 const di=drumPatches.push({id:p.id+'-drums',name:p.name+' / ударные',nameEn:p.nameEn+' / percussion',genre:p.genre,bpm:p.bpm,scoreRef:si,compositionRef:si,scoreLength:p.scoreLength,kit:p.kit,credit:p.credit,license:p.license,licenseUrl:p.licenseUrl,reference:p.reference,provenance:p.provenance,description:p.percussionSource==='new studio accompaniment'?'Новое сопровождение исторической мелодии.':'Ударные из оригинального MIDI.',descriptionEn:p.percussionSource==='new studio accompaniment'?'New accompaniment to the historical melody.':'Drums from the original MIDI.'})-1;
 scenePresets.push({name:p.name,nameEn:p.nameEn,genre:p.genre,tone:p.tone,sequence:si,drum:di,kit:p.kit});
}\n`;
fs.writeFileSync(path.join(dist,'js/repertoire-data.js'),code);
const intro=`# Dungeon Atelier — additional real score sources\n\nThis bank contains **${built.length} actual scores**, not generated pastiches. Downloaded \`new-*.mid\` files are byte-for-byte copies of the source MIDIs listed below. The Gregorian Dies irae MIDI is a new rhythmic realization of the complete CC0 GABC transcription; Scarborough Fair is a new MIDI transcription of the published traditional melody. Their GABC/LilyPond notation is bundled separately. SHA-256 hashes are recorded in \`repertoire-manifest.json\`. Rebuild offline with \`node tools/build-repertoire.cjs\`.\n\nThe studio preserves all melodic MIDI pitches, note lengths and velocities; tempo maps are flattened into fractional note positions by the existing MIDI importer. Playback tempo and instrument timbre are adapted. Scores shorter than 62 seconds at the selected tempo are repeated **in full**, never extended with random notes. Original channel-10 percussion is mapped to the six drum voices. Scores without channel-10 percussion receive a quiet, newly authored accompaniment; this is identified in each preset and is not presented as historical percussion.\n\nGenre labels distinguish Renaissance/medieval scores, Gothic classical pieces, nocturnes, screen-related classics, actual retro-game music and licensed dungeon/RPG music. Freedoom is a free-content retro FPS project: these are its actual original MIDIs, not id Software’s proprietary Doom soundtrack. Fantasy Musica, Joseph Collard and Bogart VGM are credited as dungeon/RPG game composers, not falsely advertised as established dungeon-synth artists.\n\nFilm/game references identify reuse of the classical **composition**. The included Mutopia MIDI is not a transcription of the film/game recording or its later arrangement.\n\n## Licenses\n\n- Public Domain entries: both the composition and the downloaded edition are marked Public Domain by Mutopia.\n- CC BY and CC BY-SA editions: the original editor is credited below; use the linked license. The derived score data, retiming and musical arrangements retain the source license (including ShareAlike where applicable). The source MIDI files remain unchanged.\n- MIT-licensed new folk arrangements: retain \`SPECTRUMIZER-MIT.txt\`. The traditional melodies and the new arrangements are distinguished in the manifest.\n- GregoBase: all chant transcriptions are explicitly CC0; the Dies irae pitch order is retained with newly programmed equal-note rhythm and breathing pauses.\n- Freedoom: retain \`FREEDOOM-COPYING.txt\` and \`FREEDOOM-CREDITS-MUSIC.txt\` with redistributions. Neither Freedoom nor its contributors endorse this studio.\n- New percussion accompaniments and retiming for Public Domain / BSD source scores are released as CC0 by Dungeon Atelier. This does not remove rights in any third-party edition or recording.\n\n## Included scores\n\n| Score / credit | Source and license | Playback |\n|---|---|---|\n`;
const rows=built.map(p=>'| '+p.nameEn+' — '+p.credit+' | [source]('+p.reference+') · ['+p.license+']('+p.licenseUrl+') | '+(p.scoreLength*15/p.bpm).toFixed(0)+' s · '+p.bpm+' BPM'+(p.scoreRepeats>1?' · full score ×'+p.scoreRepeats:'')+' |').join('\n');
const media='\n\n## Verified media connections\n\n'+built.filter(p=>p.mediaReference).map(p=>'- **'+p.nameEn+'**: '+p.mediaDescription+' [Evidence]('+p.mediaReference+').').join('\n')+`\n\n## Artist references without bundled scores\n\n- **Blod Besvimelse — Misanthrop**: no permission to redistribute a complete score was found. Refer to the artist’s official release/reference player and import your own authorized MIDI. A same-style preset is not the original composition.\n- **Aufhocker (Andru Jorj) — Daemonium**: [official album](https://aufhocker.bandcamp.com/album/daemonium), released 15-Feb-2023, explicitly CC BY-SA 4.0 and tagged dungeon synth by the artist. The seven recordings are available from the artist; no MIDI score was supplied, so no guessed transcription is included. Album embed ID: 1689377879. Opening The Abyss track: 3068697271; Kingdom Of Mourning: 936734238.\n\nVerified 17-Oct-2026.\n`;
fs.writeFileSync(path.join(dist,'assets/licenses/repertoire-sources.md'),intro+rows+media);
if(built.some(p=>p.scoreLength*15/p.bpm<60))throw Error('Short score');
console.log('Built '+built.length+' real scores; '+Buffer.byteLength(code)+' bytes.');
