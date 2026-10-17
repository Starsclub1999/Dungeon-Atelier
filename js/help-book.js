/* An offline, paged manual. No musical parameters change while reading. */
const helpBook={open:false,chapter:0,spread:0,fromIntro:false,returnFocus:null};
const bookLabels={
 ru:{kicker:'БИБЛИОТЕКА НОЧНОЙ МАСТЕРСКОЙ',title:'КНИГА ЗВУКА',chapters:'Главы справки',close:'Закрыть справку',previous:'Предыдущий разворот',next:'Следующий разворот',page:'СТР.',chapter:'ГЛАВА',hint:'Закладки — главы · ← / → — листать · Esc — закрыть',introHint:'Закройте книгу, чтобы вернуться к описанию и войти в подземелье.'},
 en:{kicker:'THE MIDNIGHT WORKSHOP LIBRARY',title:'THE BOOK OF SOUND',chapters:'Manual chapters',close:'Close help book',previous:'Previous spread',next:'Next spread',page:'PAGE',chapter:'CHAPTER',hint:'Bookmarks: chapters · ← / →: turn pages · Esc: close',introHint:'Close the book to return to the introduction and enter the dungeon.'}
};
function bookStats(){const slots=seqPatches.filter(p=>p.provenance==='reference-slot').length;return {timbres:patches.length,scores:seqPatches.length-slots,slots,rhythms:drumPatches.length,performances:scenePresets.length,kits:drumKits.length}}
function bookText(text){const stats=bookStats();return String(text||'').replace(/\{\{(\w+)\}\}/g,(_,key)=>stats[key]??'')}
function bookNode(tag,text,className){const el=document.createElement(tag);if(text!==undefined)el.textContent=bookText(text);if(className)el.className=className;return el}
function bookPageNumber(chapter,local=0){return helpBookContent[language].slice(0,chapter).reduce((sum,c)=>sum+c.pages.length,0)+local+1}
function renderBookLeaf(el,page,number,chapter){
 el.replaceChildren();const caption=bookNode('div',chapter.tab,'book-runninghead');el.append(caption,bookNode('h3',page.heading),bookNode('div','✦','book-ornament'));
 const body=bookNode('div',undefined,'book-pagebody');for(const text of page.paragraphs||[])body.append(bookNode('p',text));
 if(page.bullets?.length){const list=bookNode('ul');for(const text of page.bullets)list.append(bookNode('li',text));body.append(list)}el.append(body,bookNode('div',String(number).padStart(2,'0'),'book-folio'));el.scrollTop=0;
}
function renderHelpBook(){
 const chapters=helpBookContent[language],labels=bookLabels[language];helpBook.chapter=clamp(helpBook.chapter,0,chapters.length-1);const chapter=chapters[helpBook.chapter];helpBook.spread=clamp(helpBook.spread,0,Math.ceil(chapter.pages.length/2)-1);
 const focused=document.activeElement?.dataset?.chapter;$('bookTabs').replaceChildren();
 chapters.forEach((item,i)=>{const tab=bookNode('button',undefined,'book-tab');tab.id='booktab-'+item.id;tab.dataset.chapter=String(i);tab.setAttribute('role','tab');tab.setAttribute('aria-controls','bookSpread');tab.setAttribute('aria-selected',String(i===helpBook.chapter));tab.tabIndex=i===helpBook.chapter?0:-1;tab.classList.toggle('selected',i===helpBook.chapter);tab.append(bookNode('span',String(i+1).padStart(2,'0'),'book-tabno'),bookNode('span',item.tab));tab.onclick=()=>selectBookChapter(i);$('bookTabs').append(tab)});
 const at=helpBook.spread*2,left=chapter.pages[at],right=chapter.pages[at+1],first=bookPageNumber(helpBook.chapter,at),total=chapters.reduce((n,c)=>n+c.pages.length,0);
 renderBookLeaf($('bookLeft'),left,first,chapter);renderBookLeaf($('bookRight'),right||{heading:chapter.title,paragraphs:[chapter.summary]},first+1,chapter);$('bookSpread').scrollTop=0;$('bookSpread').setAttribute('aria-labelledby','booktab-'+chapter.id);
 $('bookKicker').textContent=labels.kicker;$('bookTitle').textContent=labels.title;$('bookTabs').setAttribute('aria-label',labels.chapters);$('bookClose').setAttribute('aria-label',labels.close);$('bookPrev').setAttribute('aria-label',labels.previous);$('bookNext').setAttribute('aria-label',labels.next);
 $('bookLanguage').textContent=language==='ru'?'EN':'RU';$('bookLanguage').lang=language==='ru'?'en':'ru';$('bookLanguage').setAttribute('aria-label',language==='ru'?'Read in English':'Читать по-русски');
 $('bookProgress').textContent=labels.chapter+' '+String(helpBook.chapter+1).padStart(2,'0')+' / '+chapters.length+' · '+labels.page+' '+first+'–'+(first+1)+' / '+total;
 $('bookHint').textContent=helpBook.fromIntro?labels.introHint:labels.hint;$('bookPrev').disabled=helpBook.chapter===0&&helpBook.spread===0;$('bookNext').disabled=helpBook.chapter===chapters.length-1&&at+2>=chapter.pages.length;
 if(focused!==undefined)$('booktab-'+chapters[+focused]?.id)?.focus({preventScroll:true});
 if(helpBook.open)$('booktab-'+chapter.id)?.scrollIntoView?.({block:'nearest',inline:'nearest'});
}
function selectBookChapter(index){helpBook.chapter=index;helpBook.spread=0;renderHelpBook();$('booktab-'+helpBookContent[language][index].id).focus({preventScroll:true});animateBookTurn(1)}
function animateBookTurn(dir){const el=$('bookSpread');el.classList.remove('turn-forward','turn-back');void el.offsetWidth;el.classList.add(dir>0?'turn-forward':'turn-back')}
function turnBook(dir){
 const chapters=helpBookContent[language],chapter=chapters[helpBook.chapter];if(dir>0){if((helpBook.spread+1)*2<chapter.pages.length)helpBook.spread++;else if(helpBook.chapter<chapters.length-1){helpBook.chapter++;helpBook.spread=0}else return}
 else if(helpBook.spread>0)helpBook.spread--;else if(helpBook.chapter>0){helpBook.chapter--;helpBook.spread=Math.ceil(chapters[helpBook.chapter].pages.length/2)-1}else return;
 renderHelpBook();animateBookTurn(dir);deviceClick('page');
}
function openHelpBook(fromIntro=false){
 releaseAll();helpBook.returnFocus=document.activeElement;helpBook.fromIntro=!!fromIntro;helpBook.open=true;renderHelpBook();$('helpModal').classList.add('open');$('helpModal').setAttribute('aria-hidden','false');document.body.classList.add('book-open');$('studioMain').inert=true;$('recordResult').inert=true;if(startup.visible)$('startup').inert=true;
 const tab=$('booktab-'+helpBookContent[language][helpBook.chapter].id);tab.focus({preventScroll:true});tab.scrollIntoView?.({block:'nearest',inline:'nearest'});
}
function closeHelpBook(restoreFocus=true){
 if(!helpBook.open)return;helpBook.open=false;$('helpModal').classList.remove('open');$('helpModal').setAttribute('aria-hidden','true');document.body.classList.remove('book-open');$('startup').inert=false;$('studioMain').inert=startup.visible;$('recordResult').inert=startup.visible;if(restoreFocus)helpBook.returnFocus?.focus({preventScroll:true});
}
function setupHelpBook(){
 $('helpOpen').onclick=()=>openHelpBook();$('helpBtn').onclick=()=>openHelpBook();$('bookClose').onclick=()=>closeHelpBook();$('bookPrev').onclick=()=>turnBook(-1);$('bookNext').onclick=()=>turnBook(1);$('bookLanguage').onclick=()=>setLanguage(language==='ru'?'en':'ru');
 $('helpModal').addEventListener('pointerdown',e=>{if(e.target===e.currentTarget)closeHelpBook()});
 window.addEventListener('keydown',e=>{
  if(!helpBook.open)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeHelpBook();return}
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();e.stopImmediatePropagation();turnBook(e.key==='ArrowRight'?1:-1)}
  if((e.key==='ArrowUp'||e.key==='ArrowDown')&&e.target.dataset?.chapter!==undefined){e.preventDefault();e.stopImmediatePropagation();selectBookChapter((helpBook.chapter+(e.key==='ArrowDown'?1:-1)+helpBookContent[language].length)%helpBookContent[language].length)}
  if(e.key==='Tab'){const buttons=[...$('helpModal').querySelectorAll('button:not([disabled]),[tabindex="0"]')].filter(el=>el.getClientRects().length);const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
 },true);
}
