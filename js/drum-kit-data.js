'use strict';
// Independent modal / FM / low-bit palettes. The seven original kits stay intact.
drumKits.push(
 {id:'parchment',name:'PARCHEMIN · пергамент и дерево',base:84,frame:214,tom:137,bell:392,gong:98,damp:.48,room:.28,noise:.45,decay:.57,grain:0,material:'wood',punch:.5},
 {id:'monastery',name:'MONASTERY · монастырская тишина',base:53,frame:126,tom:82,bell:196,gong:49,damp:.75,room:.74,noise:.22,decay:1.38,grain:0,material:'metal',punch:.08},
 {id:'ossuary',name:'OSSUARY · кости и камень',base:92,frame:252,tom:157,bell:284,gong:61,damp:.58,room:.4,noise:.62,decay:.42,grain:0,material:'bone',punch:.7},
 {id:'goblin',name:'GOBLIN · кривые погремушки',base:106,frame:278,tom:181,bell:415,gong:123,damp:.4,room:.3,noise:.9,decay:.47,grain:2,material:'wood',punch:1.2},
 {id:'cathedral',name:'CATHEDRAL · большие своды',base:42,frame:107,tom:65,bell:130.81,gong:32.7,damp:.69,room:.83,noise:.28,decay:1.8,grain:0,material:'metal',punch:.2},
 {id:'funeral',name:'FUNERAL · траурное шествие',base:38,frame:102,tom:58,bell:146.83,gong:36.7,damp:.82,room:.63,noise:.47,decay:1.17,grain:0,material:'skin',punch:1},
 {id:'bronze',name:'BRONZE · бронзовые чаши',base:71,frame:184,tom:111,bell:261.63,gong:87.31,damp:.34,room:.57,noise:.15,decay:1.56,grain:0,material:'metal',punch:.04},
 {id:'chamber',name:'CHAMBER · придворный ансамбль',base:82,frame:205,tom:131,bell:440,gong:110,damp:.37,room:.25,noise:.3,decay:.61,grain:0,material:'wood',punch:.2},
 {id:'adventure8',name:'ADVENTURE-8 · карманный данжн',base:87,frame:240,tom:164,bell:523.25,gong:130.81,damp:.45,room:.21,noise:.78,decay:.42,grain:5,material:'chip',punch:2},
 {id:'crypt16',name:'CRYPT-16 · подземелье консоли',base:61,frame:191,tom:109,bell:329.63,gong:82.4,damp:.42,room:.39,noise:.64,decay:.72,grain:2,material:'chip',punch:1.5},
 {id:'fmcrypt',name:'FM CRYPT · металлический синтез',base:55,frame:165,tom:97,bell:233.08,gong:58.27,damp:.39,room:.44,noise:.32,decay:1.08,grain:0,material:'fm',punch:.7},
 {id:'mist',name:'MIST · едва слышный туман',base:48,frame:122,tom:76,bell:174.61,gong:43.65,damp:.9,room:.79,noise:.19,decay:1.36,grain:0,material:'brush',punch:.03},
 {id:'frostbells',name:'FROSTBELLS · иней и стекло',base:73,frame:166,tom:123,bell:587.33,gong:146.83,damp:.32,room:.71,noise:.08,decay:1.31,grain:0,material:'glass',punch:.02},
 {id:'barbarian',name:'BARBARIAN · военные кожи',base:46,frame:137,tom:74,bell:164.81,gong:41.2,damp:.58,room:.52,noise:.82,decay:1.19,grain:0,material:'skin',punch:1.7},
 {id:'willow',name:'WILLOW · лесной обряд',base:89,frame:226,tom:146,bell:349.23,gong:87.31,damp:.53,room:.46,noise:.43,decay:.74,grain:0,material:'wood',punch:.35},
 {id:'heartbeat',name:'HEARTBEAT · низкий пульс',base:33,frame:93,tom:49,bell:130.81,gong:32.7,damp:.91,room:.32,noise:.12,decay:.63,grain:0,material:'skin',punch:2.1},
 {id:'dust',name:'DUST · пыль магнитной ленты',base:67,frame:182,tom:102,bell:277.18,gong:69.3,damp:.66,room:.38,noise:.81,decay:.68,grain:7,material:'brush',punch:.2},
 {id:'ritualdeep',name:'RITUAL DEEP · глубокий обряд',base:35,frame:111,tom:57,bell:155.56,gong:38.89,damp:.73,room:.8,noise:.38,decay:1.67,grain:0,material:'fm',punch:1.1}
);
function assignPerformanceKits(){
 const palettes={Medieval:['parchment','chamber','willow','bronze','monastery'],Ritual:['ritualdeep','ossuary','barbarian','cathedral'], 'Dungeon synth':['crypt','monastery','funeral','bronze','ritualdeep'],'Dark ambient':['mist','heartbeat','cathedral','iron'],'Winter synth':['frostbells','snow','bronze'],'Keller synth':['cassette','dust','goblin','crypt16'],'Burzum / atmosphere':['monastery','mist','funeral','crypt']};
 drumPatches.forEach((p,i)=>{if(p.preserveKit||p.id?.startsWith('reference-')||p.id?.startsWith('repertoire-'))return;let choices=palettes[p.genre]||(/Retro|Freedoom|8.bit|Game/.test(p.genre)?['crypt16','adventure8','fmcrypt','machine']:/Medieval|Renaissance|Classical/.test(p.genre)?palettes.Medieval:null);if(choices&&!p.original)p.kit=choices[i%choices.length]});
 for(let scene of scenePresets)scene.kit=scene.kit||drumPatches[scene.drum]?.kit||'crypt';
}
assignPerformanceKits();
