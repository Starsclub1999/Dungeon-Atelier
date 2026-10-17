'use strict';
// Original motifs: references identify the listening context, never a claimed transcription.
const artistBanks=[
 {artist:'Burzum',genre:'Burzum / atmosphere',url:'https://burzum.org/eng/discography/official/1999_hlidskjalf.shtml',tones:[0,1,2,4],names:['Лес за каменным залом','Плач северной башни','Тихая память фьорда','Рунный круг'],motif:[0,4,2,1,0,-1,2,4],forms:['procession','lament','arch','nocturne'],kit:'crypt',bpm:64},
 {artist:'Blod Besvimelse',genre:'Keller synth',url:'https://open.spotify.com/artist/4fX7zAUjAwhJIQKIcqJlsk',tones:[11,9,8,29],names:['Трещины фарфоровой шкатулки','Последний танец в подвале','Письмо с чердака','Кривые зеркала'],motif:[0,2,4,1,3,2,-1,0],forms:['ballad','keller','nocturne','rondo'],kit:'cassette',bpm:86},
 {artist:'Mortiis',genre:'Dungeon synth',url:'https://mortiis.bandcamp.com/album/f-dt-til-herske-remaster',tones:[6,27,19,17],names:['Горный трон','Шествие медных знамён','Клятва последнего стража','Зал над облаками'],motif:[0,0,4,5,4,2,1,0],forms:['suite','procession','ternary','arch'],kit:'war',bpm:76},
 {artist:'Depressive Silence',genre:'Dark ambient',url:'https://unbornprod.bandcamp.com/album/mourning',tones:[16,18,24,25],names:['Зеркало далёкого хора','Пепел на зимней тропе','Серебряные своды','Последняя вечерняя звезда'],motif:[7,6,4,5,2,4,1,0],forms:['arch','lament','nocturne','suite'],kit:'snow',bpm:58},
 {artist:'Old Tower',genre:'Ritual',url:'https://oldtower.bandcamp.com/',tones:[20,21,7,31],names:['Нижний монастырь','Своды чёрной воды','Далёкие каменные врата','Ночная башенная молитва'],motif:[0,1,4,3,1,0,-1,0],forms:['nocturne','arch','procession','lament'],kit:'iron',bpm:52},
 {artist:'Fief',genre:'Medieval',url:'https://fief.bandcamp.com/album/ii',tones:[10,34,35,9],names:['Утро странствующего менестреля','Кости и золотые монеты','Лесной двор','Карта старого трактира'],motif:[0,2,4,5,4,1,2,0],forms:['rondo','ballad','ternary','suite'],kit:'frame',bpm:98}
];
if(!genres.includes('Keller synth'))genres.push('Keller synth');
const formLibrary={
 ternary:[['intro',4],['A',8],['B',8],['A2',8],['coda',4]],
 procession:[['intro',4],['A',8],['answer',4],['A2',8],['B',8],['bridge',4],['reprise',8],['coda',4]],
 lament:[['intro',4],['A',8],['breath',2],['B',8],['A2',8],['coda',6]],
 nocturne:[['intro',6],['A',10],['B',8],['breath',2],['A2',10],['coda',4]],
 ballad:[['intro',4],['verse',8],['refrain',8],['verse2',8],['refrain2',8],['coda',4]],
 arch:[['intro',8],['A',12],['B',12],['C',8],['B2',8],['A2',8],['coda',8]],
 keller:[['intro',2],['A',8],['break',2],['B',8],['A2',8],['coda',4]],
 rondo:[['intro',4],['A',8],['B',6],['A2',8],['C',6],['reprise',8],['coda',4]],
 suite:[['intro',4],['A',8],['bridge',4],['B',8],['solo',8],['C',8],['reprise',8],['coda',4]]
};
const formLabels={intro:'ПРЕЛЮДИЯ',A:'A · ТЕМА',A2:'A′ · ВАРИАЦИЯ',answer:'ОТВЕТ',B:'B · НОВАЯ ТЕМА',B2:'B′ · ПЕРЕОСМЫСЛЕНИЕ',C:'C · КОНТРАСТ',bridge:'ПЕРЕХОД',reprise:'ВОЗВРАЩЕНИЕ',coda:'КОДА',breath:'ПАУЗА',break:'ПЕРЕЛОМ',verse:'СТРОФА I',verse2:'СТРОФА II',refrain:'РЕФРЕН',refrain2:'РЕФРЕН II',solo:'СОЛО'};
const rhythmFamilies={
 chords:[[0,6,10],[0,4,10,14],[0,8,12],[0,3,8,11,14]],
 procession:[[0,4,8,12],[0,4,7,10,14],[0,6,8,12],[0,3,6,12]],
 bells:[[0,6,10],[0,3,9,14],[0,8],[0,5,8,13]],
 arp:[[0,2,4,6,8,10,12,14],[0,3,4,7,8,11,12,15],[0,2,6,8,10,14],[0,2,4,7,8,10,12,15]],
 lament:[[0,6,8,14],[0,8,12],[0,3,6,10,14],[0,6,10]],
 drone:[[0],[0,10],[0,8],[0,6,12]],
 forest:[[0,3,6,10,12],[0,4,7,10,14],[0,2,6,8,14],[0,3,8,11,14]],
 ritual:[[0,3,8,12],[0,6,10,14],[0,4,7,12],[0,2,6,11,14]]
};
seqPatches.forEach((p,i)=>{p.form=Object.keys(formLibrary)[(hashString(p.name)+i)%9];p.motif=[0,2,4,1,3,2,-1,0].map((d,j)=>j===3&&i%3===0?5:d);p.harmony=i%4;p.kit=p.genre==='Dark ambient'?'iron':p.genre==='Medieval'?'frame':p.genre==='Winter synth'?'snow':p.genre==='Berlin school'||p.genre==='Darkwave'?'machine':'crypt';p.provenance='original';p.description='Авторская композиция · '+p.form});
drumPatches.forEach((p,i)=>{p.form=Object.keys(formLibrary)[(hashString(p.name)+i)%9];p.kit=p.genre==='Medieval'?'frame':p.genre==='Dark ambient'?'iron':p.genre==='Winter synth'?'snow':p.genre==='Berlin school'||p.genre==='Darkwave'?'machine':p.genre==='Ritual'?'war':'crypt';p.harmony=i%4});
artistBanks.forEach((bank,g)=>{for(let v=0;v<4;v++){
 let tone=clone(patches[bank.tones[v]]);tone.id='artist-tone-'+g+'-'+v;tone.name=bank.artist+' / '+['холодный орган','хор и струны','хрупкие клавиши','северный дрон'][v];tone.artist=bank.artist;tone.genres=[bank.genre];tone.original=false;tone.cat='Artist interpretations';tone.provenance='inspired';tone.reference=bank.url;tone.desc='Авторская интерпретация атмосферы '+bank.artist+'; не оригинальный аппаратный патч.';
 tone.lines[0].depth=clamp(tone.lines[0].depth+(g-2)*.025,.05,.95);tone.lines[1].depth=clamp(tone.lines[1].depth+(v-1)*.045,.05,.95);tone.lines[1].level=.52+v*.08;tone.detune=clamp(tone.detune+g-v,-35,35);if(g===1){tone.chorus=.58;tone.detune=15+v*3;tone.delay=.27;tone.brightness=.48+v*.06;tone.lines[0].amp=ampEnv(.008,.8+v*.2,.17,.7)}if(g===4){tone.brightness=.24+v*.06;tone.reverb=.78}let ti=patches.push(tone)-1;
 let sq={id:'artist-seq-'+g+'-'+v,name:bank.artist+' / '+bank.names[v]+' [стилизация]',genre:bank.genre,artist:bank.artist,provenance:'inspired',reference:bank.url,description:'Новая авторская композиция в эстетике исполнителя; не транскрипция конкретной записи.',style:[['chords','lament','bells','drone'],['forest','arp','bells','lament'],['procession','chords','procession','chords'],['chords','lament','bells','drone'],['drone','ritual','procession','chords'],['forest','arp','bells','procession']][g][v],bpm:bank.bpm+[0,4,-4,8][v],root:[0,2,5,9][v],base:g===4?36:48,scale:g===4?'phrygian':g===5?'dorian':v===2?'harmonic':'minor',seed:9000+g*100+v,variant:v,motif:bank.motif.slice(),harmony:(g+v)%4,form:bank.forms[v],kit:bank.kit};let si=seqPatches.push(sq)-1;
 let dr={id:'artist-drum-'+g+'-'+v,name:bank.artist+' / '+['первое шествие','тихий ритуал','контраст и паузы','финальный обряд'][v]+' [стилизация]',genre:bank.genre,artist:bank.artist,provenance:'inspired',reference:bank.url,pattern:clone(drumPatches[[2,5,0,10,4,3][g]].pattern),seed:12000+g*100+v,bpm:sq.bpm,variant:v,form:sq.form,kit:bank.kit,style:sq.style,compositionRef:si};let di=drumPatches.push(dr)-1;
 scenePresets.push({name:bank.artist+' / '+bank.names[v]+' [стилизация]',genre:bank.genre,tone:ti,sequence:si,drum:di,artist:bank.artist});
}});
