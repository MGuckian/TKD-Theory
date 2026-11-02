// SVG diagrams for lessons. Each returns {svg, caption, narration}. Only drawn where the
// source gives enough detail; see DISCREPANCIES.md for anything flagged.
var DIAGRAMS = (function(){
  var C = {line:"rgba(231,227,214,0.35)", text:"#E7E3D6", faint:"rgba(231,227,214,0.7)", accent:"#9BFF1F", box:"#1E2318"};

  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;"); }

  // Vertical timeline: items = [[label, text], ...]
  function timeline(items){
    var rowH = 46, top = 14, h = top*2 + rowH*(items.length-1) + 10;
    var out = '<svg viewBox="0 0 360 '+h+'" class="dg" role="img" aria-label="Timeline">';
    out += '<line x1="96" y1="'+top+'" x2="96" y2="'+(h-top)+'" stroke="'+C.line+'" stroke-width="2"/>';
    items.forEach(function(it, i){
      var y = top + i*rowH;
      out += '<g class="dg-step" style="animation-delay:'+(i*0.2)+'s">'+
        '<circle cx="96" cy="'+y+'" r="6" fill="'+C.accent+'"/>'+
        '<text x="86" y="'+(y+4)+'" text-anchor="end" font-size="12.5" font-weight="700" fill="'+C.accent+'">'+esc(it[0])+'</text>'+
        '<text x="108" y="'+(y+4)+'" font-size="13.5" fill="'+C.text+'">'+esc(it[1])+'</text>'+
        (it[2] ? '<text x="108" y="'+(y+19)+'" font-size="12.5" fill="'+C.faint+'">'+esc(it[2])+'</text>' : '')+
      '</g>';
    });
    return out + '</svg>';
  }

  // Numbered rows of English term and Korean term.
  function pairs(rows, caption, narration){
    var svg = '<svg viewBox="0 0 340 '+(rows.length*44+6)+'" class="dg" role="img" aria-label="'+esc(caption)+'">';
    rows.forEach(function(r, i){
      var y = 4 + i*44;
      svg += '<g class="dg-step" style="animation-delay:'+(i*0.2)+'s">'+
        '<rect x="2" y="'+y+'" width="336" height="38" rx="9" fill="'+C.box+'" stroke="'+C.line+'"/>'+
        '<text x="22" y="'+(y+24)+'" font-size="13" font-weight="700" fill="'+C.faint+'">'+(i+1)+'</text>'+
        '<text x="44" y="'+(y+24)+'" font-size="15" fill="'+C.text+'">'+esc(r[0])+'</text>'+
        '<text x="324" y="'+(y+24)+'" text-anchor="end" font-size="15" font-weight="700" fill="'+C.accent+'">'+esc(r[1])+'</text>'+
      '</g>';
    });
    return {svg: svg+'</svg>', caption:caption, narration:narration};
  }

  var defs = {
    tenets: function(){ return pairs([["Courtesy","Ye Ui"],["Integrity","Yom Chi"],["Perseverance","In Nae"],["Self-Control","Guk Gi"],["Indomitable Spirit","Baekjul Boolgul"]],
      "The five tenets, in order (p.12)", "Courtesy, Ye Ui. Integrity, Yom Chi. Perseverance, In Nae. Self-control, Guk Gi. Indomitable spirit, Baekjul Boolgul."); },
    virtues: function(){ return pairs([["Humanity","In"],["Righteousness","Ui"],["Propriety","Ye"],["Wisdom","Ji"],["Trust","Shin"]],
      "The five virtues (p.27–29)", "Humanity, In. Righteousness, Ui. Propriety, Ye. Wisdom, Ji. Trust, Shin."); },

    name: function(){
      var parts = [["Tae","foot","jump, fly, kick"],["Kwon","fist","punch, strike"],["Do","art, way","the right path"]];
      var svg = '<svg viewBox="0 0 340 152" class="dg" role="img" aria-label="Tae Kwon Do">';
      parts.forEach(function(p, i){
        var x = 12 + i*110;
        svg += '<g class="dg-step" style="animation-delay:'+(i*0.5)+'s">'+
          '<rect x="'+x+'" y="14" width="96" height="76" rx="12" fill="'+C.box+'" stroke="'+C.line+'"/>'+
          '<text x="'+(x+48)+'" y="52" text-anchor="middle" font-size="24" font-weight="700" fill="'+C.accent+'" font-family="Oswald,sans-serif">'+p[0]+'</text>'+
          '<text x="'+(x+48)+'" y="74" text-anchor="middle" font-size="13.5" fill="'+C.text+'">'+p[1]+'</text>'+
          '<text x="'+(x+48)+'" y="110" text-anchor="middle" font-size="14" fill="'+C.faint+'">'+p[2]+'</text>'+
        '</g>';
      });
      svg += '<text class="dg-step" style="animation-delay:1.6s" x="170" y="142" text-anchor="middle" font-size="15" fill="'+C.text+'">= mental training + unarmed combat technique</text>';
      return {svg: svg+'</svg>', caption:"The three parts of the name (p.15)",
        narration:"Tae means to jump or fly, to kick with the foot. Kwon is the fist, to punch. Do is an art or way. Together: mental training plus the techniques of unarmed combat."};
    },

    // Order follows the illustration on p.725 (fundamental movement, pattern, sparring, dallyon,
    // self-defence technique). The numbered list on the same page orders them differently.
    cycle: function(){
      var labels = ["Fundamental movements","Patterns","Sparring","Dallyon","Self-defence"];
      var cx = 170, cy = 120, r = 82, svg = '<svg viewBox="-12 0 364 250" class="dg" role="img" aria-label="Cycle of Taekwon-Do">';
      svg += '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+C.line+'" stroke-width="2" stroke-dasharray="4 5"/>';
      svg += '<circle class="dg-orbit" cx="'+cx+'" cy="'+(cy-r)+'" r="5" fill="'+C.accent+'" style="transform-origin:'+cx+'px '+cy+'px"/>';
      svg += '<text x="'+cx+'" y="'+(cy-2)+'" text-anchor="middle" font-size="15" font-weight="700" fill="'+C.accent+'" font-family="Oswald,sans-serif">Soonhwan Do</text>';
      svg += '<text x="'+cx+'" y="'+(cy+15)+'" text-anchor="middle" font-size="12.5" fill="'+C.faint+'">no beginning, no end</text>';
      labels.forEach(function(l, i){
        var a = -Math.PI/2 + i*2*Math.PI/labels.length;
        var x = cx + Math.cos(a)*r, y = cy + Math.sin(a)*r;
        var tx = cx + Math.cos(a)*(r+20), ty = cy + Math.sin(a)*(r+20) + 4;
        var anchor = Math.abs(Math.cos(a)) < 0.2 ? "middle" : (Math.cos(a) > 0 ? "start" : "end");
        svg += '<g class="dg-step" style="animation-delay:'+(i*0.25)+'s">'+
          '<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="8" fill="'+C.box+'" stroke="'+C.accent+'" stroke-width="2"/>'+
          '<text x="'+(x).toFixed(1)+'" y="'+(y+4).toFixed(1)+'" text-anchor="middle" font-size="10" font-weight="700" fill="'+C.accent+'">'+(i+1)+'</text>'+
          '<text x="'+tx.toFixed(1)+'" y="'+ty.toFixed(1)+'" text-anchor="'+anchor+'" font-size="13" fill="'+C.text+'">'+l+'</text>'+
        '</g>';
      });
      return {svg: svg+'</svg>', caption:"Cycle of Taekwon-Do, in the order of the illustration on p.725",
        narration:"Fundamental movements lead to patterns, patterns to sparring, alongside conditioning or dallyon, and then to self-defence. Then you return to fundamentals. The cycle has no beginning and no end."};
    },

    society: function(){
      var rows = [["Ideal","ruler's character so high that people live freely"],["Moral","people praise a caring ruler"],["Legalistic","people obey laws out of fear"],["Worst","rule by deception and force"]];
      var svg = '<svg viewBox="0 0 340 200" class="dg" role="img" aria-label="Four kinds of society">';
      rows.forEach(function(rw, i){
        var y = 10 + i*46, w = 320 - i*36, x = (340-w)/2;
        svg += '<g class="dg-step" style="animation-delay:'+(i*0.25)+'s">'+
          '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="38" rx="9" fill="'+(i===0?"rgba(155,255,31,0.14)":C.box)+'" stroke="'+(i===0?C.accent:C.line)+'"/>'+
          '<text x="170" y="'+(y+16)+'" text-anchor="middle" font-size="12.5" font-weight="700" fill="'+(i===0?C.accent:C.text)+'">'+rw[0]+'</text>'+
          '<text x="170" y="'+(y+31)+'" text-anchor="middle" font-size="12.5" fill="'+C.faint+'">'+rw[1]+'</text>'+
        '</g>';
      });
      return {svg: svg+'</svg>', caption:"Lao-Tzu's four kinds of society, best to worst (p.26)",
        narration:"Best is the ideal society, where the ruler's character lets people live freely. Next, a moral society that praises a caring ruler. Then a legalistic society that obeys out of fear. Worst, rule by deception and force."};
    },

    origins: function(){
      return {svg: timeline([
          ["c.3000 BC","Egypt: boxing-like fighting","tomb paintings, inscriptions"],
          ["3000–2300 BC","Mesopotamia and Sumer","reports of open hand fighting"],
          ["c.700 BC","Greek Olympiads","boxing, wrestling; later pancratium"],
          ["1C BC–7C AD","Three Kingdoms of Korea","Silla's Hwa Rangdo; Soo Bak-Gi"],
          ["c.520 AD","Bodhidharma legend","Shaolin temple: little evidence"],
          ["Koryo","Royal Taek Kyon contests","25 postures"],
          ["1401–1408","3rd Lee Dynasty king","recruits Taek Kyon experts"],
          ["1909–1945","Japanese occupation","all martial arts banned"]
        ]), caption:"Origins of open hand fighting (p.18–21). Dates as given in the encyclopaedia.",
        narration:"Egypt around three thousand BC. Mesopotamia and Sumer. The Greek Olympiads. Korea's three kingdoms and the Hwa Rangdo. The Bodhidharma legend. Taek Kyon contests in Koryo. Then decline, and a ban under Japanese occupation."};
    },

    timeline: function(){
      return {svg: timeline([
          ["9 Nov 1918","Choi Hong Hi born","frail as a child (p.747)"],
          ["~age 15","Learns Taek Kyon","encouraged by calligraphy teacher"],
          ["Japan","Karate black belt","(p.23)"],
          ["Pre-1945","Imprisoned by Japanese","Pyongyang Student Soldier's Incident"],
          ["Aug 1945","Liberation of Korea","(p.748)"],
          ["Jan 1946","Teaches his soldiers","new 2nd lieutenant (p.21, p.23)"],
          ["11 Apr 1955","Named Taekwon-Do","(p.24)"],
          ["Mar 1959","Tour: S. Vietnam, Taiwan","three ideals set out (p.24)"],
          ["22 Mar 1966","ITF formed","(p.752)"],
          ["Jun 1979","AETF formed, Oslo","(p.755)"]
        ]), caption:"Key dates in the history of Taekwon-Do",
        narration:"Born in 1918. Taek Kyon at about fifteen, Karate in Japan. Imprisoned, freed at liberation in 1945. Teaching soldiers from January 1946. Named Taekwon-Do on the eleventh of April 1955. The 1959 tour. The ITF formed on the twenty-second of March 1966."};
    }
  };

  return { get: function(name){ return defs[name] ? defs[name]() : null; } };
})();
