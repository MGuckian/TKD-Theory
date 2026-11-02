// Course shell, served as its own page (course/index.html). Uses the course's own copies of
// the deck and answer checking (deck.js, lib.js). All progress lives under COURSE.storageKey;
// nothing is shared with the flashcard app.
//
// Design for short attention and older eyes: one clear next step, 12-minute micro-lessons,
// questions straight after each idea, whole-list recall, answers spoken aloud and recorded,
// listen mode, large text, spaced rechecks at 7 and 28 days, and a weekly task in the dojang.
var Course = (function(){
  var cs = null;            // course state
  var cv = {name:"home"};   // current view
  var quiz = null;          // active question run (check step, review, checkpoint, recheck)
  var CARD = {};            // id -> card (deck copy + course-only cards)
  var REVIEW_SIZE = 12;
  var RECHECK_DAYS = [7, 28];
  var CRITERIA = [
    {k:"acc", name:"Accuracy", help:"Facts match the book"},
    {k:"comp", name:"Completeness", help:"All the key points"},
    {k:"term", name:"Terminology", help:"Correct Korean and technical terms"},
    {k:"teach", name:"Teaching clarity", help:"A colour belt could follow it"}
  ];

  // ---------- storage ----------
  function defaultCS(){
    return {v:2, startDate:null, lastReview:null, streak:0, lastDate:null,
      settings:{size:"l", theme:"dark", rate:0.85, autoKorean:true},
      cards:{}, dumps:{}, lessons:{}, tasks:{}, classLog:{}, checkpoints:{}, rechecks:{}, viva:[]};
  }
  function loadCS(cb){
    function parse(raw){
      var base = defaultCS();
      if(!raw) return base;
      try{
        var p = JSON.parse(raw);
        Object.keys(base).forEach(function(k){ if(p[k] !== undefined) base[k] = p[k]; });
        var d = defaultCS().settings; Object.keys(d).forEach(function(k){ if(base.settings[k] === undefined) base.settings[k] = d[k]; });
      }catch(e){}
      return base;
    }
    if(window.storage){
      window.storage.get(COURSE.storageKey, false).then(function(res){ cb(parse(res && res.value)); }).catch(function(){ cb(defaultCS()); });
      return;
    }
    var raw = null;
    try{ raw = window.localStorage.getItem(COURSE.storageKey); }catch(e){}
    cb(parse(raw));
  }
  function saveCS(){
    var s = JSON.stringify(cs);
    if(window.storage){ window.storage.set(COURSE.storageKey, s, false).catch(function(){}); return; }
    try{ window.localStorage.setItem(COURSE.storageKey, s); }catch(e){}
  }
  function applySettings(){
    var h = document.documentElement;
    h.classList.toggle("size-xl", cs.settings.size === "xl");
    h.classList.toggle("theme-paper", cs.settings.theme === "paper");
  }

  // ---------- content helpers ----------
  function builtModules(){ return COURSE.modules.filter(function(m){ return !!COURSE.content[m.id] && !!COURSE.content[m.id].lessons; }); }
  function content(mid){ return COURSE.content[mid]; }
  function findLesson(lid){
    var mods = builtModules();
    for(var i=0;i<mods.length;i++){
      var ls = content(mods[i].id).lessons;
      for(var j=0;j<ls.length;j++){ if(ls[j].id===lid) return {module:mods[i], lesson:ls[j], index:j}; }
    }
    return null;
  }
  function findList(id){
    var mods = builtModules();
    for(var i=0;i<mods.length;i++){ var l = content(mods[i].id).lists; if(l && l[id]) return l[id]; }
    return null;
  }
  function indexCards(){
    CARD = {};
    DATA.forEach(function(c){ CARD[c.id] = c; });
    builtModules().forEach(function(m){ (content(m.id).cards||[]).forEach(function(c){ CARD[c.id] = c; }); });
  }
  // Card as shown in the course: source ref and root-based hook overrides applied.
  function courseCard(id){
    var base = CARD[id]; if(!base) return null;
    var c = {}; for(var k in base){ if(base.hasOwnProperty(k)) c[k] = base[k]; }
    builtModules().forEach(function(m){
      var ct = content(m.id);
      if(ct.hookOverrides && ct.hookOverrides[id]) c.hook = ct.hookOverrides[id];
      if(!c.ref && ct.refs && ct.refs[id]) c.ref = ct.refs[id];
    });
    return c;
  }
  function pool(){ return Object.keys(CARD).map(function(k){ return CARD[k]; }); }
  function addDays(iso, n){ var d = new Date(iso+"T00:00:00"); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); }
  function fmtDate(iso){
    var d = new Date(iso+"T00:00:00");
    return d.getDate()+" "+["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
  }
  function shuffle(a){ a = a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }

  // ---------- spaced repetition (same intervals as the flashcard app) ----------
  function getProg(id){ return cs.cards[id] || {box:0, due:todayISO()}; }
  // A miss is already repeated at the end of the same set, so it comes back tomorrow, not today.
  function bumpBox(p, correct){
    var box = correct ? Math.min((p ? p.box : 0)+1, BOX_INTERVALS.length-1) : 0;
    return {box:box, due:addDays(todayISO(), Math.max(1, BOX_INTERVALS[box]))};
  }
  function commit(card, correct){ cs.cards[card.id] = bumpBox(cs.cards[card.id], correct); saveCS(); }
  function commitDump(listId, got, total){
    var prev = cs.dumps[listId], p = bumpBox(prev, got === total);
    p.last = got; p.total = total; p.best = Math.max(got, prev && prev.best || 0);
    cs.dumps[listId] = p; saveCS();
  }
  function bumpStreak(){
    var today = todayISO();
    if(cs.lastDate === today) return;
    var wasYesterday = cs.lastDate && daysBetween(cs.lastDate, today) === 1;
    cs.streak = wasYesterday ? cs.streak+1 : 1;
    cs.lastDate = today;
    saveCS();
  }

  // Course mastery of one card: 0, 0.5 after one correct answer, 1 once correct on two days.
  function cardMastery(id){ var b = getProg(id).box; return b >= 2 ? 1 : (b === 1 ? 0.5 : 0); }
  function masteryOf(ids){
    ids = ids.filter(function(id){ return CARD[id]; });
    if(!ids.length) return 0;
    var s = 0; ids.forEach(function(id){ s += cardMastery(id); });
    return Math.round(s/ids.length*100);
  }
  function moduleCardIds(mid){
    var seen = {}, out = [];
    content(mid).outcomes.forEach(function(o){ o.cards.forEach(function(id){ if(!seen[id] && CARD[id]){ seen[id]=1; out.push(id); } }); });
    return out;
  }
  function moduleMastery(mid){ return masteryOf(moduleCardIds(mid)); }
  function lessonState(lid){ if(!cs.lessons[lid]) cs.lessons[lid] = {step:0, done:false, ok:{}}; if(!cs.lessons[lid].ok) cs.lessons[lid].ok = {}; return cs.lessons[lid]; }
  function lessonDone(lid){ return !!(cs.lessons[lid] && cs.lessons[lid].done); }
  function taskKey(lid, i){ return lid+":"+i; }
  function explainTasks(mid){
    var out = [];
    content(mid).lessons.forEach(function(l){ l.steps.forEach(function(s, i){ if(s.type==="say" && s.kind==="Explain it") out.push(taskKey(l.id, i)); }); });
    return out;
  }
  function explainsDone(mid){ return explainTasks(mid).every(function(k){ return cs.tasks[k] && cs.tasks[k].done; }); }
  function gate(mid){
    var m = moduleMastery(mid), ex = explainsDone(mid), cp = cs.checkpoints[mid] ? cs.checkpoints[mid].best : null;
    return {mastery:m, explains:ex, checkpoint:cp, met: m >= COURSE.gate.mastery && ex && cp !== null && cp >= COURSE.gate.checkpoint};
  }
  function moduleUnlocked(mid){
    var idx = -1; COURSE.modules.forEach(function(m,i){ if(m.id===mid) idx=i; });
    if(idx <= 0) return true;
    var prev = COURSE.modules[idx-1];
    return !!content(prev.id) && gate(prev.id).met;
  }
  function allLessonsDone(mid){ return content(mid).lessons.every(function(l){ return lessonDone(l.id); }); }
  function moduleFinishedDate(mid){
    if(!allLessonsDone(mid)) return null;
    var d = null; content(mid).lessons.forEach(function(l){ var x = cs.lessons[l.id].doneDate; if(x && (!d || x > d)) d = x; });
    return d || todayISO();
  }

  // Cards and lists introduced so far: from check and dump steps the learner has passed.
  function introduced(){
    var cards = [], lists = [], seenC = {}, seenL = {};
    builtModules().forEach(function(m){
      content(m.id).lessons.forEach(function(l){
        var ls = cs.lessons[l.id]; if(!ls || !ls.ok) return;
        l.steps.forEach(function(s, i){
          if(!ls.ok[i]) return;
          if(s.type==="check") s.cards.forEach(function(id){ if(!seenC[id] && CARD[id]){ seenC[id]=1; cards.push(id); } });
          if(s.type==="dump" && !seenL[s.list]){ seenL[s.list]=1; lists.push(s.list); }
        });
      });
    });
    return {cards:cards, lists:lists};
  }
  function dueCards(){ var t = todayISO(); return introduced().cards.filter(function(id){ return getProg(id).due <= t; }); }
  function dueLists(){ var t = todayISO(); return introduced().lists.filter(function(id){ return cs.dumps[id] && cs.dumps[id].due <= t; }); }
  function dueRecheck(){
    var t = todayISO(), out = null;
    builtModules().forEach(function(m){
      var f = moduleFinishedDate(m.id); if(!f || out) return;
      RECHECK_DAYS.forEach(function(d){ var k = m.id+":"+d; if(!out && !cs.rechecks[k] && addDays(f, d) <= t) out = {mid:m.id, days:d, key:k}; });
    });
    return out;
  }

  // ---------- weekly plan ----------
  function weeks(){
    var out = [], w = 1;
    COURSE.modules.forEach(function(m){
      var ct = content(m.id);
      for(var i=0;i<m.weeks;i++){
        var lessons = ct && ct.lessons ? ct.lessons.filter(function(l){ return l.week === i+1; }) : [];
        var task = ct && ct.classTasks ? ct.classTasks.filter(function(t){ return t.week === i+1; })[0] : null;
        out.push({week:w++, module:m, weekInModule:i+1, lessons:lessons, task:task});
      }
    });
    for(var c=0;c<COURSE.capstone.weeks;c++) out.push({week:w++, capstone:true, weekInModule:c+1, lessons:[]});
    return out;
  }
  function currentWeek(){
    var n = Math.floor(daysBetween(cs.startDate, todayISO())/7)+1;
    return Math.max(1, Math.min(n, weeks().length));
  }
  function paceNote(){
    var cw = currentWeek(), due = 0, done = 0, thisWeek = 0;
    weeks().forEach(function(w){ w.lessons.forEach(function(l){
      if(w.week < cw) due++;
      if(w.week === cw && !lessonDone(l.id)) thisWeek++;
      if(lessonDone(l.id)) done++;
    }); });
    if(done < due) return (due-done)+" lesson"+(due-done===1?"":"s")+" behind plan";
    return thisWeek ? "On track · "+thisWeek+" short lesson"+(thisWeek===1?"":"s")+" left this week" : "On track";
  }
  function classKey(w){ return w.module.id+":w"+w.weekInModule; }

  // ---------- next step ----------
  function nextLesson(){
    var mods = builtModules();
    for(var i=0;i<mods.length;i++){
      var m = mods[i]; if(!moduleUnlocked(m.id)) return null;
      var ls = content(m.id).lessons;
      for(var j=0;j<ls.length;j++){ if(!lessonDone(ls[j].id)) return {module:m, lesson:ls[j]}; }
    }
    return null;
  }
  function nextStep(){
    var dc = dueCards().length, dl = dueLists().length;
    if((dc || dl) && cs.lastReview !== todayISO()){
      var n = Math.min(dc, REVIEW_SIZE);
      return {label:"Today's review", detail:n+" question"+(n===1?"":"s")+(dl?" + one list from memory":"")+" · about "+Math.max(3, Math.round(n*0.5+(dl?2:0)))+" min", go:startReview};
    }
    var rc = dueRecheck();
    if(rc) return {label:"Module "+moduleOf(rc.mid).n+" recheck", detail:rc.days+"-day check that it has stuck · about 6 min", go:function(){ startRecheck(rc); }};
    var nl = nextLesson();
    if(nl){
      var ls = cs.lessons[nl.lesson.id], at = ls ? ls.step : 0;
      return {label:"Lesson "+nl.lesson.n+": "+nl.lesson.title, detail:(at>0 ? "Carry on from step "+(at+1)+" of "+(nl.lesson.steps.length+1) : "About "+nl.lesson.mins+" minutes"), go:function(){ openLesson(nl.lesson.id); }};
    }
    var mods = builtModules();
    for(var i=0;i<mods.length;i++){
      var m = mods[i], g = gate(m.id);
      if(!moduleUnlocked(m.id) || g.met) continue;
      if(g.mastery < COURSE.gate.mastery) return {label:"Firm up Module "+m.n, detail:"Mastery "+g.mastery+"% of "+COURSE.gate.mastery+"% · a card counts once it's right on two separate days", go:function(id){ return function(){ startWeakest(id); }; }(m.id)};
      if(!g.explains) return {label:"Finish the Explain tasks", detail:"Open the course map to see which", go:function(){ show({name:"map"}); }};
      return {label:"Module "+m.n+" checkpoint", detail:content(m.id).checkpoint.size+" questions · aim for "+COURSE.gate.checkpoint+"%", go:function(id){ return function(){ startCheckpoint(id); }; }(m.id)};
    }
    if(dc || dl) return {label:"Extra review", detail:dc+" questions due", go:startReview};
    return {label:"Viva practice", detail:"Next modules are being built. Rehearse what you know.", go:function(){ show({name:"viva"}); }};
  }
  function moduleOf(mid){ for(var i=0;i<COURSE.modules.length;i++){ if(COURSE.modules[i].id===mid) return COURSE.modules[i]; } return null; }

  // ---------- speech ----------
  var speaking = false;
  function speakQueue(texts, lang){
    if(!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    speaking = true;
    texts.forEach(function(t, i){
      var u = new SpeechSynthesisUtterance(t);
      u.lang = lang || "en-GB"; u.rate = lang === "ko-KR" ? 0.75 : cs.settings.rate;
      if(lang === "ko-KR"){ var vs = window.speechSynthesis.getVoices(), ko = vs.find(function(v){ return v.lang && v.lang.indexOf("ko") === 0; }); if(ko) u.voice = ko; }
      if(i === texts.length-1) u.onend = function(){ speaking = false; var b = document.getElementById("c-listen"); if(b) b.innerHTML = listenLabel(b.getAttribute("data-label")); };
      window.speechSynthesis.speak(u);
    });
  }
  function stopSpeech(){ speaking = false; if("speechSynthesis" in window) window.speechSynthesis.cancel(); }
  function listenLabel(l){ return speaking ? "&#9632; Stop" : "&#128266; "+l; }
  function readText(s){ var dg = s.diagram ? DIAGRAMS.get(s.diagram) : null; return [s.title+".", s.body.join(" "), s.picture ? "Picture it. "+s.picture : "", dg ? dg.narration : ""].filter(Boolean); }

  // ---------- recording (answers said aloud) ----------
  var rec = {stream:null, recorder:null, chunks:[], urls:{}, state:"idle", key:null, secs:0, timer:null};
  function canRecord(){ return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder); }
  function startRecording(key, secs){
    navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){
      rec.stream = stream; rec.chunks = []; rec.key = key;
      rec.recorder = new MediaRecorder(stream);
      rec.recorder.ondataavailable = function(e){ if(e.data.size) rec.chunks.push(e.data); };
      rec.recorder.onstop = function(){
        var url = URL.createObjectURL(new Blob(rec.chunks, {type: rec.recorder.mimeType || "audio/webm"}));
        (rec.urls[key] = rec.urls[key] || []).push(url);
        stream.getTracks().forEach(function(t){ t.stop(); });
        rec.state = "idle"; markSaid(key); render();
      };
      rec.recorder.start(); rec.state = "recording"; rec.secs = secs || 90;
      clearInterval(rec.timer);
      rec.timer = setInterval(function(){
        rec.secs--; var o = document.getElementById("c-rec-time");
        if(o) o.textContent = clock(rec.secs);
        if(rec.secs <= 0) stopRecording();
      }, 1000);
      render();
    }).catch(function(){ rec.state = "denied"; render(); });
  }
  function stopRecording(){ clearInterval(rec.timer); if(rec.recorder && rec.state === "recording") rec.recorder.stop(); }
  function clock(s){ s = Math.max(0, s); return Math.floor(s/60)+":"+("0"+(s%60)).slice(-2); }
  function markSaid(key){
    if(key.indexOf("viva:") === 0){ cv.said = true; return; }
    var t = cs.tasks[key] || (cs.tasks[key] = {ticks:[], said:false, revealed:false, done:false});
    t.said = true; saveCS();
  }
  function recorderHTML(key, secs){
    var urls = rec.urls[key] || [];
    var html = '<div class="c-rec">';
    if(rec.state === "recording" && rec.key === key){
      html += '<button class="c-recbtn on" id="c-rec-stop"><span class="c-dotrec"></span> Stop recording</button><span class="c-rec-time" id="c-rec-time">'+clock(rec.secs)+'</span>';
    } else if(canRecord() && rec.state !== "denied"){
      html += '<button class="c-recbtn" id="c-rec-start" data-key="'+key+'" data-secs="'+secs+'"><span class="c-dotrec"></span> '+(urls.length?'Record again':'Record your answer')+'</button>';
    } else {
      html += '<p class="c-sub">'+(rec.state==="denied"?"Microphone not allowed, so just say it aloud.":"Say it out loud, as if to an examiner.")+'</p>'+
        '<button class="btn-ghost" id="c-said" data-key="'+key+'">I\'ve said it out loud</button>';
    }
    urls.forEach(function(u, i){ html += '<div class="c-take"><span class="c-sub">Take '+(i+1)+'</span><audio controls src="'+u+'"></audio></div>'; });
    return html+'</div>';
  }

  // ---------- small UI helpers ----------
  function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;"); }
  function bar(pct){ return '<div class="c-bar"><div style="width:'+pct+'%"></div></div>'; }
  function refTag(ref){ return ref ? '<span class="c-ref">'+esc(ref)+'</span>' : ''; }
  function topNav(title, backTo){
    var back = backTo === "none" ? '<span></span>' : '<button class="c-link" data-go="'+(backTo||"home")+'">&larr; Back</button>';
    return '<div class="c-top">'+back+'<div class="eyebrow">'+esc(title)+'</div><button class="c-link" data-go="settings" aria-label="Settings">Aa</button></div>';
  }
  function show(v){ stopSpeech(); stopRecording(); cv = v; window.scrollTo(0,0); render(); }

  // ---------- home ----------
  function renderHome(){
    var ns = nextStep(), cw = currentWeek(), total = weeks().length, wk = weeks()[cw-1];
    var streak = cs.streak > 0 && cs.lastDate && daysBetween(cs.lastDate, todayISO()) <= 1 ? cs.streak : 0;
    var html = topNav("4th Dan theory course","none")+
      '<div class="c-week">Week '+cw+' of '+total+' · '+esc(paceNote())+(streak ? ' · '+streak+' day streak' : '')+'</div>'+
      '<div class="card c-next"><div class="eyebrow c-acc">Your next step</div>'+
        '<div class="voice c-next-title">'+esc(ns.label)+'</div>'+
        '<div class="c-sub">'+esc(ns.detail)+'</div>'+
        '<button id="c-next-go" class="btn-primary c-big-btn">Start</button></div>';
    if(wk && wk.task){
      var log = cs.classLog[classKey(wk)];
      html += '<div class="card c-class"><div class="eyebrow c-acc">This week in the dojang</div><p>'+esc(wk.task.task)+'</p>'+
        (log && log.done ? '<div class="c-sub">Done · '+esc(log.rating)+(log.note?' · '+esc(log.note):'')+'</div>'
          : '<div class="c-sub" style="margin-top:6px;">How did it go?</div><div class="c-row">'+
            ['Went well','OK','Hard'].map(function(r){ return '<button class="chip c-classrate" data-rate="'+r+'">'+r+'</button>'; }).join("")+'</div>')+
        '</div>';
    }
    html += '<div class="c-grid">'+
      '<button class="c-tile" data-go="map"><b>Course map</b><span>All lessons</span></button>'+
      '<button class="c-tile" data-go="plan"><b>Weekly plan</b><span>6 short lessons a week</span></button>'+
      '<button class="c-tile" id="c-listen-recap"><b>&#128266; Listen</b><span>Recap of what you\'ve learned</span></button>'+
      '<button class="c-tile" data-go="viva"><b>Viva practice</b><span>Answer out loud</span></button>'+
      '<a class="c-tile" href="print.html" target="_blank" rel="noopener"><b>&#128424; Printables</b><span>Sheets for the fridge and dojang bag</span></a>'+
      '<button class="c-tile" data-go="outcomes"><b>My progress</b><span>By learning outcome</span></button>'+
    '</div>';
    builtModules().forEach(function(m){
      html += '<div class="c-h">Module '+m.n+': '+esc(m.title)+'</div>';
      content(m.id).outcomes.forEach(function(o){
        var p = masteryOf(o.cards);
        html += '<div class="c-orow"><div class="c-otext">'+esc(o.text)+'</div><div class="c-omini">'+bar(p)+'<span>'+p+'%</span></div></div>';
      });
    });
    return '<div class="fade-in">'+html+'</div>';
  }

  function recapTexts(){
    var out = [];
    builtModules().forEach(function(m){
      content(m.id).lessons.forEach(function(l){ if(lessonDone(l.id)) out.push({d:cs.lessons[l.id].doneDate||"", t:"Lesson "+l.n+", "+l.title+". "+l.summary.join(" ")}); });
    });
    out.sort(function(a,b){ return a.d < b.d ? 1 : -1; });
    return out.slice(0, 6).map(function(x){ return x.t; });
  }

  // ---------- map, plan, outcomes, settings ----------
  function renderMap(){
    var html = topNav("Course map");
    COURSE.modules.forEach(function(m){
      var ct = content(m.id), built = ct && ct.lessons, unlocked = moduleUnlocked(m.id);
      html += '<div class="card c-mod'+(built?'':' c-dim')+'">'+
        '<div class="eyebrow">Module '+m.n+' · '+m.weeks+' weeks</div>'+
        '<div class="voice c-mod-title">'+esc(m.title)+'</div><div class="c-sub">'+esc(m.blurb)+'</div>';
      if(!built){ html += '<div class="c-sub" style="margin-top:8px;">Being built</div></div>'; return; }
      var g = gate(m.id);
      html += '<div class="c-gate">'+
        '<span class="'+(g.mastery>=COURSE.gate.mastery?'ok':'')+'">Mastery '+g.mastery+'%</span>'+
        '<span class="'+(g.explains?'ok':'')+'">Explain tasks '+(g.explains?'done':'to do')+'</span>'+
        '<span class="'+(g.checkpoint!==null&&g.checkpoint>=COURSE.gate.checkpoint?'ok':'')+'">Checkpoint '+(g.checkpoint===null?'not taken':g.checkpoint+'%')+'</span></div>';
      var lastWeek = 0;
      ct.lessons.forEach(function(l){
        if(l.week !== lastWeek){ lastWeek = l.week; html += '<div class="c-wkh">Week '+l.week+'</div>'; }
        var done = lessonDone(l.id);
        html += '<button class="c-lesson'+(unlocked?'':' c-dim')+'" data-lesson="'+l.id+'"'+(unlocked?'':' disabled')+'>'+
          '<span class="c-tick'+(done?' on':'')+'">'+(done?'&#10003;':l.n)+'</span><span class="c-ltitle">'+esc(l.title)+'</span></button>';
      });
      html += '<button class="btn-ghost" data-checkpoint="'+m.id+'" style="margin-top:12px;"'+(unlocked?'':' disabled')+'>Module checkpoint</button></div>';
    });
    html += '<div class="card c-mod c-dim"><div class="eyebrow">'+COURSE.capstone.weeks+' weeks</div><div class="voice c-mod-title">'+esc(COURSE.capstone.title)+'</div></div>';
    return '<div class="fade-in">'+html+'</div>';
  }

  function renderPlan(){
    var cw = currentWeek(), rows = "";
    weeks().forEach(function(w){
      var start = addDays(cs.startDate, (w.week-1)*7);
      var title = w.capstone ? "Capstone · revision and viva" : "Module "+w.module.n+": "+w.module.title;
      var items = w.lessons.length
        ? w.lessons.map(function(l){ return '<div class="c-pl'+(lessonDone(l.id)?' ok':'')+'">'+(lessonDone(l.id)?'&#10003; ':'&#9675; ')+l.n+' '+esc(l.title)+'</div>'; }).join("")
        : '<div class="c-pl c-dim">'+(w.capstone ? "Viva rehearsals and mixed review" : "Lessons not built yet")+'</div>';
      if(w.task) items += '<div class="c-pl c-acc">&#9733; In the dojang: '+esc(w.task.task)+'</div>';
      rows += '<div class="c-wk'+(w.week===cw?' now':'')+'"><div class="c-wk-h"><b>Week '+w.week+'</b><span>'+fmtDate(start)+'</span></div>'+
        '<div class="c-sub">'+esc(title)+'</div>'+items+'</div>';
    });
    return '<div class="fade-in">'+topNav("Weekly plan")+
      '<p class="c-sub" style="margin:6px 0 12px;">Most days: one 12-minute lesson plus a few minutes of review. Once a week: one task in your own class.</p>'+
      '<label class="c-sub" for="c-start">Course start date</label>'+
      '<input type="date" id="c-start" class="c-date" value="'+cs.startDate+'">'+rows+'</div>';
  }

  function renderOutcomes(){
    var html = topNav("My progress");
    builtModules().forEach(function(m){
      var ct = content(m.id);
      html += '<div class="c-h">Module '+m.n+': '+esc(m.title)+'</div>';
      ct.outcomes.forEach(function(o){
        var ids = o.cards.filter(function(id){ return CARD[id]; });
        var p = masteryOf(ids), secure = ids.filter(function(id){ return cardMastery(id)===1; }).length;
        html += '<div class="card c-oc"><div class="c-otext">'+esc(o.text)+'</div>'+bar(p)+
          '<div class="c-sub">'+p+'% · '+secure+' of '+ids.length+' facts secure</div></div>';
      });
      var lists = Object.keys(ct.lists||{});
      html += '<div class="c-h">Lists from memory</div>';
      lists.forEach(function(id){
        var d = cs.dumps[id], L = ct.lists[id];
        html += '<div class="c-orow"><div class="c-otext">'+esc(L.title)+'</div><div class="c-sub">'+(d ? 'best '+d.best+'/'+L.items.length : 'not yet')+'</div></div>';
      });
      var log = (ct.classTasks||[]).map(function(t){ var l = cs.classLog[m.id+":w"+t.week]; return '<div class="c-orow"><div class="c-otext">Week '+t.week+': '+esc(t.task)+'</div><div class="c-sub">'+(l&&l.done?esc(l.rating):'to do')+'</div></div>'; }).join("");
      if(log) html += '<div class="c-h">In the dojang</div>'+log;
    });
    return '<div class="fade-in">'+html+'</div>';
  }

  function renderSettings(){
    var s = cs.settings;
    function opt(key, val, label){ return '<button class="chip c-set'+(s[key]===val?' active':'')+'" data-set="'+key+'" data-val="'+val+'">'+label+'</button>'; }
    return '<div class="fade-in">'+topNav("Settings")+
      '<div class="card"><div class="c-setrow"><b>Text size</b><div class="c-row">'+opt("size","l","Large")+opt("size","xl","Extra large")+'</div></div>'+
      '<div class="c-setrow"><b>Colours</b><div class="c-row">'+opt("theme","dark","Dark")+opt("theme","paper","Paper (light)")+'</div></div>'+
      '<div class="c-setrow"><b>Reading voice</b><div class="c-row">'+opt("rate",0.85,"Slower")+opt("rate",1,"Normal")+'</div></div>'+
      '<div class="c-setrow"><b>Say Korean terms aloud after answering</b><div class="c-row">'+opt("autoKorean",true,"On")+opt("autoKorean",false,"Off")+'</div></div></div></div>';
  }

  // ---------- lesson player ----------
  function openLesson(lid){ lessonState(lid); saveCS(); quiz = null; show({name:"lesson", lid:lid}); }

  function renderLesson(){
    var f = findLesson(cv.lid), l = f.lesson, ls = lessonState(l.id);
    var idx = ls.step, n = l.steps.length+1;
    var dots = ""; for(var i=0;i<n;i++) dots += '<span class="c-dot'+(i<idx?' done':(i===idx?' now':''))+'"></span>';
    var head = '<div class="c-top"><button class="c-link" data-go="home">&larr; Home</button><div class="c-dots">'+dots+'</div><span class="c-sub">'+(idx+1)+'/'+n+'</span></div>'+
      '<div class="eyebrow" style="margin-top:14px;">Lesson '+l.n+' · '+esc(l.title)+'</div>';
    if(idx >= l.steps.length) return '<div class="fade-in">'+head+renderLessonDone(l, f.module)+'</div>';
    var s = l.steps[idx], body = "", ok = s.type === "read" || !!ls.ok[idx];
    if(s.type === "read") body = renderRead(l, s, idx);
    else if(s.type === "guess") body = renderGuess(l, s, idx);
    else if(s.type === "check") body = renderCheck(l, s, idx);
    else if(s.type === "dump") body = renderDump(s.list, "lesson");
    else if(s.type === "say") body = renderSay(l, s, idx);
    ok = s.type === "read" || !!ls.ok[idx];
    var label = ok ? "Next" : ({guess:"Pick an answer to go on", check:"Answer the questions to go on", dump:"Check your list to go on", say:"Mark it complete to go on"})[s.type];
    var nav = '<div class="c-nav">'+(idx>0 ? '<button class="btn-ghost c-back" id="c-prev">Back</button>' : '')+
      '<button class="btn-primary" id="c-nextstep"'+(ok?'':' disabled')+'>'+label+'</button></div>';
    return '<div class="fade-in">'+head+body+nav+'</div>';
  }

  function renderRead(l, s, idx){
    var dg = s.diagram ? DIAGRAMS.get(s.diagram) : null;
    var listen = ("speechSynthesis" in window) ? '<button class="c-link" id="c-listen" data-label="Listen">'+listenLabel("Listen")+'</button>' : '';
    var video = (idx === 0 || (idx === 1 && l.steps[0].type === "guess")) && l.video
      ? '<div class="card c-video"><div class="eyebrow">Video (optional)</div><div class="c-vwrap"><iframe src="https://www.youtube-nocookie.com/embed/'+esc(l.video)+'" title="Lesson video" allowfullscreen loading="lazy"></iframe></div></div>' : '';
    return '<div class="card c-read"><div class="voice c-title">'+esc(s.title)+'</div>'+
      s.body.map(function(p){ return '<p>'+esc(p)+'</p>'; }).join("")+
      (s.picture ? '<div class="c-picture"><div class="eyebrow c-acc">Picture it</div>'+esc(s.picture)+'</div>' : '')+
      (dg ? '<figure class="c-fig">'+dg.svg+'<figcaption>'+esc(dg.caption)+'</figcaption></figure>' : '')+
      '<div class="c-read-foot">'+refTag(s.ref)+listen+'</div></div>'+video;
  }

  function renderGuess(l, s, idx){
    var ls = lessonState(l.id), chosen = ls.guess ? ls.guess[idx] : undefined;
    var html = '<div class="card"><div class="eyebrow c-acc">Have a guess first</div><div class="voice c-q" style="margin-top:6px;">'+esc(s.q)+'</div>'+
      '<p class="c-sub" style="margin-top:6px;">No score. Guessing first helps it stick, even if you\'re wrong.</p>';
    html += s.options.map(function(o, i){
      var cls = "opt";
      if(chosen !== undefined) cls += i === s.answer ? " correct" : (i === chosen ? " wrong" : " dim");
      return '<button class="'+cls+' c-guess" data-i="'+i+'"'+(chosen!==undefined?' disabled':'')+'>'+esc(o)+'</button>';
    }).join("");
    if(chosen !== undefined) html += '<div class="c-after">'+(chosen === s.answer ? 'Good guess. ' : '')+esc(s.reveal)+' '+refTag(s.ref)+'</div>';
    return html+'</div>';
  }

  function renderCheck(l, s, idx){
    var ls = lessonState(l.id);
    if(quiz && quiz.kind === "check" && quiz.lid === l.id && quiz.step === idx) return renderQuiz();
    if(ls.ok[idx]) return '<div class="card"><div class="voice c-title">Quick check done</div><p class="c-sub">These '+s.cards.length+' are now in your daily review.</p>'+
      '<button class="btn-ghost" id="c-check-go" style="margin-top:12px;">Try them again</button></div>';
    quiz = newQuiz("check", s.cards, {lid:l.id, step:idx});
    return renderQuiz();
  }

  function renderDump(listId, mode){
    var L = findList(listId), st = cv.dump && cv.dump.list === listId ? cv.dump : (cv.dump = {list:listId, revealed:false, ticks:[], saved:false});
    var html = '<div class="card"><div class="eyebrow c-acc">From memory</div><div class="voice c-title" style="margin-top:4px;">'+esc(L.title)+'</div>';
    if(!st.revealed){
      return html+'<p class="c-read-p">Say all '+L.items.length+' out loud, in order, or write them on paper. Take your time. Then check.</p>'+
        '<button class="btn-primary" id="c-dump-reveal" style="margin-top:14px;">Check my list</button></div>';
    }
    html += '<p class="c-sub" style="margin:6px 0;">Tick each one you got.</p>';
    html += L.items.map(function(it, i){
      var on = !!st.ticks[i];
      return '<button class="c-rub'+(on?' on':'')+'" data-dtick="'+i+'"><span class="c-box">'+(on?'&#10003;':'')+'</span><span style="flex:1">'+(i+1)+'. '+esc(it)+'</span></button>';
    }).join("");
    var got = st.ticks.filter(Boolean).length;
    html += '<div class="c-read-foot">'+refTag(L.ref)+'</div>';
    if(st.saved) html += '<div class="result-label '+(got===L.items.length?'correct':'wrong')+'">'+got+' of '+L.items.length+(got===L.items.length?'. All there.':'. This list will come back soon.')+'</div>';
    else html += '<button class="btn-primary" id="c-dump-done" data-mode="'+mode+'" style="margin-top:12px;">Done: '+got+' of '+L.items.length+'</button>';
    return html+'</div>';
  }

  function renderSay(l, s, idx){
    var key = taskKey(l.id, idx), t = cs.tasks[key] || {ticks:[], said:false, revealed:false, done:false};
    var html = '<div class="card"><div class="eyebrow c-acc">'+esc(s.kind)+' · out loud</div>'+
      '<div class="voice c-title" style="margin-top:4px;">'+esc(s.prompt)+'</div>'+
      '<p class="c-sub" style="margin-top:6px;">Aim for about '+clock(s.secs)+'. Speak as if to an examiner or a class.</p>'+
      recorderHTML(key, s.secs);
    if(!t.revealed){
      return html+'<button class="btn-primary" id="c-reveal" style="margin-top:14px;"'+(t.said?'':' disabled')+'>'+(t.said?'Compare with the model':'Record or say it first')+'</button></div>';
    }
    html += '<div class="c-model"><div class="eyebrow">Model answer</div><p>'+esc(s.model)+'</p>'+refTag(s.ref)+
      ("speechSynthesis" in window ? ' <button class="c-link" id="c-listen" data-label="Hear it">'+listenLabel("Hear it")+'</button>' : '')+'</div>'+
      '<div class="eyebrow" style="margin-top:14px;">Tick what you covered</div>'+
      s.rubric.map(function(r, i){
        var on = !!t.ticks[i];
        return '<button class="c-rub'+(on?' on':'')+'" data-tick="'+i+'"><span class="c-box">'+(on?'&#10003;':'')+'</span><span style="flex:1">'+esc(r.point)+(r.ref?' '+refTag(r.ref):'')+'</span></button>';
      }).join("");
    var got = t.ticks.filter(Boolean).length;
    html += '<p class="c-sub" style="margin-top:8px;">'+got+' of '+s.rubric.length+' covered.'+(got < s.rubric.length ? ' Best practice: record one more take now, while the model is fresh.' : '')+'</p>'+
      (t.done ? '<div class="result-label correct">Marked complete</div>' : '<button class="btn-primary" id="c-task-done" style="margin-top:12px;">Mark complete</button>')+'</div>';
    return html;
  }

  function renderLessonDone(l, m){
    var ct = content(m.id), outs = ct.outcomes.filter(function(o){ return l.outcomes.indexOf(o.id)!==-1; });
    return '<div class="card" style="margin-top:12px;"><div class="eyebrow c-acc">Lesson done</div>'+
      '<div class="voice c-title" style="margin-top:6px;">Three things to remember</div>'+
      '<ul class="c-sum">'+l.summary.map(function(s){ return '<li>'+esc(s)+'</li>'; }).join("")+'</ul>'+
      ("speechSynthesis" in window ? '<button class="c-link" id="c-listen" data-label="Hear the summary">'+listenLabel("Hear the summary")+'</button>' : '')+
      outs.map(function(o){ var p = masteryOf(o.cards); return '<div style="margin-top:14px;"><div class="c-otext">'+esc(o.text)+'</div>'+bar(p)+'<div class="c-sub">'+p+'%</div></div>'; }).join("")+
      '<p class="c-sub" style="margin-top:12px;">These come back in your daily review, just before you would forget them.</p>'+
      '<button class="btn-primary c-big-btn" data-go="home">Back to home</button></div>';
  }

  // ---------- question runs ----------
  function newQuiz(kind, ids, extra){
    var q = {kind:kind, queue:ids.map(courseCard).filter(Boolean), idx:0, answered:false, wasCorrect:false, selected:null, typed:"", options:null, firstTry:0, retried:{}, err:false};
    for(var k in extra) q[k] = extra[k];
    return q;
  }
  function startReview(){
    var ids = dueCards();
    ids.sort(function(a,b){ return getProg(a).box - getProg(b).box; });
    ids = shuffle(ids.slice(0, REVIEW_SIZE));
    var lists = dueLists();
    if(!ids.length && !lists.length){ show({name:"review-empty"}); return; }
    quiz = newQuiz("review", ids, {list: lists.length ? shuffle(lists)[0] : null});
    show({name:"quiz"});
  }
  function startWeakest(mid){
    var ids = moduleCardIds(mid).filter(function(id){ return cardMastery(id) < 1; });
    quiz = newQuiz("review", shuffle(ids).slice(0, REVIEW_SIZE), {list:null});
    if(!quiz.queue.length){ show({name:"home"}); return; }
    show({name:"quiz"});
  }
  function startCheckpoint(mid){
    quiz = newQuiz("checkpoint", shuffle(moduleCardIds(mid)).slice(0, content(mid).checkpoint.size), {mid:mid});
    show({name:"quiz"});
  }
  function startRecheck(rc){
    var lists = Object.keys(content(rc.mid).lists||{});
    quiz = newQuiz("recheck", shuffle(moduleCardIds(rc.mid)).slice(0, 10), {mid:rc.mid, key:rc.key, list: lists.length ? shuffle(lists)[0] : null});
    show({name:"quiz"});
  }

  function renderQuiz(){
    var q = quiz;
    if(q.idx >= q.queue.length){
      if(q.list && !q.listDone){ return '<div class="c-qhead"><span class="c-sub">'+runName(q)+' · last one</span></div>'+renderDump(q.list, "run"); }
      return renderQuizEnd();
    }
    var card = q.queue[q.idx], total = q.queue.length;
    var head = '<div class="c-qhead"><span class="c-sub">'+runName(q)+' · '+(q.idx+1)+' of '+total+'</span>'+
      (q.kind!=="check" ? '<button class="c-link" id="c-quit">Stop</button>' : '')+'</div>';
    var body = "";
    if(card.mcOnly){
      if(!q.options) q.options = buildOptions(card, pool());
      body = q.options.map(function(opt, i){
        var cls = "opt";
        if(q.answered){ cls += opt===card.short ? " correct" : (opt===q.selected ? " wrong" : " dim"); }
        return '<button class="'+cls+'" data-opt="'+i+'"'+(q.answered?' disabled':'')+'>'+esc(opt)+'</button>';
      }).join("");
    } else {
      var cls = "type-input"+(q.answered?(q.wasCorrect?" correct":" wrong"):"");
      body = '<textarea id="c-type" class="'+cls+'" rows="1" placeholder="Type your answer" autocomplete="off"'+(q.answered?' disabled':'')+'>'+esc(q.typed)+'</textarea>'+
        (q.answered ? '' : '<button class="c-link" id="c-dontknow" style="margin-top:8px;">I don\'t know: show me</button>');
      if(q.err) body += '<div class="err">Type an answer first, or tap "I don\'t know".</div>';
      if(q.answered){
        body += '<div class="result-label '+(q.wasCorrect?'correct':'wrong')+'">'+(q.wasCorrect?'Correct':'Not quite')+'</div>';
        if(!q.wasCorrect) body += '<div class="opt wrong" style="margin-top:6px;">Answer: '+esc(card.short)+'</div>';
      }
    }
    var after = "";
    if(q.answered){
      after = '<div class="c-after">'+esc(card.a)+'</div>';
      if(card.hook && !q.wasCorrect) after += '<div class="c-hook"><div class="eyebrow c-acc">Memory hook</div>'+esc(card.hook)+'</div>';
      if(card.kind === "korean") after += '<button class="c-link" id="c-say" data-term="'+esc(card.short)+'" style="margin-top:10px;">&#128266; Hear &ldquo;'+esc(card.short)+'&rdquo;, then say it back</button>';
      if(card.ref) after += '<div style="margin-top:8px;">'+refTag(card.ref)+'</div>';
      if(!q.wasCorrect && q.kind !== "checkpoint" && q.kind !== "recheck") after += '<p class="c-sub" style="margin-top:8px;">It will come back at the end of this set.</p>';
    }
    var action = q.answered ? '<button class="btn-primary" id="c-q-next" style="margin-top:16px;">Continue</button>'
      : (card.mcOnly ? '' : '<button class="btn-primary" id="c-q-check" style="margin-top:16px;">Check</button>');
    return head+'<div class="card" style="margin-top:10px;"><div class="voice c-q">'+card.q+'</div>'+body+after+'</div>'+(q.kind==="check" && q.answered ? '' : '')+action;
  }
  function runName(q){ return ({check:"Quick check", review:"Review", checkpoint:"Checkpoint", recheck:"Recheck"})[q.kind]; }

  function answer(correct){
    var q = quiz, card = q.queue[q.idx];
    q.answered = true; q.wasCorrect = correct;
    var first = !q.retried[card.id];
    if(correct && first) q.firstTry++;
    if(!correct && first && q.kind !== "checkpoint" && q.kind !== "recheck"){ q.retried[card.id] = true; q.queue.push(card); }
    if(first || correct) commit(card, correct);
    render();
    if(card.kind === "korean" && cs.settings.autoKorean) speakQueue([card.short], "ko-KR");
  }

  function renderQuizEnd(){
    var q = quiz, uniq = {}; q.queue.forEach(function(c){ uniq[c.id]=1; });
    var n = Object.keys(uniq).length, pct = n ? Math.round(q.firstTry/n*100) : 100;
    bumpStreak();
    if(q.kind === "check"){
      lessonState(q.lid).ok[q.step] = true; saveCS();
      return '<div class="card" style="text-align:center;"><div class="eyebrow c-acc">Quick check done</div>'+
        '<div class="voice c-big">'+q.firstTry+' of '+n+'</div><div class="c-sub">right first time</div></div>';
    }
    if(q.kind === "review" && !q.saved){ cs.lastReview = todayISO(); q.saved = true; saveCS(); }
    if(q.kind === "checkpoint" && !q.saved){
      var prev = cs.checkpoints[q.mid];
      cs.checkpoints[q.mid] = {best: Math.max(pct, prev ? prev.best : 0), last:pct, date:todayISO()};
      q.saved = true; saveCS();
    }
    if(q.kind === "recheck" && !q.saved){ cs.rechecks[q.key] = {date:todayISO(), pct:pct}; q.saved = true; saveCS(); }
    var scored = q.kind === "checkpoint" || q.kind === "recheck";
    var msg = scored ? (pct >= COURSE.gate.checkpoint ? 'Above the '+COURSE.gate.checkpoint+'% target.' : 'Target is '+COURSE.gate.checkpoint+'%. Your review will bring the misses back.')
      : 'Done for today. Come back tomorrow: little and often beats long sessions.';
    return '<div class="fade-in card" style="text-align:center;"><div class="eyebrow c-acc">'+runName(q)+' done</div>'+
      (n ? '<div class="voice c-big">'+(scored ? pct+'%' : q.firstTry+' of '+n)+'</div>' : '')+
      '<p class="c-sub" style="margin-top:6px;">'+msg+'</p>'+
      '<button class="btn-primary c-big-btn" data-go="home">Back to home</button></div>';
  }

  // ---------- viva ----------
  function vivaPool(){
    var out = [];
    builtModules().forEach(function(m){
      var ct = content(m.id);
      ct.lessons.forEach(function(l){ l.steps.forEach(function(s){ if(s.type === "say") out.push({q:s.prompt, ref:s.ref, points:s.rubric.map(function(r){ return r.point; }), mod:m.n, secs:s.secs}); }); });
      (ct.viva||[]).forEach(function(v){ out.push({q:v.q, ref:v.ref, points:v.points, mod:m.n, secs:120}); });
    });
    return out;
  }
  function startViva(){
    var qs = shuffle(vivaPool()).slice(0,3);
    rec.urls = {};
    cv = {name:"viva-run", qs:qs, i:0, revealed:false, said:false, scores:qs.map(function(){ return {}; })};
    stopSpeech(); window.scrollTo(0,0); render();
  }
  function renderVivaHome(){
    var hist = cs.viva.slice(-5).reverse();
    return '<div class="fade-in">'+topNav("Viva practice")+
      '<div class="card"><div class="voice c-title">Three questions, out loud</div>'+
      '<p class="c-read-p">Answer each as if to an examiner. Record it if you can. Then see the key points and score yourself 0 to 3 on accuracy, completeness, terminology and teaching clarity.</p>'+
      '<p class="c-sub">'+vivaPool().length+' questions available so far.</p>'+
      '<button class="btn-primary c-big-btn" id="c-viva-go">Start</button></div>'+
      (hist.length ? '<div class="c-h">Recent</div>'+hist.map(function(h){ return '<div class="c-orow"><div class="c-otext">'+fmtDate(h.date)+'</div><div class="c-sub">'+h.total+' / '+h.max+'</div></div>'; }).join("") : '')+
    '</div>';
  }
  function renderVivaRun(){
    var r = cv;
    if(r.i >= r.qs.length) return renderVivaEnd();
    var q = r.qs[r.i], sc = r.scores[r.i], key = "viva:"+r.i;
    var html = '<div class="c-qhead"><span class="c-sub">Viva · '+(r.i+1)+' of '+r.qs.length+'</span><button class="c-link" data-go="viva">Stop</button></div>'+
      '<div class="card" style="margin-top:10px;"><div class="voice c-q">'+esc(q.q)+'</div>'+recorderHTML(key, q.secs);
    if(!r.revealed){
      return html+'<button class="btn-primary" id="c-viva-reveal" style="margin-top:14px;"'+(r.said?'':' disabled')+'>'+(r.said?'Show the key points':'Record or say it first')+'</button></div>';
    }
    html += '<div class="c-model"><div class="eyebrow">Key points</div><ul>'+q.points.map(function(p){ return '<li>'+esc(p)+'</li>'; }).join("")+'</ul>'+refTag(q.ref)+'</div></div>';
    html += CRITERIA.map(function(c){
      var btns = ""; for(var v=0; v<=3; v++) btns += '<button class="chip c-score'+(sc[c.k]===v?' active':'')+'" data-crit="'+c.k+'" data-val="'+v+'">'+v+'</button>';
      return '<div class="c-crit"><div><b>'+c.name+'</b><div class="c-sub">'+c.help+'</div></div><div class="c-scores">'+btns+'</div></div>';
    }).join("");
    var complete = CRITERIA.every(function(c){ return sc[c.k] !== undefined; });
    return html+'<button class="btn-primary" id="c-viva-next" style="margin-top:14px;"'+(complete?'':' disabled')+'>'+(r.i+1<r.qs.length?'Next question':'Finish')+'</button>';
  }
  function renderVivaEnd(){
    var r = cv, tot = {acc:0,comp:0,term:0,teach:0}, sum = 0;
    r.scores.forEach(function(s){ CRITERIA.forEach(function(c){ tot[c.k] += s[c.k]||0; sum += s[c.k]||0; }); });
    var max = r.qs.length*CRITERIA.length*3;
    if(!r.saved){ cs.viva.push({date:todayISO(), total:sum, max:max, by:tot}); r.saved = true; saveCS(); bumpStreak(); }
    var weakest = CRITERIA.slice().sort(function(a,b){ return tot[a.k]-tot[b.k]; })[0];
    return '<div class="fade-in card" style="text-align:center;margin-top:12px;"><div class="eyebrow c-acc">Viva done</div>'+
      '<div class="voice c-big">'+sum+' / '+max+'</div>'+
      CRITERIA.map(function(c){ var p = Math.round(tot[c.k]/(r.qs.length*3)*100); return '<div style="text-align:left;margin-top:10px;"><div class="c-sub">'+c.name+' '+tot[c.k]+'/'+(r.qs.length*3)+'</div>'+bar(p)+'</div>'; }).join("")+
      '<p class="c-sub" style="margin-top:12px;">Work on next time: '+weakest.name.toLowerCase()+'.</p>'+
      '<button class="btn-primary c-big-btn" data-go="home">Back to home</button></div>';
  }

  // ---------- render + handlers ----------
  function renderView(){
    switch(cv.name){
      case "map": return renderMap();
      case "plan": return renderPlan();
      case "outcomes": return renderOutcomes();
      case "settings": return renderSettings();
      case "lesson": return renderLesson();
      case "quiz": return '<div class="fade-in">'+renderQuiz()+'</div>';
      case "review-empty": return '<div class="fade-in">'+topNav("Review")+'<div class="card"><div class="voice c-title">Nothing due today</div><p class="c-read-p">Questions join your review as you finish lessons. Start the next lesson, or come back tomorrow.</p></div></div>';
      case "viva": return renderVivaHome();
      case "viva-run": return '<div class="fade-in">'+renderVivaRun()+'</div>';
      default: return renderHome();
    }
  }
  function render(){ applySettings(); document.getElementById("root").innerHTML = renderView(); attach(); }
  function byId(id){ return document.getElementById(id); }
  function on(id, fn){ var el = byId(id); if(el) el.onclick = fn; return el; }

  function attach(){
    var root = byId("root");
    root.querySelectorAll("[data-go]").forEach(function(el){ el.onclick = function(){ quiz = null; show({name:el.getAttribute("data-go")}); }; });
    on("c-next-go", function(){ nextStep().go(); });
    root.querySelectorAll("[data-lesson]").forEach(function(el){ el.onclick = function(){ openLesson(el.getAttribute("data-lesson")); }; });
    root.querySelectorAll("[data-checkpoint]").forEach(function(el){ el.onclick = function(){ startCheckpoint(el.getAttribute("data-checkpoint")); }; });
    root.querySelectorAll("[data-set]").forEach(function(el){
      el.onclick = function(){ var k = el.getAttribute("data-set"), v = el.getAttribute("data-val");
        cs.settings[k] = k === "rate" ? parseFloat(v) : (k === "autoKorean" ? v === "true" : v); saveCS(); render(); };
    });
    root.querySelectorAll(".c-classrate").forEach(function(el){
      el.onclick = function(){
        var wk = weeks()[currentWeek()-1], note = window.prompt("Optional: one line on how it went", "") || "";
        cs.classLog[classKey(wk)] = {done:true, rating:el.getAttribute("data-rate"), note:note, date:todayISO()};
        saveCS(); bumpStreak(); render();
      };
    });
    var start = byId("c-start");
    if(start) start.onchange = function(){ if(start.value){ cs.startDate = start.value; saveCS(); render(); } };
    on("c-listen-recap", function(){
      var t = recapTexts();
      speakQueue(t.length ? t : ["Nothing to recap yet. Finish your first lesson, and its summary will play here."]);
    });

    // lesson navigation
    on("c-nextstep", function(){
      var f = findLesson(cv.lid), ls = lessonState(cv.lid);
      ls.step = Math.min(ls.step+1, f.lesson.steps.length);
      if(ls.step >= f.lesson.steps.length && !ls.done){ ls.done = true; ls.doneDate = todayISO(); bumpStreak(); }
      quiz = null; cv.dump = null; saveCS(); stopSpeech(); stopRecording(); window.scrollTo(0,0); render();
    });
    on("c-prev", function(){ var ls = lessonState(cv.lid); ls.step = Math.max(0, ls.step-1); quiz = null; cv.dump = null; saveCS(); stopSpeech(); stopRecording(); window.scrollTo(0,0); render(); });
    var lb = byId("c-listen");
    if(lb) lb.onclick = function(){
      if(speaking){ stopSpeech(); lb.innerHTML = listenLabel(lb.getAttribute("data-label")); return; }
      var texts;
      if(cv.name === "lesson"){
        var f = findLesson(cv.lid), idx = lessonState(cv.lid).step, s = f.lesson.steps[idx];
        if(!s) texts = f.lesson.summary;
        else if(s.type === "read") texts = readText(s);
        else texts = [s.model];
      }
      speakQueue(texts || []); lb.innerHTML = listenLabel(lb.getAttribute("data-label"));
    };
    root.querySelectorAll(".c-guess").forEach(function(el){
      el.onclick = function(){ var ls = lessonState(cv.lid), idx = ls.step; ls.guess = ls.guess || {}; ls.guess[idx] = +el.getAttribute("data-i"); ls.ok[idx] = true; saveCS(); render(); };
    });
    on("c-check-go", function(){ var ls = lessonState(cv.lid), s = findLesson(cv.lid).lesson.steps[ls.step]; quiz = newQuiz("check", s.cards, {lid:cv.lid, step:ls.step}); render(); });

    // from-memory lists
    on("c-dump-reveal", function(){ cv.dump.revealed = true; render(); });
    root.querySelectorAll("[data-dtick]").forEach(function(el){ el.onclick = function(){ if(cv.dump.saved) return; var i = +el.getAttribute("data-dtick"); cv.dump.ticks[i] = !cv.dump.ticks[i]; render(); }; });
    var dd = byId("c-dump-done");
    if(dd) dd.onclick = function(){
      var L = findList(cv.dump.list), got = cv.dump.ticks.filter(Boolean).length;
      commitDump(cv.dump.list, got, L.items.length); cv.dump.saved = true; bumpStreak();
      if(dd.getAttribute("data-mode") === "lesson"){ var ls = lessonState(cv.lid); ls.ok[ls.step] = true; saveCS(); }
      else { quiz.listDone = true; }
      render();
    };

    // spoken tasks
    function taskState(){
      var ls = lessonState(cv.lid), key = taskKey(cv.lid, ls.step);
      return cs.tasks[key] || (cs.tasks[key] = {ticks:[], said:false, revealed:false, done:false});
    }
    var rs = byId("c-rec-start");
    if(rs) rs.onclick = function(){ stopSpeech(); startRecording(rs.getAttribute("data-key"), +rs.getAttribute("data-secs")); };
    on("c-rec-stop", stopRecording);
    var sd = byId("c-said");
    if(sd) sd.onclick = function(){ markSaid(sd.getAttribute("data-key")); render(); };
    on("c-reveal", function(){ stopRecording(); taskState().revealed = true; saveCS(); render(); });
    root.querySelectorAll("[data-tick]").forEach(function(el){ el.onclick = function(){ var t = taskState(), i = +el.getAttribute("data-tick"); t.ticks[i] = !t.ticks[i]; saveCS(); render(); }; });
    on("c-task-done", function(){ var t = taskState(), ls = lessonState(cv.lid); t.done = true; t.date = todayISO(); ls.ok[ls.step] = true; saveCS(); bumpStreak(); render(); });

    // questions
    root.querySelectorAll(".opt[data-opt]").forEach(function(el){
      el.onclick = function(){
        if(!quiz || quiz.answered) return;
        var card = quiz.queue[quiz.idx], chosen = quiz.options[+el.getAttribute("data-opt")];
        quiz.selected = chosen; answer(chosen === card.short);
      };
    });
    var ti = byId("c-type");
    if(ti){
      if(!quiz.answered) ti.focus({preventScroll:true});
      var grow = function(){ ti.style.height = "auto"; ti.style.height = ti.scrollHeight+"px"; };
      grow();
      ti.oninput = function(){ quiz.typed = ti.value; grow(); };
      ti.onkeydown = function(e){ if(e.key === "Enter"){ e.preventDefault(); var b = byId("c-q-check"); if(b) b.click(); } };
    }
    on("c-q-check", function(){
      var v = ti ? ti.value : "";
      if(!v.trim()){ quiz.err = true; render(); return; }
      quiz.err = false; quiz.typed = v;
      answer(checkTyped(v, quiz.queue[quiz.idx]));
    });
    on("c-dontknow", function(){ quiz.err = false; quiz.typed = ""; answer(false); });
    on("c-q-next", function(){ quiz.idx++; quiz.answered = false; quiz.selected = null; quiz.typed = ""; quiz.options = null; cv.dump = null; render(); var c = byId("root"); if(c) c.scrollIntoView(); });
    on("c-quit", function(){ quiz = null; show({name:"home"}); });
    var say = byId("c-say");
    if(say) say.onclick = function(){ speakQueue([say.getAttribute("data-term")], "ko-KR"); };

    // viva
    on("c-viva-go", startViva);
    on("c-viva-reveal", function(){ stopRecording(); cv.revealed = true; render(); });
    root.querySelectorAll("[data-crit]").forEach(function(el){ el.onclick = function(){ cv.scores[cv.i][el.getAttribute("data-crit")] = +el.getAttribute("data-val"); render(); }; });
    on("c-viva-next", function(){ cv.i++; cv.revealed = false; cv.said = false; window.scrollTo(0,0); render(); });
  }

  return {
    open: function(){
      loadCS(function(s){
        cs = s;
        if(!cs.startDate){ cs.startDate = todayISO(); saveCS(); }
        indexCards();
        cv = {name:"home"}; quiz = null;
        render();
      });
    },
    // Exposed for tests.
    _cards: function(){ indexCards(); return CARD; },
    _courseCard: function(id){ return courseCard(id); },
    _quiz: function(){ return quiz; }
  };
})();
