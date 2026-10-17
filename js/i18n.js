/* Presentation-only translation. Preset identities, pitches and seeded data stay intact. */
let language='ru';try{language=localStorage.getItem('dungeon-language')==='en'?'en':'ru'}catch(e){}
const extraEnglish={
 'Справка':'Help','Полифония':'Polyphony','Автоматически выбирать число голосов для тембра и партии':'Automatically choose a voice limit for the sound and score',
 'Русский':'Russian',
 'ЯЗЫК / LANGUAGE':'LANGUAGE','Звуки приборов':'Device sounds','Заставка':'Opening sequence','Показать заставку':'Replay opening','Звуки кнопок идут только в колонки и не попадают в WAV.':'Button sounds are heard through your speakers and stay out of WAV recordings.',
 'Современный dungeon synth / источники':'Modern dungeon synth / references','ОРИГИНАЛ / MIDI СЛОТ':'ORIGINAL / MIDI SLOT','СЛУШАТЬ ИСТОЧНИК':'LISTEN TO SOURCE','ЗАГРУЗИТЬ СВОЙ MIDI':'IMPORT YOUR MIDI','СВОЙ MIDI СОХРАНЁН':'YOUR MIDI IS SAVED','НОТЫ НЕ ЗАГРУЖЕНЫ':'NO NOTES LOADED','ПРОИЗВЕДЕНИЕ / ИСТОЧНИК':'WORK / SOURCE',
 'Запись исполнителя':'Artist recording','Открыть страницу исполнителя':'Open artist page','Закрыть источник':'Close source','Для редактирования нот импортируйте свой MIDI. Официальная запись открывается отдельно.':'Import your own MIDI to edit its notes. The official recording opens separately.',
 'Здесь нет подмены нот стилизацией: в этом слоте играют только импортированные вами ноты.':'This slot plays only the notes you import; an inspired composition is never substituted.',
 'ТЕМБР И УДАРНЫЕ':'SYNTH AND DRUM KIT','Загружены тембр и набор ударных. Добавьте свой MIDI или откройте запись исполнителя.':'Synth sound and drum kit loaded. Add your own MIDI or open the artist recording.',
 'Оригинальная запись вне WAV':'Original recording outside WAV','Партитура сохранена в слоте':'Score saved to this slot','MIDI не удалось сохранить в браузере; сессия остаётся доступной до закрытия страницы.':'Could not store MIDI in the browser; the slot remains available until this page closes.',
 'Real scores / Licensed':'Game scores / Rusted 8-bit','ХОЛОДНЫЙ АРХИВ':'THE COLD ARCHIVE',
 'PARCHEMIN · пергамент и дерево':'PARCHEMIN · parchment and wood','MONASTERY · монастырская тишина':'MONASTERY · monastic silence','OSSUARY · кости и камень':'OSSUARY · bone and stone','GOBLIN · кривые погремушки':'GOBLIN · crooked rattles','CATHEDRAL · большие своды':'CATHEDRAL · vaulted halls','FUNERAL · траурное шествие':'FUNERAL · funeral procession','BRONZE · бронзовые чаши':'BRONZE · bronze bowls','CHAMBER · придворный ансамбль':'CHAMBER · court ensemble','ADVENTURE-8 · карманный данжн':'ADVENTURE-8 · pocket dungeon','CRYPT-16 · подземелье консоли':'CRYPT-16 · console dungeon','FM CRYPT · металлический синтез':'FM CRYPT · metallic synthesis','MIST · едва слышный туман':'MIST · barely audible mist','FROSTBELLS · иней и стекло':'FROSTBELLS · frost and glass','BARBARIAN · военные кожи':'BARBARIAN · war hides','WILLOW · лесной обряд':'WILLOW · woodland ritual','HEARTBEAT · низкий пульс':'HEARTBEAT · low pulse','DUST · пыль магнитной ленты':'DUST · magnetic-tape dust','RITUAL DEEP · глубокий обряд':'RITUAL DEEP · deep ritual',
 'Лёгкий орган · Misanthrop palette':'Delicate organ · Misanthrop palette','Подвальная шкатулка · Blod palette':'Cellar music box · Blod palette','Мрачный хор · Mortiis palette':'Dark choir · Mortiis palette','Дальний кассетный хор':'Distant cassette choir',
 'Авторский тембр для игры вместе с выбранным музыкальным ориентиром. Оригинальные настройки исполнителя не заявляются.':'An original sound for playing alongside the selected musical reference. It does not claim the artist’s original settings.'
};
let englishCatalog=Object.assign(Object.create(null),uiEnglish,presetEnglishNames,presetEnglishUppercase,extraEnglish),nameMatchers=[];
const sourceText=new WeakMap(),sourceAttributes=new WeakMap();
function registerLocaleData(){
 for(let bank of [patches,seqPatches,drumPatches,scenePresets])for(let p of bank){if(p.nameEn&&p.name){englishCatalog[p.name]=p.nameEn;englishCatalog[p.name.toUpperCase()]=p.nameEn.toUpperCase()}if(p.descriptionEn&&p.description)englishCatalog[p.description]=p.descriptionEn;if(p.descEn&&p.desc)englishCatalog[p.desc]=p.descEn}
 nameMatchers=Object.entries({...presetEnglishNames,...presetEnglishUppercase,...extraEnglish,...Object.fromEntries([...patches,...seqPatches,...drumPatches,...scenePresets].filter(p=>p.nameEn).map(p=>[p.name,p.nameEn]))}).filter(([s])=>/[А-Яа-яЁё]/.test(s)).sort((a,b)=>b[0].length-a[0].length).map(([s,en])=>[new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'),en]);
}
function englishText(value,depth=0){
 let text=String(value),trim=text.trim();if(englishCatalog[trim])return text.replace(trim,englishCatalog[trim]);if(!/[А-Яа-яЁё]/.test(text))return text;if(depth>4)return text;
 const prefix=text.match(/^(\s*(?:[◆>]\s*)?(?:\d+\s*·\s*|LOADED:\s*|MIDI:\s*))(.*)$/s);if(prefix)return prefix[1]+englishText(prefix[2],depth+1);
 let result=text;for(let [pattern,replacement]of [[/^Подготовка PD (\d+)%$/,'Preparing PD $1%'],...uiEnglishPatterns]){const match=result.match(pattern);if(match){result=replacement.replace(/\$(\d+)/g,(_,index)=>englishText(match[+index]||'',depth+1));break}}
 for(let [pattern,replacement]of nameMatchers)result=result.replace(pattern,(match,offset,all)=>{let before=all[offset-1]||'',after=all[offset+match.length]||'';return /[\p{L}\p{N}]/u.test(before)||/[\p{L}\p{N}]/u.test(after)?match:replacement});
 if(result.includes('\n'))result=result.split('\n').map(s=>englishText(s,depth+1)).join('\n');
 // Generated source / conductor strings contain whole known messages or names.
 for(let delimiter of [' + ',' / ',' · '])if(result.includes(delimiter))result=result.split(delimiter).map(s=>{let t=s.trim();return englishCatalog[t]?s.replace(t,englishCatalog[t]):s}).join(delimiter);
 return result.replace(/редакция (?=[A-Z])/gu,'edition ');
}
function localize(text){return language==='en'?englishText(text):String(text)}
function translateTree(root){
 if(!root||!document.createTreeWalker)return;
 const skip=node=>node.parentElement?.closest('script,style,[data-i18n-manual],[data-i18n-skip]');
 const translateText=node=>{if(skip(node)||!node.nodeValue?.trim())return;let cached=sourceText.get(node),original=cached&&(node.nodeValue===cached.rendered||node.nodeValue===cached.original)?cached.original:node.nodeValue,rendered=localize(original);sourceText.set(node,{original,rendered});if(node.nodeValue!==rendered)node.nodeValue=rendered};
 if(root.nodeType===3){translateText(root);return}
 const walker=document.createTreeWalker(root,4);let node;while((node=walker.nextNode()))translateText(node);
 for(let el of [root,...(root.querySelectorAll?.('[title],[aria-label],[aria-valuetext],[placeholder],[alt]')||[])]){
  if(!el.getAttribute||el.closest?.('[data-i18n-manual],[data-i18n-skip]'))continue;let cache=sourceAttributes.get(el)||{};
  for(let attr of ['title','aria-label','aria-valuetext','placeholder','alt']){let value=el.getAttribute(attr);if(value===null)continue;let previous=cache[attr],original=previous&&(value===previous.rendered||value===previous.original)?previous.original:value,rendered=localize(original);cache[attr]={original,rendered};if(value!==rendered)el.setAttribute(attr,rendered)}sourceAttributes.set(el,cache);
 }
}
function setLanguage(code){
 language=code==='en'?'en':'ru';try{localStorage.setItem('dungeon-language',language)}catch(e){}if(document.documentElement)document.documentElement.lang=language;
 const control=$('languageSelect');if(control)control.value=language;translateTree(document.body);
 if(typeof renderStartup==='function')renderStartup();if(typeof helpBook!=='undefined'&&helpBook.open)renderHelpBook();if(typeof refreshPolyphonyControls==='function')refreshPolyphonyControls();if(typeof drawRoll==='function'){drawRoll();drawDrums();drawOverview('seq');drawOverview('drum')}
}
function setupI18n(){
 registerLocaleData();$('languageSelect').value=language;$('languageSelect').onchange=e=>setLanguage(e.target.value);setLanguage(language);
 if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype._dungeonTranslated){const original=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(text,...args){return original.call(this,localize(text),...args)};CanvasRenderingContext2D.prototype._dungeonTranslated=true}
 if(typeof MutationObserver!=='undefined')new MutationObserver(records=>{for(let record of records){if(record.type==='childList')for(let node of record.addedNodes)translateTree(node);else translateTree(record.target)}}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','aria-valuetext','placeholder','alt']});
}
