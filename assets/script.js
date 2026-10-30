'use strict';
const KEY='m1-cwiczenia-v1';
const state={best:{}};
try{const s=localStorage.getItem(KEY); if(s){const p=JSON.parse(s); if(p&&p.best&&typeof p.best==='object') state.best=p.best}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
const $=s=>document.querySelector(s);
function h(html){const t=document.createElement('template');t.innerHTML=html.trim();return t.content.firstElementChild}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
let cleanup=null, current='intro';
const IC={
 mouse:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="3" width="12" height="18" rx="6"/><path d="M12 3v6"/></svg>',
 keys:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h1M10 10h1M14 10h1M18 10h0M7 14h10"/></svg>',
 win:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>',
 folder:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
 tag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
 alert:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/></svg>',
 box:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/></svg>',
 gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></svg>',
 gov:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-5 9 5M5 9v9M9 9v9M15 9v9M19 9v9M3 20h18"/></svg>',
 doc:'<svg class="fico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
 trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>'
};

/* ---------- generic UI ---------- */
function result(body,id,score,msg,again){
  const got=finish(id,score);
  body.innerHTML='';
  const nxt=nextId(id);
  const r=h(`<div class="result"><p class="res-score"><span>${got}</span> / 25 pkt</p><p class="res-msg">${msg}</p><div class="row"><button class="btn alt" data-a="again">Powtórz ćwiczenie</button>${nxt?'<button class="btn" data-a="next">Następne ćwiczenie</button>':'<button class="btn" data-a="sum">Zobacz podsumowanie</button>'}</div></div>`);
  body.append(r);
  r.querySelector('[data-a=again]').onclick=again;
  const n=r.querySelector('[data-a=next],[data-a=sum]'); n.onclick=()=>nxt?openStation(nxt):showSummary(); n.focus();
}
function finish(id,score){
  score=Math.max(0,Math.min(25,Math.round(score)));
  if(state.best[id]==null||score>state.best[id]) state.best[id]=score;
  save(); renderDesktop(); return score;
}
function quiz(body,id,qs,{noShuffle=false,intro=''}={}){
  let i=0,ok=0; const list=noShuffle?qs:shuffle(qs);
  const restart=()=>quiz(body,id,qs,{noShuffle,intro});
  function show(){
    const q=list[i]; body.innerHTML='';
    if(intro&&i===0) body.append(h(`<p class="lead">${intro}</p>`));
    body.append(h(`<p class="progress">Pytanie ${i+1} z ${list.length}</p>`));
    if(q.mock) body.append(h(q.mock));
    body.append(h(`<p class="q">${q.q}</p>`));
    const opts=h('<div class="opts"></div>'); body.append(opts);
    const order=q.fixed?q.o.map((t,k)=>k):shuffle(q.o.map((t,k)=>k));
    order.forEach(k=>{
      const b=h(`<button class="opt">${q.o[k]}</button>`);
      b.onclick=()=>{
        const right=k===q.a; if(right) ok++;
        opts.querySelectorAll('button').forEach((x,n)=>{x.disabled=true; if(order[n]===q.a) x.classList.add('right')});
        if(!right) b.classList.add('wrong');
        const fb=h(`<div class="feedback${right?'':' bad'}"><b>${right?'Poprawna odpowiedź.':'Niepoprawna odpowiedź.'}</b>${q.why}</div>`);
        body.append(fb);
        const nx=h(`<div class="row"><button class="btn">${i+1<list.length?'Dalej':'Zobacz wynik'}</button></div>`);
        body.append(nx); const nb=nx.querySelector('button'); nb.focus();
        nb.onclick=()=>{i++; if(i<list.length) show(); else result(body,id,ok/list.length*25,`Poprawne odpowiedzi: ${ok} z ${list.length}.`,restart)};
      };
      opts.append(b);
    });
  }
  show();
}

/* ---------- station 1: mouse ---------- */
function stMouse(body){
  const restart=()=>stMouse(body);
  let step=0;
  const steps=[clickDots,dblFolder,rightRename,dragTrash];
  function next(){ if(step<steps.length) steps[step++](); else result(body,'mysz',25,'Wykonane: kliknięcie, dwuklik, menu prawego przycisku i przeciąganie.',restart) }
  function frame(title){
    body.innerHTML='';
    body.append(h(`<p class="progress">Zadanie ${step} z 4</p>`));
    body.append(h(`<p class="step">${title}</p>`));
    const a=h('<div class="arena"></div>'); body.append(a);
    const hint=h('<p class="hint" aria-live="polite"></p>'); body.append(hint);
    return [a,hint];
  }
  function clickDots(){
    const [a,hint]=frame('Kliknij punkt na polu pięć razy. Po każdym kliknięciu zmienia położenie.');
    let n=0; const d=h('<button class="dot" aria-label="Kropka"></button>'); a.append(d);
    const place=()=>{const r=a.getBoundingClientRect(); d.style.left=Math.random()*Math.max(10,r.width-70)+'px'; d.style.top=Math.random()*Math.max(10,r.height-70)+'px'};
    place(); hint.textContent='Trafienia: 0 z 5';
    d.onclick=()=>{n++; hint.textContent=`Trafienia: ${n} z 5`; if(n>=5) setTimeout(next,300); else place()};
  }
  function dblFolder(){
    const [a,hint]=frame('Otwórz folder „Projekty” dwukrotnym kliknięciem.');
    const f=h(`<button class="thing" style="left:calc(50% - 55px);top:90px"><span style="color:var(--sage-d)">${IC.folder}</span>Projekty</button>`); a.append(f);
    let last=0;
    f.onclick=()=>{const t=Date.now(); if(t-last<450){hint.textContent='Folder został otwarty.'; f.disabled=true; setTimeout(next,700)} else {hint.textContent='Kliknij dwa razy szybko, jedno kliknięcie po drugim.'} last=t};
  }
  function rightRename(){
    const [a,hint]=frame('Kliknij plik prawym przyciskiem myszy, wybierz „Zmień nazwę” i nazwij go „Raport”. Zatwierdź Enterem.');
    const f=h(`<div class="thing" tabindex="0" style="left:calc(50% - 55px);top:70px"><span style="color:var(--sage-d)">${IC.doc.replace('class="fico"','')}</span><span class="lbl">Notatki.docx</span></div>`); a.append(f);
    const alt=h('<button class="btn alt" style="margin-top:6px;font-size:14px;padding:6px 12px">Nie mam myszki — pokaż menu</button>'); hint.after(alt);
    let menu=null;
    const open=(x,y)=>{
      if(menu) menu.remove();
      menu=h('<div class="ctx" role="menu"><button role="menuitem" data-v="o">Otwórz</button><button role="menuitem" data-v="c">Kopiuj</button><button role="menuitem" data-v="r">Zmień nazwę</button><button role="menuitem" data-v="d">Usuń</button></div>');
      const r=a.getBoundingClientRect(); menu.style.left=Math.min(x,r.width-180)+'px'; menu.style.top=Math.min(y,r.height-180)+'px';
      a.append(menu); menu.querySelector('button').focus();
      menu.onclick=e=>{const v=e.target.dataset.v; if(!v) return; menu.remove(); menu=null;
        if(v!=='r'){hint.textContent='To nie ta opcja. Szukamy „Zmień nazwę” — w Windows to samo robi klawisz F2.';return}
        const lbl=f.querySelector('.lbl'); const inp=h('<input class="rename" aria-label="Nowa nazwa pliku" value="Notatki">'); lbl.replaceWith(inp); inp.focus(); inp.select();
        hint.textContent='Wpisz „Raport” i naciśnij Enter.';
        inp.onkeydown=ev=>{if(ev.key==='Enter'){ if(inp.value.trim().toLowerCase().replace('.docx','')==='raport'){inp.replaceWith(h('<span>Raport.docx</span>')); hint.textContent='Nazwa została zmieniona.'; alt.remove(); setTimeout(next,700)} else hint.textContent='Nazwa ma brzmieć „Raport”.'}};
      };
    };
    f.addEventListener('contextmenu',e=>{e.preventDefault(); const r=a.getBoundingClientRect(); open(e.clientX-r.left,e.clientY-r.top)});
    f.addEventListener('click',()=>{if(!f.querySelector('input')) hint.textContent='To lewy przycisk. Spróbuj prawym.'});
    alt.onclick=()=>open(160,140);
  }
  function dragTrash(){
    const [a,hint]=frame('Przeciągnij niepotrzebny plik do kosza: przytrzymaj go i przesuń, potem puść nad koszem.');
    const t=h(`<div class="thing" style="right:30px;top:90px"><span style="color:var(--muted)">${IC.trash}</span>Kosz</div>`);
    const f=h(`<div class="thing" style="left:30px;top:90px;cursor:grab;touch-action:none"><span style="color:var(--sage-d)">${IC.doc.replace('class="fico"','')}</span>stary_plik.tmp</div>`);
    a.append(t,f);
    let sx,sy,drag=false;
    f.addEventListener('pointerdown',e=>{drag=true;sx=e.clientX;sy=e.clientY;f.setPointerCapture(e.pointerId);f.style.cursor='grabbing'});
    f.addEventListener('pointermove',e=>{if(!drag)return; f.style.transform=`translate(${e.clientX-sx}px,${e.clientY-sy}px)`;
      const tr=t.getBoundingClientRect(); const over=e.clientX>tr.left&&e.clientX<tr.right&&e.clientY>tr.top&&e.clientY<tr.bottom; t.style.background=over?'var(--ok-bg)':''});
    f.addEventListener('pointerup',e=>{if(!drag)return; drag=false; f.style.cursor='grab';
      const tr=t.getBoundingClientRect(); const over=e.clientX>tr.left&&e.clientX<tr.right&&e.clientY>tr.top&&e.clientY<tr.bottom;
      if(over){f.remove(); hint.textContent='Plik w koszu. Pamiętaj: z kosza można go jeszcze przywrócić.'; setTimeout(next,900)}
      else {f.style.transform=''; t.style.background=''; hint.textContent='Puść plik dokładnie nad koszem.'}});
  }
  next();
}

/* ---------- station 2: shortcut race ---------- */
function stKeys(body){
  const P=shuffle([
    {t:'Skopiuj zaznaczony tekst',c:'KeyC',k:'C'},{t:'Wklej skopiowany tekst',c:'KeyV',k:'V'},{t:'Wytnij zaznaczony tekst',c:'KeyX',k:'X'},
    {t:'Cofnij ostatnią czynność',c:'KeyZ',k:'Z'},{t:'Ponów cofniętą czynność',c:'KeyY',k:'Y'},{t:'Zapisz plik',c:'KeyS',k:'S'},
    {t:'Zaznacz wszystko',c:'KeyA',k:'A'},{t:'Znajdź słowo na stronie',c:'KeyF',k:'F'},{t:'Wydrukuj dokument',c:'KeyP',k:'P'}]);
  const restart=()=>stKeys(body);
  let i=0,ok=0,bad=0,skip=0,t0=0,running=false,timer=null;
  const coarse=matchMedia('(pointer:coarse)').matches;
  body.innerHTML=`<p class="lead">Na ekranie pojawi się polecenie. Wykonaj je skrótem z klawiszem <kbd>Ctrl</kbd> (na Macu <kbd>Cmd</kbd>). Myszka odpoczywa. ${coarse?'<br><b>To ćwiczenie wymaga klawiatury.</b>':''}</p>`;
  const st=h(`<div class="stage"><p class="prompt" aria-live="polite">Naciśnij „Rozpocznij”</p><p class="keys" id="ans" style="min-height:34px"></p><div class="stats"><span id="kt">Czas: 0 s</span><span id="kp">Trafione: 0 z 9</span><span id="kb">Pomyłki: 0</span></div></div>`);
  body.append(st);
  const ctl=h('<div class="row"><button class="btn" id="kgo">Rozpocznij</button><button class="btn alt" id="kskip" disabled>Nie wiem — pokaż</button></div>'); body.append(ctl);
  const pr=st.querySelector('.prompt'),ans=st.querySelector('#ans');
  function show(){pr.textContent=P[i].t; ans.innerHTML=''}
  function upd(){st.querySelector('#kp').textContent=`Trafione: ${ok} z 9`; st.querySelector('#kb').textContent=`Pomyłki: ${bad}`}
  function flash(c){st.classList.remove('flash-ok','flash-bad'); void st.offsetWidth; st.classList.add(c); setTimeout(()=>st.classList.remove(c),350)}
  function adv(){i++; if(i>=P.length){stop(); const sec=Math.round((Date.now()-t0)/1000); result(body,'skroty',ok/9*25-bad,`Trafione: ${ok} z 9, pomyłki: ${bad}, czas: ${sec} s. Każda pomyłka to minus punkt.`,restart)} else show()}
  function onKey(e){
    if(!running) return;
    if(!(e.ctrlKey||e.metaKey)) return;
    if(['Control','Meta','Shift','Alt'].includes(e.key)) return;
    e.preventDefault();
    if(e.code===P[i].c&&!e.shiftKey){ok++; ans.innerHTML=`<kbd>Ctrl</kbd> + <kbd>${P[i].k}</kbd>`; flash('flash-ok'); upd(); running=false; setTimeout(()=>{running=true;adv()},450)}
    else {bad++; flash('flash-bad'); upd()}
  }
  function stop(){running=false; clearInterval(timer); document.removeEventListener('keydown',onKey,true)}
  cleanup=stop;
  ctl.querySelector('#kgo').onclick=e=>{e.target.disabled=true; ctl.querySelector('#kskip').disabled=false; running=true; t0=Date.now(); show();
    timer=setInterval(()=>st.querySelector('#kt').textContent=`Czas: ${Math.round((Date.now()-t0)/1000)} s`,500);
    document.addEventListener('keydown',onKey,true); e.target.blur()};
  ctl.querySelector('#kskip').onclick=e=>{if(!running)return; skip++; ans.innerHTML=`<kbd>Ctrl</kbd> + <kbd>${P[i].k}</kbd>`; running=false; e.target.blur(); setTimeout(()=>{running=true;adv()},1300)};
}

/* ---------- station 3: Windows key ---------- */
const QWIN=[
 {q:'Co robi <kbd>Win</kbd> + <kbd>L</kbd>?',o:['Blokuje komputer','Wyłącza komputer','Otwiera listę programów','Zmienia język klawiatury'],a:0,why:'Win + L blokuje ekran. Używaj go zawsze, gdy odchodzisz od komputera — nawet na chwilę.'},
 {q:'Co robi <kbd>Win</kbd> + <kbd>E</kbd>?',o:['Otwiera Eksplorator plików','Otwiera pocztę e-mail','Wysuwa pendrive','Otwiera przeglądarkę'],a:0,why:'E jak Eksplorator. Najszybsza droga do twoich plików i folderów.'},
 {q:'Co robi <kbd>Win</kbd> + <kbd>I</kbd>?',o:['Otwiera Ustawienia','Pokazuje informacje o pliku','Włącza internet','Otwiera pomoc'],a:0,why:'Win + I otwiera Ustawienia, w których jest też wyszukiwarka opcji.'},
 {q:'Jak zrobić zrzut wybranego fragmentu ekranu?',o:['Win + Shift + S','Ctrl + S','Alt + F4','Win + D'],a:0,why:'Win + Shift + S pozwala zaznaczyć fragment ekranu. Zrzut trafia do schowka — wystarczy go wkleić Ctrl + V.'},
 {q:'Masz otwartych pięć okien. Jak szybko przełączyć się na inne?',o:['Alt + Tab','Ctrl + Z','Win + L','Ctrl + P'],a:0,why:'Przytrzymaj Alt i naciskaj Tab, żeby przechodzić między oknami.'},
 {q:'Podłączyłeś projektor. Który skrót pozwala wybrać „Duplikuj” albo „Rozszerz”?',o:['Win + P','Win + E','Ctrl + P','Alt + Tab'],a:0,why:'Win + P (jak projektor) ustawia, co ma się wyświetlać na drugim ekranie.'},
 {q:'Co robi <kbd>Win</kbd> + <kbd>D</kbd>?',o:['Pokazuje pulpit','Usuwa plik','Otwiera Dokumenty','Pobiera plik'],a:0,why:'Win + D chowa wszystkie okna i pokazuje pulpit. Drugie naciśnięcie przywraca okna.'},
 {q:'Co robi <kbd>Alt</kbd> + <kbd>F4</kbd>?',o:['Zamyka aktywne okno lub program','Otwiera nowe okno','Powiększa tekst','Zapisuje plik'],a:0,why:'Alt + F4 zamyka program. Na pustym pulpicie otwiera okno wyłączania komputera.'}
];

/* ---------- station 4: files ---------- */
function stFiles(body){
  const restart=()=>stFiles(body);
  const F=shuffle([
    {n:'IMG_2034.jpg',f:'z',h:'.jpg to zdjęcie.'},{n:'urodziny_Ani.png',f:'z',h:'.png to obraz.'},{n:'wakacje_plaza.jpg',f:'z',h:'.jpg to zdjęcie.'},
    {n:'Faktura_2026-03_Prad.pdf',f:'f',h:'W nazwie jest „Faktura”.'},{n:'rachunek_internet_luty.pdf',f:'f',h:'Rachunek trafia do faktur.'},{n:'FV_12_2026_Sklep.pdf',f:'f',h:'FV to skrót od „faktura VAT”.'},
    {n:'CV_Anna_Kowalska.docx',f:'d',h:'CV to dokument.'},{n:'list_motywacyjny.docx',f:'d',h:'List motywacyjny to dokument.'},{n:'umowa_najmu.pdf',f:'d',h:'Umowa to dokument, nie faktura.'},
    {n:'CV_Anna_Kowalska - Kopia (2).docx',f:'k',h:'To niepotrzebna kopia — do kosza.'},{n:'stary_instalator.exe',f:'k',h:'Program jest już zainstalowany, instalator nie jest potrzebny.'},{n:'Nowy dokument tekstowy (pusty).txt',f:'k',h:'Pusty plik — do kosza.'}
  ]);
  const D=[{id:'d',n:'Dokumenty'},{id:'z',n:'Zdjęcia'},{id:'f',n:'Faktury'},{id:'k',n:'Kosz'}];
  let sel=null,bad=0,left=F.length;
  body.innerHTML='<p class="lead">Na pulpicie zrobił się bałagan. Przeciągnij każdy plik do właściwego folderu albo kliknij plik, a potem folder.</p>';
  const desk=h('<div class="desk" aria-label="Pulpit z plikami"></div>'); body.append(desk);
  const fold=h('<div class="folders"></div>'); body.append(fold);
  const hint=h('<p class="hint" aria-live="polite"></p>'); body.append(hint);
  const cnt={};
  F.forEach((x,k)=>{const b=h(`<button class="file" draggable="true" data-k="${k}">${IC.doc}<span>${x.n}</span></button>`);
    b.onclick=()=>{desk.querySelectorAll('.file').forEach(y=>y.classList.remove('sel')); if(sel===k){sel=null;return} sel=k; b.classList.add('sel'); hint.textContent=`Wybrano: ${x.n}. Teraz kliknij folder.`};
    b.ondragstart=e=>{e.dataTransfer.setData('text/plain',String(k)); sel=k};
    desk.append(b)});
  D.forEach(d=>{cnt[d.id]=0; const b=h(`<button class="folder" data-f="${d.id}">${d.id==='k'?IC.trash.replace('<svg','<svg class="fico" style="width:28px;height:28px"'):IC.folder.replace('<svg','<svg style="width:28px;height:28px"')}<br>${d.n}<span class="cnt">0 plików</span></button>`);
    const drop=k=>{if(k==null)return; const x=F[k]; const el=desk.querySelector(`[data-k="${k}"]`); if(!el)return;
      if(x.f===d.id){el.remove(); cnt[d.id]++; b.querySelector('.cnt').textContent=`${cnt[d.id]} ${cnt[d.id]===1?'plik':(cnt[d.id]<5?'pliki':'plików')}`; left--; sel=null; hint.textContent='Plik przeniesiony.';
        if(!left) setTimeout(()=>result(body,'pliki',25-2*bad,bad?`Pomyłki: ${bad}. Każda kosztuje 2 punkty. Podpowiedź: patrz na rozszerzenie i na słowa w nazwie.`:'Wszystkie pliki przeniesione bez pomyłek.',restart),500)}
      else {bad++; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); hint.textContent=`Nie tutaj. ${x.h}`}};
    b.onclick=()=>drop(sel);
    b.ondragover=e=>{e.preventDefault(); b.classList.add('over')};
    b.ondragleave=()=>b.classList.remove('over');
    b.ondrop=e=>{e.preventDefault(); b.classList.remove('over'); drop(+e.dataTransfer.getData('text/plain'))};
    fold.append(b)});
}

/* ---------- station 5: names ---------- */
const QNAMES=[
 {q:'Wysyłasz CV do pracodawcy. Która nazwa pliku jest najlepsza?',o:['CV_Anna_Kowalska_2026.pdf','CV.docx','moje cv NOWE ostateczne.docx'],a:0,why:'PDF wygląda tak samo u każdego, a imię i nazwisko w nazwie pozwalają rekruterowi od razu znaleźć twój plik wśród dziesiątek innych.'},
 {q:'Faktura za prąd z marca 2026.',o:['Faktura_2026-03_Prad.pdf','faktura.pdf','skan001.pdf'],a:0,why:'Nazwa mówi, co to jest, za co i z kiedy. Za rok znajdziesz ją w kilka sekund.'},
 {q:'Która data w nazwie sprawi, że pliki same ułożą się po kolei?',o:['2026-03-15','15.03.2026','marzec 15'],a:0,why:'Zapis rok-miesiąc-dzień sortuje się poprawnie, bo komputer porównuje nazwy znak po znaku od lewej.'},
 {q:'Zdjęcie przodu dowodu osobistego do wniosku.',o:['Dowod_przod_2026.jpg','IMG_5521.jpg','dowód!!!.jpg'],a:0,why:'Opisowa nazwa bez wykrzykników. Przy wysyłaniu przez formularze bezpieczniej unikać polskich znaków i symboli.'},
 {q:'Umowa po podpisaniu podpisem zaufanym.',o:['Umowa_najmu_podpisana.pdf','Umowa_najmu.pdf','umowa (1).pdf'],a:0,why:'Dopisek „podpisana” odróżnia ją od wersji przed podpisem, którą też masz na dysku.'},
 {q:'List motywacyjny do firmy Kwiatek.',o:['List_motywacyjny_Kwiatek_Kowalska.pdf','list.docx','LIST MOTYWACYJNY.pdf'],a:0,why:'Nazwa firmy pomaga, gdy wysyłasz kilka listów, a nazwisko pomaga pracodawcy.'}
];

/* ---------- station 6: real or fake ---------- */
const mt=(title,body,btns,cls='')=>`<div class="mock ${cls}"><div class="mt">${title}</div><div class="mb">${body}</div>${btns?`<div class="mbtns">${btns}</div>`:''}</div>`;
const br=url=>`<span>◀ ▶ ⟳</span><span class="url">${url}</span>`;
const QFAKE=[
 {mock:mt('Ustawienia — Windows Update','Dostępne są aktualizacje. Uruchom ponownie urządzenie, aby dokończyć instalację.','<span class="mbtn">Zaplanuj ponowne uruchomienie</span><span class="mbtn pri">Uruchom ponownie teraz</span>'),q:'Komunikat w aplikacji Ustawienia.',o:['Bezpieczne','Pułapka'],a:0,fixed:1,why:'To prawdziwy Windows Update w Ustawieniach. Najlepiej zapisać pracę i uruchomić ponownie, albo zaplanować restart na wieczór.'},
 {mock:mt(br('microsoft-pomoc-24.support-alert.com'),'⚠ OSTRZEŻENIE MICROSOFT ⚠<br>Twój komputer został zablokowany z powodu wirusa.<br>Nie wyłączaj komputera! Zadzwoń: 800 XXX XXX','','scam'),q:'Strona w przeglądarce, z głośnym alarmem.',o:['Bezpieczne','Pułapka'],a:1,fixed:1,why:'Fałszywa pomoc techniczna. Microsoft nie wyświetla numerów telefonu na stronach. Zamknij kartę albo całą przeglądarkę — i nie dzwoń.'},
 {mock:mt(br('nagrody-dla-ciebie.win'),'🎉 Gratulacje! Jesteś milionowym odwiedzającym!<br>Wygrałeś nowy smartfon. Odbierz nagrodę w 60 sekund!','<span class="mbtn pri">Odbierz nagrodę</span>','prize'),q:'Wyskakujące okno na stronie.',o:['Bezpieczne','Pułapka'],a:1,fixed:1,why:'Nikt nie rozdaje telefonów przypadkowym odwiedzającym. Odliczanie czasu ma cię pośpieszyć. Celem jest wyłudzenie danych albo opłaty „za wysyłkę”.'},
 {mock:mt('Zabezpieczenia Windows','<b>Wykryto zagrożenie.</b><br>Program Microsoft Defender Antivirus znalazł zagrożenie i podjął działania.','<span class="mbtn">Pokaż szczegóły</span>'),q:'Powiadomienie systemowe w rogu ekranu.',o:['Bezpieczne','Pułapka'],a:0,fixed:1,why:'To prawdziwy antywirus wbudowany w Windows. Zagrożenie zostało już usunięte — możesz przeczytać szczegóły, nic nie musisz instalować ani nigdzie dzwonić.'},
 {mock:mt(br('szybkie-pobieranie.net/update'),'Twoja przeglądarka jest nieaktualna i niebezpieczna!<br>Pobierz aktualizację: <b>update_chrome.exe</b>','<span class="mbtn pri">Pobierz teraz</span>'),q:'Strona proponuje aktualizację przeglądarki.',o:['Bezpieczne','Pułapka'],a:1,fixed:1,why:'Przeglądarki aktualizują się same albo z własnego menu (Ustawienia → Informacje). Plik .exe z obcej strony to prawie na pewno złośliwy program.'},
 {mock:mt('Eksplorator plików','<b>USB (E:)</b><br>Wybierz, co ma się stać z wymiennymi dyskami.','<span class="mbtn">Otwórz folder, aby wyświetlić pliki</span>'),q:'Podłączyłeś swój własny pendrive.',o:['Bezpieczne','Pułapka'],a:0,fixed:1,why:'To zwykły komunikat Windows po podłączeniu pendrive’a. Uwaga dotyczy tylko nośników znalezionych albo od nieznanych osób.'},
 {mock:mt('Pobrane pliki','Plik <b>faktura_marzec.pdf.exe</b> może być niebezpieczny. Czy chcesz go zachować?','<span class="mbtn">Odrzuć</span><span class="mbtn">Zachowaj</span>'),q:'Przeglądarka ostrzega przy pobieraniu załącznika.',o:['Bezpieczne — zachowuję','Pułapka — odrzucam'],a:1,fixed:1,why:'Podwójne rozszerzenie .pdf.exe to klasyczne przebranie programu za dokument. Odrzuć plik.'},
 {mock:mt(br('najlepsze-przepisy-24.pl'),'<b>najlepsze-przepisy-24.pl</b> chce:<br>🔔 Pokazywać powiadomienia','<span class="mbtn">Blokuj</span><span class="mbtn pri">Zezwól</span>'),q:'Nieznana strona prosi o zgodę na powiadomienia.',o:['Zezwalam — to nic groźnego','Blokuję'],a:1,fixed:1,why:'Po zgodzie strona może zasypywać cię reklamami i fałszywymi alarmami, nawet gdy jest zamknięta. Na nieznanych stronach wybieraj „Blokuj”.'}
];

/* ---------- station 7: installer ---------- */
function stInstall(body){
  const restart=()=>stInstall(body);
  let custom=false; const ex={bar:true,home:true,opt:true,icon:true}; let offer=null;
  function frame(head,inner,foot){body.innerHTML='<p class="lead">Instalujesz darmowy odtwarzacz filmów. Przejdź przez instalator tak, żeby nie zainstalować niczego poza nim.</p>'; const i=h(`<div class="inst"><div class="ih">Instalator — Darmowy Odtwarzacz Wideo</div><div class="ib">${inner}</div><div class="if">${foot}</div></div>`); body.append(i); return i}
  function s1(){const i=frame('',`<h3 style="font-size:22px;margin-bottom:8px">Witamy w instalatorze</h3><p>Ten kreator zainstaluje Darmowy Odtwarzacz Wideo na twoim komputerze. Kliknij „Dalej”, aby kontynuować.</p>`,'<span></span><button class="ibtn">Dalej</button>'); i.querySelector('.ibtn').onclick=s2; i.querySelector('.ibtn').focus()}
  function s2(){const i=frame('',`<h3 style="font-size:20px;margin-bottom:8px">Wybierz typ instalacji</h3><label><input type="radio" name="t" value="e" checked><span><b>Ekspresowa (zalecana)</b><br>Najszybciej. Instaluje zalecane składniki.</span></label><label><input type="radio" name="t" value="c"><span><b>Niestandardowa (dla zaawansowanych)</b><br>Wybierz, co chcesz zainstalować.</span></label>`,'<span></span><button class="ibtn">Dalej</button>');
    i.querySelector('.ibtn').onclick=()=>{custom=i.querySelector('input:checked').value==='c'; custom?s3():s4()}}
  function s3(){const i=frame('',`<h3 style="font-size:20px;margin-bottom:8px">Składniki</h3><label><input type="checkbox" data-x="bar" checked><span>Zainstaluj pasek wyszukiwania SuperSzukacz</span></label><label><input type="checkbox" data-x="home" checked><span>Ustaw SuperSzukacz jako stronę startową i wyszukiwarkę</span></label><label><input type="checkbox" data-x="opt" checked><span>Zainstaluj OptymalizatorPC Pro (wersja próbna)</span></label><label><input type="checkbox" data-x="icon" checked><span>Utwórz skrót na pulpicie</span></label>`,'<span></span><button class="ibtn">Dalej</button>');
    i.querySelector('.ibtn').onclick=()=>{i.querySelectorAll('input').forEach(c=>ex[c.dataset.x]=c.checked); s4()}}
  function s4(){const i=frame('',`<div style="text-align:center"><p style="font-size:14px;color:#4A5370;margin:0 0 6px">Oferta specjalna dla ciebie</p><h3 style="font-size:24px">Antywirus Ultra — 30 dni za darmo!</h3><p>Chroń komputer już dziś. Po okresie próbnym 49,99 zł miesięcznie.</p><button class="green">Akceptuję</button></div>`,'<button class="tiny">Odrzuć</button><span></span>');
    i.querySelector('.green').onclick=()=>{offer=true;s5()}; i.querySelector('.tiny').onclick=()=>{offer=false;s5()}}
  function s5(){
    const got=[]; if(!custom||ex.bar) got.push('pasek SuperSzukacz'); if(!custom||ex.home) got.push('zmieniona strona startowa'); if(!custom||ex.opt) got.push('OptymalizatorPC Pro'); if(offer) got.push('płatna subskrypcja Antywirusa Ultra');
    let pts=(custom?7:0)+(custom&&!ex.bar?4:0)+(custom&&!ex.home?4:0)+(custom&&!ex.opt?4:0)+(offer?0:6);
    const msg=got.length?`Oprócz odtwarzacza zainstalowało się: ${got.join(', ')}. Wskazówki: wybieraj instalację niestandardową, odznaczaj dodatki, a przy ofertach szukaj małego przycisku „Odrzuć”. Skrót na pulpicie jest nieszkodliwy.`:'Zainstalowałeś tylko odtwarzacz. Instalacja niestandardowa, odznaczone dodatki i odrzucona oferta — dokładnie tak.';
    result(body,'instalator',pts,msg,restart)}
  s1();
}

/* ---------- station 8: settings ---------- */
const PATHS=['System → Ekran → Skala','Aplikacje → Aplikacje domyślne','Konta → Opcje logowania','Bluetooth i urządzenia → Drukarki i skanery','Aplikacje → Zainstalowane aplikacje','Personalizacja → Kolory','Windows Update','Czas i język → Język i region'];
const SQ=[['Tekst i ikony są za małe. Gdzie je powiększysz?',0,'Skala powiększa wszystko naraz: tekst, ikony i okna.'],
 ['Pliki PDF otwierają się w złym programie.',1,'W Aplikacjach domyślnych wybierasz, który program otwiera dany typ pliku.'],
 ['Chcesz logować się PIN-em albo odciskiem palca.',2,'Opcje logowania to Windows Hello: PIN, odcisk palca, rozpoznawanie twarzy.'],
 ['Kupiłeś nową drukarkę.',3,'Drukarki i skanery → Dodaj urządzenie. Większość drukarek Windows znajdzie sam.'],
 ['Chcesz odinstalować program, którego nie używasz.',4,'Zainstalowane aplikacje → trzy kropki przy programie → Odinstaluj.'],
 ['Chcesz włączyć tryb ciemny.',5,'W Personalizacji → Kolory wybierasz tryb jasny lub ciemny.'],
 ['Komputer prosi o aktualizacje, a ty chcesz sprawdzić, co się instaluje.',6,'Windows Update pokazuje dostępne aktualizacje i ich historię.'],
 ['Klawiatura pisze bez polskich znaków.',7,'W Język i region dodajesz układ „Polski (programisty)”, z którego korzysta większość osób w Polsce.']];
function qSettings(){return SQ.map(([q,a,why])=>{const others=shuffle(PATHS.map((p,k)=>k).filter(k=>k!==a)).slice(0,3); const idx=[a,...others]; return {q,o:idx.map(k=>PATHS[k]),a:0,why}})}

/* ---------- station 9: office ---------- */
const QGOV=[
 {q:'Gdzie jest wspólna strona logowania do usług publicznych?',o:['login.gov.pl','urzad-online.pl','gov-login.com'],a:0,why:'login.gov.pl to oficjalna strona logowania. Zawsze sprawdzaj, czy adres kończy się na gov.pl.'},
 {q:'Najszybszy sposób na założenie Profilu Zaufanego?',o:['Przez bankowość elektroniczną','Listem poleconym','SMS-em na numer 8080'],a:0,why:'Przez bank zajmuje to kilka minut i nie trzeba nigdzie iść.'},
 {q:'Który podpis jest bezpłatny i wystarcza w sprawach urzędowych?',o:['Podpis zaufany','Podpis kwalifikowany','Zeskanowany podpis odręczny'],a:0,why:'Podpis zaufany jest darmowy i działa razem z Profilem Zaufanym.'},
 {q:'Który podpis jest płatny i równoważny odręcznemu, także w umowach?',o:['Kwalifikowany','Zaufany','Osobisty'],a:0,why:'Kwalifikowany kupuje się u dostawcy certyfikatu. Przydaje się głównie w firmach.'},
 {q:'Czego potrzebujesz do podpisu osobistego?',o:['Dowodu osobistego z chipem (e-dowodu)','Karty płatniczej','Konta w banku'],a:0,why:'Podpis osobisty jest zapisany w e-dowodzie. Potrzebny jest czytnik albo telefon z NFC.'},
 {q:'Gdzie szukać ofert pracy z urzędów pracy?',o:['praca.gov.pl','podatki.gov.pl','eZUS'],a:0,why:'praca.gov.pl zbiera oferty i usługi urzędów pracy.'},
 {q:'Zgubiłeś dowód osobisty. Gdzie zgłosisz to online?',o:['gov.pl lub mObywatel','praca.gov.pl','Na stronie banku'],a:0,why:'Zgłoszenie utraty dowodu online od razu go unieważnia. Warto też zastrzec PESEL.'},
 {q:'Gdzie rozliczysz PIT przez internet?',o:['podatki.gov.pl','login-pit.com','praca.gov.pl'],a:0,why:'e-Urząd Skarbowy na podatki.gov.pl. Często PIT jest tam już wstępnie wypełniony.'}
];

/* ---------- registry ---------- */
const ST=[
 {id:'mysz',n:'Obsługa myszy',m:4,d:'Kliknięcie, dwuklik, menu prawego przycisku i przeciąganie.',run:stMouse},
 {id:'skroty',n:'Skróty klawiaturowe',m:6,d:'Wykonywanie poleceń skrótami z klawiszem Ctrl, na czas.',run:stKeys},
 {id:'win',n:'Skróty systemowe Windows',m:5,d:'Najważniejsze skróty z klawiszem Windows i Alt.',run:b=>quiz(b,'win',QWIN,{intro:'Skrótów z klawiszem Windows nie da się sprawdzić w przeglądarce, dlatego w tym ćwiczeniu wybierasz odpowiedź. Po zakończeniu wypróbuj je na komputerze.'})},
 {id:'pliki',n:'Porządkowanie plików',m:8,d:'Przenoszenie plików do właściwych folderów.',run:stFiles},
 {id:'nazwy',n:'Nazywanie plików',m:5,d:'Nazwy, które ułatwiają odnalezienie i wysyłanie dokumentów.',run:b=>quiz(b,'nazwy',QNAMES)},
 {id:'alarmy',n:'Rozpoznawanie fałszywych komunikatów',m:8,d:'Odróżnianie komunikatów systemu od prób oszustwa.',run:b=>quiz(b,'alarmy',QFAKE,{intro:'Zobaczysz osiem okien. Oceń, czy to zwykły komunikat, czy próba oszustwa.'})},
 {id:'instalator',n:'Bezpieczna instalacja programu',m:5,d:'Instalator z dodatkowymi programami i ofertami.',run:stInstall},
 {id:'ustawienia',n:'Ustawienia systemu',m:6,d:'Gdzie w Windows 11 znaleźć potrzebne opcje.',run:b=>quiz(b,'ustawienia',qSettings(),{intro:'Ścieżki w Ustawieniach Windows 11. Ustawienia otwierasz skrótem Win + I.'})},
 {id:'urzad',n:'Usługi urzędowe online',m:6,d:'Logowanie, Profil Zaufany, podpisy i serwisy publiczne.',run:b=>quiz(b,'urzad',QGOV)}
];


function nextId(id){const k=ST.findIndex(s=>s.id===id); return ST[k+1]?ST[k+1].id:null}
function totals(){const v=Object.values(state.best); return {pts:v.reduce((a,b)=>a+b,0), n:v.length}}
function renderDesktop(){
  const ul=$('#navlist'); ul.innerHTML='';
  ST.forEach((s,k)=>{const sc=state.best[s.id];
    const li=h(`<li><button class="nav" data-id="${s.id}"><span class="n">${k+1}. ${s.n}</span><span class="m">ok. ${s.m} min</span><span class="s${sc!=null?' done':''}">${sc!=null?sc+' / 25':'—'}</span></button></li>`);
    const b=li.querySelector('button'); if(current===s.id) b.setAttribute('aria-current','true'); b.onclick=()=>openStation(s.id); ul.append(li)});
  $('#nav-intro').toggleAttribute('aria-current',current==='intro'); if(current==='intro') $('#nav-intro').setAttribute('aria-current','true');
  $('#nav-sum').toggleAttribute('aria-current',current==='sum'); if(current==='sum') $('#nav-sum').setAttribute('aria-current','true');
  const t=totals(); $('#pts').textContent=`${t.pts} / 225 pkt`; $('#cnt').textContent=`${t.n} z ${ST.length} ćwiczeń`; $('#barfill').style.width=(t.pts/225*100)+'%';
}
function setPanel(id){if(cleanup){cleanup();cleanup=null} current=id; renderDesktop(); const p=$('#panel'); p.innerHTML=''; return p}
function focusPanel(){const p=$('#panel'); const t=p.querySelector('h2'); if(t){t.setAttribute('tabindex','-1'); t.focus({preventScroll:true})} if(window.innerWidth<=860) p.scrollIntoView({block:'start'})}
function openStation(id){
  const s=ST.find(x=>x.id===id); const p=setPanel(id);
  p.append(h(`<h2>${s.n}</h2>`)); p.append(h(`<p class="desc">${s.d} Czas: ok. ${s.m} min. Maksymalnie 25 pkt.</p>`));
  const body=h('<div></div>'); p.append(body); s.run(body); focusPanel();
}
function showIntro(){
  const p=setPanel('intro');
  p.innerHTML=`<h2>Wprowadzenie</h2>
  <p class="desc">Dziewięć krótkich ćwiczeń utrwalających materiał z modułu 1. Całość zajmuje około godziny.</p>
  <p>Ćwiczenia można wykonywać w dowolnej kolejności i powtarzać, aby poprawić wynik. Za każde można uzyskać do 25 punktów, łącznie 225. Wyniki zapisują się w tej przeglądarce i są widoczne w podsumowaniu.</p>
  <p>Część ćwiczeń pokazuje realistyczne okna programów i stron internetowych. To symulacje: nic nie jest instalowane, pobierane ani wysyłane.</p>
  <div class="row"><button class="btn" id="go">Rozpocznij pierwsze ćwiczenie</button></div>
  <details><summary>Informacje dla prowadzącego</summary><ol>
    <li>Ćwiczenia 1–3 (ok. 15 min): wspólnie, tempo dla całej grupy.</li>
    <li>Ćwiczenia 4–5 i 8 (ok. 20 min): praca samodzielna.</li>
    <li>Ćwiczenia 6–7 i 9 (ok. 20 min): praca samodzielna, potem omówienie pułapek na forum.</li>
    <li>Ostatnie 5 minut: przegląd podsumowania wyników i pytania.</li>
  </ol></details>`;
  p.querySelector('#go').onclick=()=>openStation(ST[0].id); focusPanel();
}
function showSummary(){
  const p=setPanel('sum'); const t=totals();
  const rows=ST.map((s,k)=>`<tr><td>${k+1}. ${s.n}</td><td>${state.best[s.id]!=null?state.best[s.id]+' / 25':'nie wykonano'}</td></tr>`).join('');
  p.innerHTML=`<h2>Podsumowanie wyników</h2><p class="desc">Wykonane ćwiczenia: ${t.n} z ${ST.length}. Liczy się najlepszy wynik z każdego ćwiczenia.</p>
  <table class="sum"><thead><tr><th>Ćwiczenie</th><th>Wynik</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td>Razem</td><td>${t.pts} / 225</td></tr></tfoot></table>
  <div class="row"><button class="btn alt" id="reset">Wyczyść wyniki</button></div>`;
  let armed=false; const r=p.querySelector('#reset');
  r.onclick=()=>{if(!armed){armed=true; r.textContent='Potwierdź wyczyszczenie wyników'; setTimeout(()=>{armed=false; r.textContent='Wyczyść wyniki'},4000); return}
    state.best={}; save(); showSummary()};
  focusPanel();
}
$('#nav-intro').onclick=showIntro; $('#nav-sum').onclick=showSummary;
showIntro();
