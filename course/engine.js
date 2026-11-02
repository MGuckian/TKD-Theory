// Course shell. Runs inside index.html and reuses its globals: DATA, state, saveState,
// checkTyped, buildOptions, todayISO, daysBetween, BOX_INTERVALS, TOPICS, render, view.
// Course progress lives under its own key (COURSE.storageKey); flashcard progress for
// existing cards stays in the app's own state so both views share the same Leitner boxes.
var Course = (function(){
  var cs = null;            // course state
  var cv = {name:"home"};   // current course view
  var quiz = null;          // active quiz (practice, review, checkpoint)
  var CARD = {};            // id -> card (flashcards + course-only cards)
  var REVIEW_SIZE = 15;

  // ---------- storage ----------
  function defaultCS(){ return {v:1, startDate:null, lastReview:null, cards:{}, lessons:{}, tasks:{}, checkpoints:{}, viva:[]}; }
  function loadCS(cb){
    function parse(raw){
      var base = defaultCS();
      if(!raw) return base;
      try{ var p = JSON.parse(raw); Object.keys(base).forEach(function(k){ if(p[k] !== undefined) base[k] = p[k]; }); }catch(e){}
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

  // ---------- content helpers ----------
  function builtModules(){ return COURSE.modules.filter(function(m){ return !!COURSE.content[m.id]; }); }
  function content(mid){ return COURSE.content[mid]; }
  function moduleOf(mid){ for(var i=0;i<COURSE.modules.length;i++){ if(COURSE.modules[i].id===mid) return COURSE.modules[i]; } return null; }
  function findLesson(lid){
    var mods = builtModules();
    for(var i=0;i<mods.length;i++){
      var ls = content(mods[i].id).lessons;
      for(var j=0;j<ls.length;j++){ if(ls[j].id===lid) return {module:mods[i], lesson:ls[j]}; }
    }
    return null;
  }
  function indexCards(){
    CARD = {};
    DATA.forEach(function(c){ CARD[c.id] = c; });
    builtModules().forEach(function(m){
      var ct = content(m.id);
      (ct.cards||[]).forEach(function(c){ CARD[c.id] = c; });
    });
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

  // ---------- card progress (shared Leitner boxes) ----------
  function isDeckCard(id){ return state.cards.hasOwnProperty(id) || DATA.some(function(c){ return c.id===id; }); }
  function getProg(id){
    var p = isDeckCard(id) ? state.cards[id] : cs.cards[id];
    return p || {box:0, due:todayISO()};
  }
  function setProg(id, p){
    if(isDeckCard(id)) state.cards[id] = p; else cs.cards[id] = p;
  }
  function commit(card, correct){
    var p = getProg(card.id);
    p = {box:p.box, due:p.due, _seenEver:true};
    p.box = correct ? Math.min(p.box+1, BOX_INTERVALS.length-1) : 0;
    if(correct) state.xp += 10; else state.xp += 2;
    var d = new Date(); d.setDate(d.getDate()+BOX_INTERVALS[p.box]);
    p.due = d.toISOString().slice(0,10);
    setProg(card.id, p);
    saveState(state); saveCS();
  }
  function bumpStreak(){
    var today = todayISO();
    if(state.lastDate === today) return;
    var wasYesterday = state.lastDate && daysBetween(state.lastDate, today) === 1;
    state.streak = wasYesterday ? state.streak+1 : 1;
    state.lastDate = today;
    saveState(state);
  }

  // Course mastery of one card: 0, 0.5 after one correct answer, 1 once correct on two days.
  function cardMastery(id){ var b = getProg(id).box; return b >= 2 ? 1 : (b === 1 ? 0.5 : 0); }
  function masteryOf(ids){
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
  function taskKey(lid, type){ return lid+":"+type; }
  function explainsDone(mid){
    return content(mid).lessons.every(function(l){ var t = cs.tasks[taskKey(l.id,"explain")]; return t && t.done; });
  }
  function lessonDone(lid){ return !!(cs.lessons[lid] && cs.lessons[lid].done); }
  function gate(mid){
    var m = moduleMastery(mid), ex = explainsDone(mid), cp = cs.checkpoints[mid] ? cs.checkpoints[mid].best : null;
    return {mastery:m, explains:ex, checkpoint:cp,
      met: m >= COURSE.gate.mastery && ex && cp !== null && cp >= COURSE.gate.checkpoint};
  }
  function moduleUnlocked(mid){
    var idx = -1; COURSE.modules.forEach(function(m,i){ if(m.id===mid) idx=i; });
    if(idx <= 0) return true;
    var prev = COURSE.modules[idx-1];
    return !!content(prev.id) && gate(prev.id).met;
  }
  // Cards introduced so far: those in practice steps the learner has completed.
  function introducedCards(){
    var out = [], seen = {};
    builtModules().forEach(function(m){
      content(m.id).lessons.forEach(function(l){
        if(!(cs.lessons[l.id] && cs.lessons[l.id].practiced)) return;
        l.steps.forEach(function(s){ if(s.type==="practice") s.cards.forEach(function(id){ if(!seen[id] && CARD[id]){ seen[id]=1; out.push(id); } }); });
      });
    });
    return out;
  }
  function dueReviewCards(){
    var today = todayISO();
    return introducedCards().filter(function(id){ return getProg(id).due <= today; });
  }

  // ---------- weekly plan ----------
  function weeks(){
    var out = [], w = 1;
    COURSE.modules.forEach(function(m){
      var ct = content(m.id);
      for(var i=0;i<m.weeks;i++){
        var lessons = ct ? ct.lessons.filter(function(l){ return l.week === i+1; }) : [];
        out.push({week:w++, module:m, weekInModule:i+1, lessons:lessons});
      }
    });
    for(var c=0;c<COURSE.capstone.weeks;c++) out.push({week:w++, capstone:true, weekInModule:c+1, lessons:[]});
    return out;
  }
  function addDays(iso, n){ var d = new Date(iso+"T00:00:00"); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); }
  function currentWeek(){
    var n = Math.floor(daysBetween(cs.startDate, todayISO())/7)+1;
    return Math.max(1, Math.min(n, weeks().length));
  }
  function fmtDate(iso){
    var d = new Date(iso+"T00:00:00");
    return d.getDate()+" "+["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
  }
  function paceNote(){
    // Behind only counts lessons from weeks that have already ended.
    var cw = currentWeek(), due = 0, done = 0, thisWeek = 0;
    weeks().forEach(function(w){ w.lessons.forEach(function(l){
      if(w.week < cw) due++;
      if(w.week === cw && !lessonDone(l.id)) thisWeek++;
      if(lessonDone(l.id)) done++;
    }); });
    if(done < due) return (due-done)+" lesson"+(due-done===1?"":"s")+" behind plan";
    return thisWeek ? "On track · "+thisWeek+" lesson"+(thisWeek===1?"":"s")+" this week" : "On track";
  }

  // ---------- next step ----------
  function nextStep(){
    var dueN = dueReviewCards().length;
    if(dueN > 0 && cs.lastReview !== todayISO()){
      return {label:"Daily review", detail:Math.min(dueN, REVIEW_SIZE)+" cards due · about "+Math.max(3, Math.round(Math.min(dueN,REVIEW_SIZE)*0.8))+" min", go:function(){ startReview(); }};
    }
    var mods = builtModules();
    for(var i=0;i<mods.length;i++){
      var m = mods[i]; if(!moduleUnlocked(m.id)) break;
      var ls = content(m.id).lessons;
      for(var j=0;j<ls.length;j++){
        if(!lessonDone(ls[j].id)){
          var l = ls[j], at = cs.lessons[l.id] ? cs.lessons[l.id].step : 0;
          return {label:"Lesson "+m.n+"."+l.n+": "+l.title, detail:(at>0?"Resume at step "+(at+1)+" of "+(l.steps.length+1):"About 45 min, in "+(l.steps.length+1)+" short steps"), go:function(id){ return function(){ openLesson(id); }; }(l.id)};
        }
      }
      var g = gate(m.id);
      if(!g.met){
        if(g.mastery < COURSE.gate.mastery){
          return {label:"Secure Module "+m.n+" cards", detail:"Mastery "+g.mastery+"% of "+COURSE.gate.mastery+"% · cards count once correct on two separate days", go:function(id){ return function(){ startWeakest(id); }; }(m.id)};
        }
        if(!g.explains) return {label:"Finish the Explain tasks", detail:"Open the course map to see which", go:function(){ show({name:"map"}); }};
        return {label:"Module "+m.n+" checkpoint", detail:COURSE.content[m.id].checkpoint.size+" questions · aim for "+COURSE.gate.checkpoint+"%", go:function(id){ return function(){ startCheckpoint(id); }; }(m.id)};
      }
    }
    if(dueN > 0) return {label:"Extra review", detail:dueN+" cards due", go:function(){ startReview(); }};
    return {label:"Viva practice", detail:"Next modules are being built. Rehearse what you know.", go:function(){ startViva(); }};
  }

  // ---------- small UI helpers ----------
  function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;"); }
  function bar(pct){ return '<div class="c-bar"><div style="width:'+pct+'%"></div></div>'; }
  function refTag(ref){ return ref ? '<span class="c-ref">'+esc(ref)+'</span>' : ''; }
  function topNav(title, backTo){
    return '<div class="c-top"><button class="c-link" data-go="'+(backTo||"home")+'">&larr; '+(backTo==="flash"?"Flashcards":"Back")+'</button><div class="eyebrow">'+esc(title)+'</div><div style="width:60px"></div></div>';
  }
  function speak(text){
    if(!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text); u.lang = "en-GB"; u.rate = 1;
    window.speechSynthesis.speak(u);
  }
  function stopSpeech(){ if("speechSynthesis" in window) window.speechSynthesis.cancel(); }

  // ---------- views ----------
  function show(v){ stopSpeech(); cv = v; window.scrollTo(0,0); render(); }

  function renderHome(){
    var ns = nextStep(), cw = currentWeek(), total = weeks().length;
    var mods = builtModules();
    var outcomeRows = "";
    mods.forEach(function(m){
      content(m.id).outcomes.forEach(function(o){
        var p = masteryOf(o.cards.filter(function(id){ return CARD[id]; }));
        outcomeRows += '<div class="c-orow"><div class="c-otext">'+esc(o.text)+'</div><div class="c-omini">'+bar(p)+'<span>'+p+'%</span></div></div>';
      });
    });
    return '<div class="fade-in">'+
      topNav("4th Dan theory course","flash")+
      '<div class="c-week">Week '+cw+' of '+total+' · '+esc(paceNote())+'</div>'+
      '<div class="card c-next"><div class="eyebrow" style="color:var(--accent)">Next step</div>'+
        '<div class="voice c-next-title">'+esc(ns.label)+'</div>'+
        '<div class="c-sub">'+esc(ns.detail)+'</div>'+
        '<button id="c-next-go" class="btn-primary" style="margin-top:14px;">Go</button></div>'+
      '<div class="c-grid">'+
        '<button class="c-tile" data-go="map"><b>Course map</b><span>Modules and lessons</span></button>'+
        '<button class="c-tile" data-go="plan"><b>Weekly plan</b><span>2 lessons + daily review</span></button>'+
        '<button class="c-tile" data-go="review"><b>Daily review</b><span>'+dueReviewCards().length+' due</span></button>'+
        '<button class="c-tile" data-go="viva"><b>Viva simulator</b><span>Spoken answers, self-scored</span></button>'+
      '</div>'+
      '<div class="c-h">Progress by learning outcome</div>'+
      outcomeRows+
      '<button class="c-link" data-go="outcomes" style="margin-top:10px;">All outcomes &rarr;</button>'+
    '</div>';
  }

  function renderMap(){
    var html = topNav("Course map");
    COURSE.modules.forEach(function(m){
      var ct = content(m.id), unlocked = moduleUnlocked(m.id);
      html += '<div class="card c-mod'+(ct?'':' c-dim')+'">'+
        '<div class="c-mod-head"><div><div class="eyebrow">Module '+m.n+' · '+m.weeks+' weeks · '+m.lessons+' lessons</div>'+
        '<div class="voice c-mod-title">'+esc(m.title)+'</div><div class="c-sub">'+esc(m.blurb)+'</div></div></div>';
      if(!ct){ html += '<div class="c-sub" style="margin-top:8px;">Being built (Phase 2)</div></div>'; return; }
      var g = gate(m.id);
      html += '<div class="c-gate">'+
        '<span class="'+(g.mastery>=COURSE.gate.mastery?'ok':'')+'">Mastery '+g.mastery+'%</span>'+
        '<span class="'+(g.explains?'ok':'')+'">Explain tasks '+(g.explains?'done':'to do')+'</span>'+
        '<span class="'+(g.checkpoint!==null&&g.checkpoint>=COURSE.gate.checkpoint?'ok':'')+'">Checkpoint '+(g.checkpoint===null?'not taken':g.checkpoint+'%')+'</span></div>';
      ct.lessons.forEach(function(l){
        var done = lessonDone(l.id), ex = cs.tasks[taskKey(l.id,"explain")];
        html += '<button class="c-lesson'+(unlocked?'':' c-dim')+'" data-lesson="'+l.id+'"'+(unlocked?'':' disabled')+'>'+
          '<span class="c-tick'+(done?' on':'')+'">'+(done?'&#10003;':m.n+'.'+l.n)+'</span>'+
          '<span style="flex:1"><b>'+esc(l.title)+'</b><span class="c-sub">Week '+l.week+(ex&&ex.done?' · explain done':'')+'</span></span></button>';
      });
      html += '<button class="btn-ghost" data-checkpoint="'+m.id+'" style="margin-top:10px;"'+(unlocked?'':' disabled')+'>Module checkpoint</button></div>';
    });
    html += '<div class="card c-mod c-dim"><div class="eyebrow">'+COURSE.capstone.weeks+' weeks</div><div class="voice c-mod-title">'+esc(COURSE.capstone.title)+'</div><div class="c-sub">Unlocks after Module 8. Viva simulator is available now.</div></div>';
    return '<div class="fade-in">'+html+'</div>';
  }

  function renderPlan(){
    var cw = currentWeek(), rows = "";
    weeks().forEach(function(w){
      var start = addDays(cs.startDate, (w.week-1)*7);
      var title = w.capstone ? "Capstone · revision and viva" : "Module "+w.module.n+": "+w.module.title;
      var items = w.lessons.length
        ? w.lessons.map(function(l){ return '<div class="c-pl'+(lessonDone(l.id)?' ok':'')+'">'+(lessonDone(l.id)?'&#10003; ':'&#9675; ')+w.module.n+'.'+l.n+' '+esc(l.title)+'</div>'; }).join("")
        : '<div class="c-pl c-dim">'+(w.capstone ? "Viva rehearsals and mixed review" : "Lessons not built yet")+'</div>';
      rows += '<div class="c-wk'+(w.week===cw?' now':'')+'"><div class="c-wk-h"><b>Week '+w.week+'</b><span>'+fmtDate(start)+'</span></div>'+
        '<div class="c-sub">'+esc(title)+'</div>'+items+'</div>';
    });
    return '<div class="fade-in">'+topNav("Weekly plan")+
      '<div class="c-sub" style="margin:4px 0 12px;">Each week: two 45-minute lessons plus 15 minutes of daily review.</div>'+
      '<label class="c-sub" for="c-start">Course start date</label>'+
      '<input type="date" id="c-start" class="c-date" value="'+cs.startDate+'">'+
      rows+'</div>';
  }

  function renderOutcomes(){
    var html = topNav("Learning outcomes");
    builtModules().forEach(function(m){
      html += '<div class="c-h">Module '+m.n+': '+esc(m.title)+'</div>';
      var ct = content(m.id);
      ct.outcomes.forEach(function(o){
        var ids = o.cards.filter(function(id){ return CARD[id]; });
        var p = masteryOf(ids), secure = ids.filter(function(id){ return cardMastery(id)===1; }).length;
        var lessons = ct.lessons.filter(function(l){ return l.outcomes.indexOf(o.id)!==-1; });
        var exDone = lessons.filter(function(l){ var t = cs.tasks[taskKey(l.id,"explain")]; return t && t.done; }).length;
        html += '<div class="card c-oc"><div class="c-otext">'+esc(o.text)+'</div>'+bar(p)+
          '<div class="c-sub">'+p+'% · '+secure+' of '+ids.length+' cards secure · explain '+exDone+'/'+lessons.length+'</div></div>';
      });
    });
    COURSE.modules.forEach(function(m){ if(!content(m.id)) html += '<div class="c-h c-dim">Module '+m.n+': '+esc(m.title)+' · outcomes added when built</div>'; });
    return '<div class="fade-in">'+html+'</div>';
  }

  // ---------- lesson player ----------
  function openLesson(lid){
    if(!cs.lessons[lid]) cs.lessons[lid] = {step:0, done:false, practiced:false};
    saveCS();
    quiz = null;
    show({name:"lesson", lid:lid});
  }
  function lessonStepCount(l){ return l.steps.length+1; } // + completion screen

  function renderLesson(){
    var f = findLesson(cv.lid), l = f.lesson, m = f.module, ls = cs.lessons[l.id];
    var idx = ls.step, n = lessonStepCount(l);
    var dots = ""; for(var i=0;i<n;i++) dots += '<span class="c-dot'+(i<idx?' done':(i===idx?' now':''))+'"></span>';
    var head = '<div class="c-top"><button class="c-link" data-go="map">&larr; Map</button><div class="c-dots">'+dots+'</div><div style="width:40px"></div></div>'+
      '<div class="eyebrow" style="margin-top:16px;">Lesson '+m.n+'.'+l.n+' · '+esc(l.title)+'</div>';
    var body = "", canNext = true;
    if(idx >= l.steps.length){
      body = renderLessonDone(l, m);
      return '<div class="fade-in">'+head+body+'</div>';
    }
    var s = l.steps[idx];
    if(s.type === "read"){
      var dg = s.diagram ? DIAGRAMS.get(s.diagram) : null;
      body = '<div class="card c-read"><div class="voice c-title">'+esc(s.title)+'</div>'+
        s.body.map(function(p){ return '<p>'+esc(p)+'</p>'; }).join("")+
        (dg ? '<figure class="c-fig">'+dg.svg+'<figcaption>'+esc(dg.caption)+'</figcaption></figure>' : '')+
        '<div class="c-read-foot">'+refTag(s.ref)+
        ('speechSynthesis' in window ? '<button class="c-link" id="c-narrate">&#128266; Narrate</button>' : '')+'</div></div>';
      if(idx === 0 && l.video){
        body += '<div class="card c-video"><div class="eyebrow">Video (optional)</div><div class="c-vwrap"><iframe src="https://www.youtube-nocookie.com/embed/'+esc(l.video)+'" title="Lesson video" allowfullscreen loading="lazy"></iframe></div></div>';
      }
    } else if(s.type === "practice"){
      body = renderPracticeStep(l, s);
      canNext = !!ls.practiced;
    } else {
      body = renderTask(l, s);
      var t = cs.tasks[taskKey(l.id, s.type)];
      canNext = !!(t && t.done);
    }
    var nav = '<div class="c-nav">'+
      (idx>0 ? '<button class="btn-ghost" id="c-prev" style="width:auto;flex:0 0 auto;">Back</button>' : '')+
      '<button class="btn-primary" id="c-nextstep"'+(canNext?'':' disabled')+'>'+(canNext?'Next':(s.type==="practice"?'Finish practice to continue':'Mark complete to continue'))+'</button></div>';
    return '<div class="fade-in">'+head+body+nav+'</div>';
  }

  function renderLessonDone(l, m){
    var ct = content(m.id), outs = ct.outcomes.filter(function(o){ return l.outcomes.indexOf(o.id)!==-1; });
    return '<div class="card" style="margin-top:12px;text-align:center;">'+
      '<div class="eyebrow" style="color:var(--accent)">Lesson complete</div>'+
      '<div class="voice c-title" style="margin-top:6px;">'+esc(l.title)+'</div>'+
      outs.map(function(o){ var p = masteryOf(o.cards.filter(function(id){ return CARD[id]; })); return '<div style="text-align:left;margin-top:12px;"><div class="c-otext">'+esc(o.text)+'</div>'+bar(p)+'<div class="c-sub">'+p+'%</div></div>'; }).join("")+
      '<div class="c-sub" style="margin-top:12px;">These cards now join your daily review.</div>'+
      '<button class="btn-primary" data-go="home" style="margin-top:16px;">Back to course</button></div>';
  }

  function renderPracticeStep(l, s){
    var ls = cs.lessons[l.id];
    if(quiz && quiz.kind === "practice" && quiz.lid === l.id) return renderQuiz();
    if(ls.practiced){
      var p = masteryOf(s.cards);
      return '<div class="card"><div class="voice c-title">Retrieval practice</div><p class="c-sub">Done. These '+s.cards.length+' cards are now '+p+'% secure.</p>'+
        '<button class="btn-ghost" id="c-practice-go" style="margin-top:12px;">Practise again</button></div>';
    }
    return '<div class="card"><div class="voice c-title">Retrieval practice</div>'+
      '<p class="c-sub">'+s.cards.length+' questions on what you just read. Getting one wrong is useful: it comes back at the end.</p>'+
      '<button class="btn-primary" id="c-practice-go" style="margin-top:14px;">Start practice</button></div>';
  }

  // Explain / scenario / teach-back: write or say, reveal the model, self-mark the rubric.
  function renderTask(l, s){
    var key = taskKey(l.id, s.type), t = cs.tasks[key] || {text:"", ticks:[], revealed:false, done:false};
    var label = s.type === "explain" ? "Explain it" : (s.kind || "Scenario");
    var html = '<div class="card"><div class="eyebrow" style="color:var(--accent)">'+esc(label)+'</div>'+
      '<div class="voice c-title" style="margin-top:4px;">'+esc(s.prompt)+'</div>'+
      '<div class="c-sub" style="margin-top:8px;">'+(s.type==="explain" ? "Write it, or say it out loud first. Then compare." : "Say it out loud as if they were in front of you. Notes optional.")+'</div>'+
      '<textarea id="c-task-text" class="type-input c-task-text" rows="4" placeholder="Your answer (saved on this device)">'+esc(t.text)+'</textarea>'+
      ((s.kind==="Teach-back"||s.type==="scenario") ? '<button class="c-link" id="c-timer" style="margin-top:8px;">&#9201; Start 90-second timer</button><span id="c-timer-out" class="c-sub"></span>' : '');
    if(!t.revealed){
      html += '<button class="btn-primary" id="c-reveal" style="margin-top:14px;">Show model answer</button></div>';
      return html;
    }
    html += '<div class="c-model"><div class="eyebrow">Model answer</div><p>'+esc(s.model)+'</p>'+refTag(s.ref)+'</div>'+
      '<div class="eyebrow" style="margin-top:14px;">Self-mark: tick what you covered</div>'+
      s.rubric.map(function(r, i){
        var on = !!t.ticks[i];
        return '<button class="c-rub'+(on?' on':'')+'" data-tick="'+i+'"><span class="c-box">'+(on?'&#10003;':'')+'</span><span style="flex:1">'+esc(r.point)+(r.ref?' '+refTag(r.ref):'')+'</span></button>';
      }).join("");
    var got = t.ticks.filter(Boolean).length;
    html += '<div class="c-sub" style="margin-top:8px;">'+got+' of '+s.rubric.length+' covered.'+(got < s.rubric.length ? ' Missed points will be easier next time: re-read the model, then say it once more.' : '')+'</div>'+
      (t.done ? '<div class="result-label correct">Marked complete</div>' : '<button class="btn-primary" id="c-task-done" style="margin-top:12px;">Mark complete</button>')+
      '</div>';
    return html;
  }

  // ---------- quiz engine (practice, review, checkpoint) ----------
  function shuffle(a){ a = a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
  function newQuiz(kind, ids, extra){
    var q = {kind:kind, queue:ids.map(courseCard).filter(Boolean), idx:0, answered:false, wasCorrect:false, selected:null, typed:"", options:null, correct:0, firstTry:0, retried:{}, err:false};
    for(var k in extra) q[k] = extra[k];
    return q;
  }
  function startPractice(lid){
    var f = findLesson(lid), s = f.lesson.steps[cs.lessons[lid].step];
    quiz = newQuiz("practice", s.cards, {lid:lid});
    render();
  }
  function startReview(){
    var ids = dueReviewCards();
    ids.sort(function(a,b){ return getProg(a).box - getProg(b).box; });
    ids = shuffle(ids.slice(0, REVIEW_SIZE));
    if(!ids.length){ show({name:"review-empty"}); return; }
    quiz = newQuiz("review", ids, {});
    show({name:"quiz"});
  }
  function startWeakest(mid){
    var ids = moduleCardIds(mid).filter(function(id){ return cardMastery(id) < 1; });
    quiz = newQuiz("review", shuffle(ids).slice(0, REVIEW_SIZE), {});
    if(!quiz.queue.length){ show({name:"home"}); return; }
    show({name:"quiz"});
  }
  function startCheckpoint(mid){
    var ids = shuffle(moduleCardIds(mid)).slice(0, content(mid).checkpoint.size);
    quiz = newQuiz("checkpoint", ids, {mid:mid});
    show({name:"quiz"});
  }

  function renderQuiz(){
    var q = quiz;
    if(q.idx >= q.queue.length) return renderQuizEnd();
    var card = q.queue[q.idx], total = q.queue.length;
    var head = '<div class="c-qhead"><span class="c-sub">'+(q.kind==="checkpoint"?"Checkpoint":(q.kind==="review"?"Review":"Practice"))+' · '+(q.idx+1)+' / '+total+'</span>'+
      (q.kind!=="practice" ? '<button class="c-link" id="c-quit">Stop</button>' : '')+'</div>';
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
      body = '<textarea id="c-type" class="'+cls+'" rows="1" placeholder="Type your answer" autocomplete="off"'+(q.answered?' disabled':'')+'>'+esc(q.typed)+'</textarea>';
      if(q.err) body += '<div class="err">Enter an answer first.</div>';
      if(q.answered){
        body += '<div class="result-label '+(q.wasCorrect?'correct':'wrong')+'">'+(q.wasCorrect?'Correct':'Incorrect')+'</div>';
        if(!q.wasCorrect) body += '<div class="opt wrong" style="margin-top:6px;">Correct answer: '+esc(card.short)+'</div>';
      }
    }
    var after = "";
    if(q.answered){
      after = '<div class="c-after">'+esc(card.a)+'</div>';
      if(card.hook && !q.wasCorrect) after += '<div class="c-hook"><div class="eyebrow" style="color:var(--accent)">Memory hook</div>'+esc(card.hook)+'</div>';
      if(card.ref) after += '<div style="margin-top:8px;">'+refTag(card.ref)+'</div>';
      var term = card.kind === "korean" ? card.short : null;
      if(term && ("speechSynthesis" in window)) after += '<button class="c-link" id="c-say" data-term="'+esc(term)+'" style="margin-top:8px;">&#128266; Hear &ldquo;'+esc(term)+'&rdquo;</button>';
    }
    var action = q.answered ? '<button class="btn-primary" id="c-q-next" style="margin-top:16px;">Continue</button>'
      : (card.mcOnly ? '' : '<button class="btn-primary" id="c-q-check" style="margin-top:16px;">Check answer</button>');
    return head+'<div class="eyebrow" style="margin-top:14px;">'+esc(TOPICS[card.topic] ? TOPICS[card.topic].name : card.topic)+'</div>'+
      '<div class="card" style="margin-top:8px;"><div class="voice c-q">'+card.q+'</div>'+body+after+'</div>'+action;
  }

  function answer(correct){
    var q = quiz, card = q.queue[q.idx];
    q.answered = true; q.wasCorrect = correct;
    var first = !q.retried[card.id];
    if(correct){ q.correct++; if(first) q.firstTry++; }
    // Checkpoints score first attempts only and don't requeue; practice and review requeue once.
    if(!correct && q.kind !== "checkpoint" && first){ q.retried[card.id] = true; q.queue.push(card); }
    if(first || correct) commit(card, correct);
    render();
  }

  function renderQuizEnd(){
    var q = quiz, uniq = {}; q.queue.forEach(function(c){ uniq[c.id]=1; });
    var n = Object.keys(uniq).length, pct = Math.round(q.firstTry/n*100);
    bumpStreak();
    if(q.kind === "practice"){
      cs.lessons[q.lid].practiced = true; saveCS();
      return '<div class="card" style="text-align:center;"><div class="eyebrow" style="color:var(--accent)">Practice done</div>'+
        '<div class="voice c-big">'+q.firstTry+'/'+n+'</div><div class="c-sub">right first time</div>'+
        '<button class="btn-primary" id="c-practice-close" style="margin-top:16px;">Continue lesson</button></div>';
    }
    if(q.kind === "review"){ cs.lastReview = todayISO(); saveCS(); }
    if(q.kind === "checkpoint" && !q.saved){
      var prev = cs.checkpoints[q.mid];
      cs.checkpoints[q.mid] = {best: Math.max(pct, prev ? prev.best : 0), last:pct, date:todayISO()};
      q.saved = true; saveCS();
    }
    var cp = q.kind === "checkpoint";
    return '<div class="fade-in card" style="text-align:center;"><div class="eyebrow" style="color:var(--accent)">'+(cp?'Checkpoint result':'Review done')+'</div>'+
      '<div class="voice c-big">'+(cp ? pct+'%' : q.firstTry+'/'+n)+'</div>'+
      '<div class="c-sub">'+(cp ? (pct >= COURSE.gate.checkpoint ? 'Above the '+COURSE.gate.checkpoint+'% target' : 'Target is '+COURSE.gate.checkpoint+'%. Review, then try again') : 'right first time')+'</div>'+
      '<button class="btn-primary" data-go="home" style="margin-top:16px;">Back to course</button></div>';
  }

  // ---------- viva simulator ----------
  var CRITERIA = [
    {k:"acc", name:"Accuracy", help:"Facts match the book"},
    {k:"comp", name:"Completeness", help:"All the key points"},
    {k:"term", name:"Terminology", help:"Correct Korean and technical terms"},
    {k:"teach", name:"Teaching clarity", help:"A colour belt could follow it"}
  ];
  function vivaPool(){
    var out = [];
    builtModules().forEach(function(m){
      var ct = content(m.id);
      ct.lessons.forEach(function(l){
        l.steps.forEach(function(s){
          if(s.type === "explain" || s.type === "scenario") out.push({q:s.prompt, ref:s.ref, points:s.rubric.map(function(r){ return r.point; }), model:s.model, mod:m.n});
        });
      });
      (ct.viva||[]).forEach(function(v){ out.push({q:v.q, ref:v.ref, points:v.points, model:null, mod:m.n}); });
    });
    return out;
  }
  function startViva(){
    var qs = shuffle(vivaPool()).slice(0,3);
    cv = {name:"viva-run", qs:qs, i:0, revealed:false, scores:qs.map(function(){ return {}; })};
    stopSpeech(); window.scrollTo(0,0); render();
  }
  function renderVivaHome(){
    var hist = cs.viva.slice(-5).reverse();
    return '<div class="fade-in">'+topNav("Viva simulator")+
      '<div class="card"><div class="voice c-title">Three random questions</div>'+
      '<p class="c-sub" style="margin-top:6px;">Answer each out loud, as to an examiner. Then reveal the key points and score yourself 0 to 3 on accuracy, completeness, terminology and teaching clarity.</p>'+
      '<p class="c-sub" style="margin-top:6px;">Draws from '+vivaPool().length+' questions across built modules.</p>'+
      '<button class="btn-primary" id="c-viva-go" style="margin-top:14px;">Start viva</button></div>'+
      (hist.length ? '<div class="c-h">Recent</div>'+hist.map(function(h){ return '<div class="c-orow"><div class="c-otext">'+fmtDate(h.date)+'</div><div class="c-sub">'+h.total+' / '+h.max+'</div></div>'; }).join("") : '')+
    '</div>';
  }
  function renderVivaRun(){
    var r = cv;
    if(r.i >= r.qs.length) return renderVivaEnd();
    var q = r.qs[r.i], sc = r.scores[r.i];
    var html = '<div class="c-qhead"><span class="c-sub">Viva · question '+(r.i+1)+' of '+r.qs.length+' · Module '+q.mod+'</span><button class="c-link" data-go="viva">Stop</button></div>'+
      '<div class="card" style="margin-top:12px;"><div class="voice c-q">'+esc(q.q)+'</div>'+
      '<button class="c-link" id="c-timer" style="margin-top:10px;">&#9201; Start 2-minute timer</button><span id="c-timer-out" class="c-sub"></span>';
    if(!r.revealed){
      html += '<button class="btn-primary" id="c-viva-reveal" style="margin-top:14px;">I\'ve answered: show key points</button></div>';
      return html;
    }
    html += '<div class="c-model"><div class="eyebrow">Key points</div><ul>'+q.points.map(function(p){ return '<li>'+esc(p)+'</li>'; }).join("")+'</ul>'+refTag(q.ref)+'</div></div>';
    html += CRITERIA.map(function(c){
      var btns = ""; for(var v=0; v<=3; v++) btns += '<button class="chip c-score'+(sc[c.k]===v?' active':'')+'" data-crit="'+c.k+'" data-val="'+v+'">'+v+'</button>';
      return '<div class="c-crit"><div><b>'+c.name+'</b><div class="c-sub">'+c.help+'</div></div><div class="c-scores">'+btns+'</div></div>';
    }).join("");
    var complete = CRITERIA.every(function(c){ return sc[c.k] !== undefined; });
    html += '<button class="btn-primary" id="c-viva-next" style="margin-top:14px;"'+(complete?'':' disabled')+'>'+(r.i+1<r.qs.length?'Next question':'Finish')+'</button>';
    return html;
  }
  function renderVivaEnd(){
    var r = cv, tot = {acc:0,comp:0,term:0,teach:0}, sum = 0;
    r.scores.forEach(function(s){ CRITERIA.forEach(function(c){ tot[c.k] += s[c.k]||0; sum += s[c.k]||0; }); });
    var max = r.qs.length*CRITERIA.length*3;
    if(!r.saved){ cs.viva.push({date:todayISO(), total:sum, max:max, by:tot}); r.saved = true; saveCS(); bumpStreak(); }
    var weakest = CRITERIA.slice().sort(function(a,b){ return tot[a.k]-tot[b.k]; })[0];
    return '<div class="fade-in card" style="text-align:center;margin-top:12px;"><div class="eyebrow" style="color:var(--accent)">Viva complete</div>'+
      '<div class="voice c-big">'+sum+' / '+max+'</div>'+
      CRITERIA.map(function(c){ var p = Math.round(tot[c.k]/(r.qs.length*3)*100); return '<div style="text-align:left;margin-top:10px;"><div class="c-sub">'+c.name+' '+tot[c.k]+'/'+(r.qs.length*3)+'</div>'+bar(p)+'</div>'; }).join("")+
      '<div class="c-sub" style="margin-top:12px;">Focus next time: '+weakest.name.toLowerCase()+'.</div>'+
      '<button class="btn-primary" data-go="home" style="margin-top:16px;">Back to course</button></div>';
  }

  // ---------- render + handlers ----------
  function renderView(){
    switch(cv.name){
      case "map": return renderMap();
      case "plan": return renderPlan();
      case "outcomes": return renderOutcomes();
      case "lesson": return renderLesson();
      case "quiz": return '<div class="fade-in">'+renderQuiz()+'</div>';
      case "review-empty": return '<div class="fade-in">'+topNav("Daily review")+'<div class="card"><div class="voice c-title">Nothing due</div><p class="c-sub" style="margin-top:6px;">Cards join review once you complete a lesson\'s practice step. Come back tomorrow, or start the next lesson.</p></div></div>';
      case "viva": return renderVivaHome();
      case "viva-run": return '<div class="fade-in">'+renderVivaRun()+'</div>';
      default: return renderHome();
    }
  }

  var timerHandle = null;
  function attach(){
    var root = document.getElementById("root");
    root.querySelectorAll("[data-go]").forEach(function(el){
      el.onclick = function(){
        var g = el.getAttribute("data-go");
        if(g === "flash"){ stopSpeech(); view = "home"; render(); return; }
        if(g === "review"){ startReview(); return; }
        quiz = null; show({name:g});
      };
    });
    var go = document.getElementById("c-next-go");
    if(go) go.onclick = function(){ nextStep().go(); };
    root.querySelectorAll("[data-lesson]").forEach(function(el){ el.onclick = function(){ openLesson(el.getAttribute("data-lesson")); }; });
    root.querySelectorAll("[data-checkpoint]").forEach(function(el){ el.onclick = function(){ startCheckpoint(el.getAttribute("data-checkpoint")); }; });

    var start = document.getElementById("c-start");
    if(start) start.onchange = function(){ if(start.value){ cs.startDate = start.value; saveCS(); render(); } };

    // lesson nav
    var nx = document.getElementById("c-nextstep");
    if(nx) nx.onclick = function(){
      var f = findLesson(cv.lid), ls = cs.lessons[cv.lid];
      ls.step = Math.min(ls.step+1, f.lesson.steps.length);
      if(ls.step >= f.lesson.steps.length){ ls.done = true; bumpStreak(); }
      quiz = null; saveCS(); stopSpeech(); window.scrollTo(0,0); render();
    };
    var pv = document.getElementById("c-prev");
    if(pv) pv.onclick = function(){ var ls = cs.lessons[cv.lid]; ls.step = Math.max(0, ls.step-1); quiz = null; saveCS(); stopSpeech(); window.scrollTo(0,0); render(); };
    var nar = document.getElementById("c-narrate");
    if(nar) nar.onclick = function(){
      var s = findLesson(cv.lid).lesson.steps[cs.lessons[cv.lid].step];
      var dg = s.diagram ? DIAGRAMS.get(s.diagram) : null;
      speak(s.title+". "+s.body.join(" ")+(dg ? " "+dg.narration : ""));
    };
    var pg = document.getElementById("c-practice-go");
    if(pg) pg.onclick = function(){ startPractice(cv.lid); };
    var pc = document.getElementById("c-practice-close");
    if(pc) pc.onclick = function(){ quiz = null; render(); };

    // tasks
    var tt = document.getElementById("c-task-text");
    function taskState(){
      var f = findLesson(cv.lid), s = f.lesson.steps[cs.lessons[cv.lid].step], key = taskKey(cv.lid, s.type);
      if(!cs.tasks[key]) cs.tasks[key] = {text:"", ticks:[], revealed:false, done:false};
      return cs.tasks[key];
    }
    if(tt) tt.oninput = function(){ taskState().text = tt.value; saveCS(); };
    var rv = document.getElementById("c-reveal");
    if(rv) rv.onclick = function(){ var t = taskState(); if(tt) t.text = tt.value; t.revealed = true; saveCS(); render(); };
    root.querySelectorAll("[data-tick]").forEach(function(el){
      el.onclick = function(){ var t = taskState(), i = +el.getAttribute("data-tick"); t.ticks[i] = !t.ticks[i]; saveCS(); render(); };
    });
    var td = document.getElementById("c-task-done");
    if(td) td.onclick = function(){ var t = taskState(); t.done = true; t.date = todayISO(); saveCS(); render(); };

    var tm = document.getElementById("c-timer");
    if(tm) tm.onclick = function(){
      var secs = cv.name === "viva-run" ? 120 : 90, out = document.getElementById("c-timer-out");
      clearInterval(timerHandle);
      timerHandle = setInterval(function(){
        secs--; if(!document.body.contains(out)){ clearInterval(timerHandle); return; }
        out.textContent = " "+Math.floor(secs/60)+":"+("0"+(secs%60)).slice(-2);
        if(secs <= 0){ clearInterval(timerHandle); out.textContent = " Time"; }
      }, 1000);
      out.textContent = " "+Math.floor(secs/60)+":"+("0"+(secs%60)).slice(-2);
    };

    // quiz
    root.querySelectorAll(".opt[data-opt]").forEach(function(el){
      el.onclick = function(){
        if(!quiz || quiz.answered) return;
        var card = quiz.queue[quiz.idx], chosen = quiz.options[+el.getAttribute("data-opt")];
        quiz.selected = chosen; answer(chosen === card.short);
      };
    });
    var ti = document.getElementById("c-type");
    if(ti){
      if(!quiz.answered) ti.focus();
      var grow = function(){ ti.style.height = "auto"; ti.style.height = ti.scrollHeight+"px"; };
      grow();
      ti.oninput = function(){ quiz.typed = ti.value; grow(); };
      ti.onkeydown = function(e){ if(e.key === "Enter"){ e.preventDefault(); var b = document.getElementById("c-q-check"); if(b) b.click(); } };
    }
    var ck = document.getElementById("c-q-check");
    if(ck) ck.onclick = function(){
      var v = ti ? ti.value : "";
      if(!v.trim()){ quiz.err = true; render(); return; }
      quiz.err = false; quiz.typed = v;
      answer(checkTyped(v, quiz.queue[quiz.idx]));
    };
    var qn = document.getElementById("c-q-next");
    if(qn) qn.onclick = function(){ quiz.idx++; quiz.answered = false; quiz.selected = null; quiz.typed = ""; quiz.options = null; render(); };
    var qq = document.getElementById("c-quit");
    if(qq) qq.onclick = function(){ quiz = null; show({name:"home"}); };
    var say = document.getElementById("c-say");
    if(say) say.onclick = function(){
      if(!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(say.getAttribute("data-term")); u.lang = "ko-KR"; u.rate = 0.8;
      var vs = window.speechSynthesis.getVoices(), ko = vs.find(function(v){ return v.lang && v.lang.indexOf("ko") === 0; });
      if(ko) u.voice = ko;
      window.speechSynthesis.speak(u);
    };

    // viva
    var vg = document.getElementById("c-viva-go");
    if(vg) vg.onclick = startViva;
    var vr = document.getElementById("c-viva-reveal");
    if(vr) vr.onclick = function(){ cv.revealed = true; render(); };
    root.querySelectorAll("[data-crit]").forEach(function(el){
      el.onclick = function(){ cv.scores[cv.i][el.getAttribute("data-crit")] = +el.getAttribute("data-val"); render(); };
    });
    var vn = document.getElementById("c-viva-next");
    if(vn) vn.onclick = function(){ cv.i++; cv.revealed = false; window.scrollTo(0,0); render(); };
  }

  return {
    open: function(){
      loadCS(function(s){
        cs = s;
        if(!cs.startDate){ cs.startDate = todayISO(); saveCS(); }
        indexCards();
        cv = {name:"home"}; quiz = null;
        view = "course"; render();
      });
    },
    render: function(root){ root.innerHTML = renderView(); attach(); },
    // Exposed for tests.
    _cards: function(){ indexCards(); return CARD; },
    _courseCard: function(id){ return courseCard(id); },
    _quiz: function(){ return quiz; }
  };
})();
