'use strict';
// Actual artist recordings are linked through their own players. These MIDI slots
// intentionally contain no invented substitute for a protected composition.
const artistReferences=[
 {id:'misanthrop',artist:'Blod Besvimelse',title:'Misanthrop',source:'https://soundcloud.com/blodbesvimelse-music/misanthrop',service:'soundcloud',toneBase:11,kit:'goblin',bpm:88,palette:0},
 {id:'blod-box',artist:'Blod Besvimelse',title:'Keller synth / music-box palette',source:'https://open.spotify.com/artist/4fX7zAUjAwhJIQKIcqJlsk',toneBase:9,kit:'dust',bpm:86,palette:1},
 {id:'aufhocker-abyss',artist:'Aufhocker',title:'Opening The Abyss',source:'https://aufhocker.bandcamp.com/track/opening-the-abyss',service:'bandcamp',album:1689377879,track:3068697271,toneBase:27,kit:'ritualdeep',bpm:64,palette:2,sourceLicense:'CC BY-SA 4.0',credit:'Andru Jorj / Aufhocker'},
 {id:'aufhocker-mourning',artist:'Aufhocker',title:'Kingdom Of Mourning',source:'https://aufhocker.bandcamp.com/track/kingdom-of-mourning',service:'bandcamp',album:1689377879,track:936734238,toneBase:16,kit:'cathedral',bpm:62,palette:3,sourceLicense:'CC BY-SA 4.0',credit:'Andru Jorj / Aufhocker'},
 {id:'fief-ii',artist:'Fief',title:'II / Deep Forest Dance',source:'https://fief.bandcamp.com/album/ii',service:'bandcamp',album:3763192730,track:1728491172,toneBase:10,kit:'willow',bpm:96,palette:1},
 {id:'old-tower-specter',artist:'Old Tower',title:'The Rise of the Specter',source:'https://oldtower.bandcamp.com/album/the-rise-of-the-specter',service:'bandcamp',album:2601514757,track:3361317313,toneBase:21,kit:'monastery',bpm:52,palette:3},
 {id:'depressive-silence',artist:'Depressive Silence',title:'Mourning',source:'https://unbornprod.bandcamp.com/album/mourning',service:'bandcamp',album:2413467796,track:704593880,toneBase:24,kit:'mist',bpm:58,palette:2},
 {id:'mortiis-herske',artist:'Mortiis',title:'Født til å Herske',source:'https://mortiis.bandcamp.com/album/f-dt-til-herske-remaster',toneBase:6,kit:'barbarian',bpm:74,palette:2},
 {id:'burzum-hlidskjalf',artist:'Burzum',title:'Hliðskjálf',source:'https://burzum.org/eng/discography/official/1999_hlidskjalf.shtml',toneBase:2,kit:'funeral',bpm:64,palette:3}
];
const referenceGenre='Artist references / MIDI slots';if(!genres.includes(referenceGenre))genres.push(referenceGenre);
for(let ref of artistReferences){
 let sound=clone(patches[ref.toneBase]);sound.id='reference-tone-'+ref.id;sound.original=false;sound.provenance='inspired';sound.artist=ref.artist;sound.reference=ref.source;sound.cat='Artist sound palettes';sound.genres=[referenceGenre,'Keller synth'];sound.name=ref.artist+' / '+ref.title+' · PALETTE';sound.nameEn=sound.name;sound.desc='Авторский тембр для игры вместе с выбранным музыкальным ориентиром. Оригинальные настройки исполнителя не заявляются.';
 if(ref.palette===0){sound.lines[0].amp=ampEnv(.005,.45,.24,.68);sound.lines[1].amp=ampEnv(.007,.72,.18,.9);sound.lines[0].wave=3;sound.lines[0].wave2=1;sound.lines[1].wave=0;sound.lines[1].level=.36;sound.detune=19;sound.brightness=.42;sound.chorus=.48;sound.reverb=.36;sound.delay=.08}
 else if(ref.palette===1){sound.lines[0].amp=ampEnv(.012,.9,.3,1.3);sound.lines[1].level=.4;sound.detune=12;sound.brightness=.58;sound.reverb=.42}
 else if(ref.palette===2){sound.lines[0].amp=ampEnv(.9,2.4,.74,4.8);sound.lines[1].amp=ampEnv(1.5,2.8,.68,5.5);sound.reverb=.76;sound.brightness=.34}
 else{sound.lines[0].amp=ampEnv(1.8,3,.73,6);sound.lines[1].amp=ampEnv(2.1,3.2,.7,6.5);sound.brightness=.26;sound.reverb=.82;sound.delay=.14}
 ref.tone=patches.push(sound)-1;
 const score={length:512,notes:[],drums:Array.from({length:6},()=>[])};
 ref.sequence=seqPatches.push({id:'reference-score-'+ref.id,name:ref.artist+' / '+ref.title+' [MIDI SLOT]',nameEn:ref.artist+' / '+ref.title+' [MIDI SLOT]',genre:referenceGenre,artist:ref.artist,provenance:'reference-slot',referenceId:ref.id,reference:ref.source,bpm:ref.bpm,root:0,base:48,scale:'minor',style:'score',kit:ref.kit,seed:1,scoreLength:512,score,description:'Здесь нет подмены нот стилизацией: в этом слоте играют только импортированные вами ноты.',descriptionEn:'This slot plays only the notes you import; an inspired composition is never substituted.'})-1;
 ref.drum=drumPatches.push({id:'reference-drum-'+ref.id,name:ref.artist+' / '+ref.title+' · RHYTHM PALETTE',nameEn:ref.artist+' / '+ref.title+' · RHYTHM PALETTE',genre:referenceGenre,artist:ref.artist,provenance:'original',reference:ref.source,kit:ref.kit,preserveKit:true,bpm:ref.bpm,seed:18000+ref.tone,variant:ref.palette,form:ref.palette<2?'keller':'nocturne',pattern:ref.palette===0?[[0,8],[6,14],[2,6,10,14],[12],[0],[]]:ref.palette===1?[[0,10],[8],[4,12],[14],[0],[]]:[[0],[8],[],[12],[0],[0]],description:'Авторская ритм-палитра, не транскрипция ударных из записи.',descriptionEn:'An original rhythm palette, not a transcription of the recording’s percussion.'})-1;
 scenePresets.push({name:ref.artist+' / '+ref.title+' [MIDI SLOT]',nameEn:ref.artist+' / '+ref.title+' [MIDI SLOT]',genre:referenceGenre,tone:ref.tone,sequence:ref.sequence,drum:ref.drum,kit:ref.kit,referenceId:ref.id});
}
// Keep the old Rusted bank, with an accurate label rather than a dungeon-synth claim.
for(let p of [...seqPatches,...drumPatches,...scenePresets])if(p.genre==='Real scores / Licensed')p.genre='Game scores / Rusted 8-bit';
let rustedGenre=genres.indexOf('Real scores / Licensed');if(rustedGenre>=0)genres[rustedGenre]='Game scores / Rusted 8-bit';
