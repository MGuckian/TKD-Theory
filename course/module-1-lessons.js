// Module 1 micro-lessons (12-15 min each, six per week), core lists, and dojang tasks.
// Step types: guess (pre-question), read (one idea, optional "picture it" cue and diagram),
// check (2-4 cards straight after the idea), dump (recall a whole list, then tick it off),
// say (answer out loud, record, compare with the model, self-mark).
// All wording original; refs are printed encyclopaedia pages unless marked Club.
(function(m){

  m.lists = {
    tenets: {title:"The five tenets, with Korean", ref:"p.12", items:[
      "Courtesy · Ye Ui","Integrity · Yom Chi","Perseverance · In Nae","Self-Control · Guk Gi","Indomitable Spirit · Baekjul Boolgul"]},
    courtesy: {title:"The nine elements of courtesy", ref:"p.12", palace:true, items:[
      "Give way to one another (mutual concession)",
      "Be ashamed of your own vices; reject them in others",
      "Be polite to one another",
      "Encourage justice and humanity",
      "Distinguish instructor and student, senior and junior, elder and younger",
      "Behave according to etiquette",
      "Respect other people's possessions",
      "Handle matters fairly and sincerely",
      "Refuse any gift when in doubt"]},
    composition: {title:"The five elements of composition", ref:"p.725", items:[
      "Fundamental movements (basic training)","Patterns (platoon tactics)","Dallyon (maintenance of equipment)","Sparring (field exercises)","Self-defence (actual combat)"]},
    virtues: {title:"The five virtues, with Korean", ref:"p.27–29", items:[
      "Humanity · In","Righteousness · Ui","Propriety · Ye","Wisdom · Ji","Trust · Shin"]},
    guidelines: {title:"The nine guidelines", ref:"p.48", palace:true, items:[
      "Go where it is tough; do what is worth doing",
      "Gentle to the weak, tough to the strong",
      "Content in money and position, never in skill",
      "Finish what you begin, large or small",
      "Teach anyone, whatever religion, race or ideology",
      "Never yield to repression or threat in a noble cause",
      "Teach attitude and skill by action, not words",
      "Stay yourself as circumstances change",
      "Eternal teacher: body when young, words when old, moral example after death"]},
    hwarang: {title:"The Hwa Rangdo five-point code (Won Kang)", ref:"p.19", items:[
      "Loyalty to your king","Obedience to your parents","Honour to your friends","Never retreat in battle","Make a just kill"]},
    ideals: {title:"The three ideals of 1959", ref:"p.24", items:[
      "Upright mind and strong body: stand for justice",
      "Brotherhood regardless of religion, race, nation or ideology",
      "Build a peaceful society of justice, morality, trust and humanism"]},
    principles: {title:"The twelve technical principles", ref:"p.25", palace:true, items:[
      "Maximum power by scientific formula and kinetic energy",
      "Principles clear enough for a novice to tell right from wrong",
      "Distance and angle exactly defined",
      "Purpose and method clear and simple, to teach and learn",
      "Rational teaching methods for everyone",
      "Correct breathing: more speed, less fatigue",
      "Attack any vital spot; defend any attack",
      "Each attacking tool defined by the body's structure",
      "Easy to execute: enjoyable as sport and recreation",
      "Promote health; prevent injury",
      "Harmonious and rhythmical: aesthetically pleasing",
      "Each pattern movement expresses its namesake"]}
  };

  // Korean terms for the printable sheet: [term, meaning, root note, ref]. Roots are Sino-Korean
  // readings not printed in the sources (see DISCREPANCIES.md).
  m.terms = [
    ["Taekwon-Do Jungshin","Tenets of Taekwon-Do","jung = essence, shin = spirit","p.12"],
    ["Ye Ui","Courtesy","ye = propriety, ui = form, manners","p.12"],
    ["Yom Chi","Integrity","yom = upright, chi = shame","p.12"],
    ["In Nae","Perseverance","both syllables: endure","p.12"],
    ["Guk Gi","Self-Control","guk = overcome, gi = oneself","p.12"],
    ["Baekjul Boolgul","Indomitable Spirit","a hundred times bent, never yielding","p.12"],
    ["Taekwon-Do Goosung","Composition of Taekwon-Do","goosung = structure","p.725"],
    ["Soonhwan Do","Cycle of Taekwon-Do","soonhwan = circulation","p.725"],
    ["Dallyon","Conditioning; in the military parallel, maintenance of equipment","","p.725"],
    ["Jungshin Sooyang","Moral culture","jungshin = mind, sooyang = cultivation","p.26"],
    ["In","Humanity","benevolence","p.27"],
    ["Ui","Righteousness","rightness, justice","p.28"],
    ["Ye","Propriety","proper conduct (the Ye of Ye Ui)","p.29"],
    ["Ji","Wisdom","knowing","p.29"],
    ["Shin","Trust","keeping faith","p.29"],
    ["Jung-Joong-Dong","Active reflection in silence","","p.32"],
    ["Ki / Chi","Active energy (moves) / will (leads)","","p.32"],
    ["Taekwon-Do Chul Hak","Philosophy of Taekwon-Do","chul = wise, hak = study","p.47"],
    ["Taekwon-Do Hun Jang","Charter of Taekwon-Do","hun = constitution, jang = article","p.9"],
    ["Taekwon-Do Yoksa","History of Taekwon-Do","","p.23"],
    ["Hwa Rangdo","Silla's elite young warrior corps","","p.19"],
    ["Soo Bak-Gi","Early Korean hand fighting (Koguryo)","","p.20"],
    ["Taek Kyon","Traditional Korean foot fighting","","p.20–21"]
  ];

  // One real-world teaching task per week, done in your own classes.
  m.classTasks = [
    {week:1, task:"Before line-up, ask juniors to recite the tenets. Then give the Korean term and one book example for one tenet, in under a minute.", ref:"p.12–14"},
    {week:2, task:"End one class with a 60-second thought on one of the five virtues, linked to something you saw in training that day.", ref:"p.27–29"},
    {week:3, task:"Tell a junior class how Taekwon-Do got its name (11 April 1955) and where it came from, in under two minutes.", ref:"p.21–24"}
  ];

  function R(title, ref, body, o){ var s = {type:"read", title:title, ref:ref, body:body}; for(var k in o) s[k] = o[k]; return s; }
  function C(ids){ return {type:"check", cards:ids}; }
  function G(q, options, answer, reveal, ref){ return {type:"guess", q:q, options:options, answer:answer, reveal:reveal, ref:ref}; }
  function D(list){ return {type:"dump", list:list}; }

  m.lessons = [
    // ---------- Week 1: what Taekwon-Do is, and the tenets ----------
    {id:"m1a", week:1, title:"The name: Tae, Kwon, Do", outcomes:["m1o1"], video:"",
     summary:["Tae: jump or fly, kick with the foot. Kwon: the fist, punch. Do: art or way.","Together: mental training plus unarmed combat, for self-defence and health.","Mental training must always be stressed, or the art can be misused."],
     steps:[
      G("What does the 'Do' in Taekwon-Do mean?", ["Fight","Art or way","Foot","Belt"], 1, "Do is an art or way: the right path laid down by earlier sages.", "p.15"),
      R("Why this matters", "p.15", ["At 4th Dan you stop being only a student. You explain the art and examine others.","Every explanation starts with one question: what is Taekwon-Do? This week gives you the book's answer."]),
      R("Tae, Kwon, Do", "p.15", ["Tae: jumping or flying, kicking with the foot.","Kwon: the fist, punching with the hand.","Do: an art or way.","Together: mental training plus the techniques of unarmed combat, for self-defence and health."],
        {diagram:"name", picture:"A flying kick (Tae), a straight punch (Kwon), then a bow (Do). The bow is what makes the first two an art."}),
      C(["d01","d02","d03","ph12"]),
      R("More than fighting", "p.15", ["The book calls Taekwon-Do a way of life: the scientific use of the body for self-defence.","Wrongly used it can be lethal, so mental training must always be stressed."],
        {picture:"A loaded weapon handed over with a manual on how not to use it. Mental training is that manual."}),
      C(["d04","d06","m1c01","m1c02"]),
      {type:"say", kind:"Explain it", secs:60, ref:"p.15",
       prompt:"In one minute: what does Taekwon-Do mean, and why does mental training matter?",
       model:"Tae is the foot, jumping and kicking. Kwon is the fist, punching. Do is the art or way. Together they mean mental training plus unarmed combat for self-defence and health. Mental training is stressed because the techniques can be lethal if misused.",
       rubric:[{point:"Tae, Kwon and Do each explained", ref:"p.15"},{point:"Mental training plus unarmed combat", ref:"p.15"},{point:"Reason: prevents misuse of a lethal skill", ref:"p.15"}]}
     ]},

    {id:"m1b", week:1, title:"Built for a moving opponent", outcomes:["m1o1"], video:"",
     summary:["Designed for swift retaliation against a moving aggressor, using the opponent's momentum.","Training turns technique into conditioned reflex.","The book dismisses myths such as killing a bull bare-handed."],
     steps:[
      G("Taekwon-Do is specially designed for retaliation against what kind of attacker?", ["A stationary one","A moving one","An armed one","A larger one"], 1, "A moving aggressor. Much of the power comes from meeting the opponent's own momentum.", "p.16"),
      R("A moving target", "p.16", ["Many techniques combine the blow with the opponent's own forward movement.","Using an attacker's momentum, even a slight push can upset their balance."],
        {picture:"Someone running into a door that you just pushed. Their speed adds to your force."}),
      C(["m1c03","d05","d07"]),
      R("Reflex, not thought", "p.16", ["Experts don't stop to think. Constant practice has made their actions conditioned reflexes.","That is why the book keeps stressing regular training."]),
      C(["m1c04"]),
      R("Four facets (club syllabus)", "Club (1st Kup)", ["The club syllabus describes four facets: a sport, a martial art, a way of life, and a tool for social development.","This list isn't in the encyclopaedia, but expect it in club gradings."]),
      C(["ph13"]),
      {type:"say", kind:"Teach-back", secs:60, ref:"p.15–16",
       prompt:"A parent asks: 'Isn't this just kicking and punching?' Answer them out loud in under a minute.",
       model:"Use the name: foot, fist and Do, the way. Explain that training builds discipline, humility and a sense of justice, not only fighting skill. Mention that techniques become reflexes through practice, which is why regular training matters. Keep it warm and plain.",
       rubric:[{point:"Used the meaning of 'Do'", ref:"p.15"},{point:"Mentioned character or mental training", ref:"p.15"},{point:"Plain language a parent would follow", ref:""}]}
     ]},

    {id:"m1c", week:1, title:"The cycle of composition", outcomes:["m1o1"], video:"",
     summary:["Five elements: fundamental movements, patterns, dallyon, sparring, self-defence (Soonhwan Do).","Like the Deity, the cycle has no beginning or end: you always return to fundamentals.","Military parallel: basic training, equipment upkeep, platoon tactics, field exercises, actual combat."],
     steps:[
      G("How many elements make up the composition of Taekwon-Do?", ["Three","Five","Seven","Nine"], 1, "Five. You'll meet them now, as a cycle.", "p.725"),
      R("Five linked parts", "p.725", ["Fundamental movements, patterns, dallyon (conditioning), sparring and self-defence.","They are so closely linked that none can be taught alone. The cycle has no beginning or end."],
        {diagram:"cycle", picture:"A wheel. Wherever you push it, it comes back round to fundamentals."}),
      C(["c01","c02","cm01","c08"]),
      R("The military parallel", "p.725", ["Fundamental movements: a soldier's basic training. Dallyon: maintaining equipment. Patterns: platoon tactics.","Sparring: field exercises. Self-defence: actual combat."],
        {picture:"A recruit drilling alone, then cleaning kit, then moving as a platoon, then on manoeuvres, then in real combat."}),
      C(["c03","c04","c05","c06","c07"]),
      D("composition"),
      C(["m1c06"])
     ]},

    {id:"m1d", week:1, title:"The tenets: courtesy", outcomes:["m1o2"], video:"",
     summary:["Five tenets: Courtesy (Ye Ui), Integrity (Yom Chi), Perseverance (In Nae), Self-Control (Guk Gi), Indomitable Spirit (Baekjul Boolgul).","Courtesy has nine listed elements (the club lists five of them).","Success in training depends largely on observing the tenets."],
     steps:[
      G("How many elements of courtesy does the encyclopaedia list?", ["Three","Five","Nine","Twelve"], 2, "Nine. The club syllabus lists only five of them, so know both.", "p.12"),
      R("Five tenets", "p.12", ["Courtesy, Integrity, Perseverance, Self-Control, Indomitable Spirit.","The book says success or failure in training depends largely on how they are observed."],
        {diagram:"tenets"}),
      C(["t01","t02","t03","t04"]),
      C(["t05","t06","t07"]),
      D("tenets"),
      R("Courtesy (Ye Ui)", "p.12", ["An unwritten rule from ancient teachers, to keep people in harmony.","Its nine elements include: give way to one another, be polite, encourage justice, respect seniority, respect others' things, and refuse gifts when in doubt."],
        {picture:"Two students reaching a doorway together. Each steps back for the other: mutual concession."}),
      C(["t08","m1c10"]),
      D("courtesy")
     ]},

    {id:"m1e", week:1, title:"Integrity and perseverance", outcomes:["m1o2"], video:"",
     summary:["Integrity: know right from wrong, and feel guilt when wrong. Eight listed failures, for instructors and students.","Perseverance: set a goal and keep going. Robert the Bruce and the spider."],
     steps:[
      G("Which of these does the book call a failure of integrity?", ["Losing a sparring match","Asking an instructor for rank","Forgetting a pattern","Training too hard"], 1, "Requesting rank, or trying to buy it, is one of the eight listed failures.", "p.13"),
      R("Integrity (Yom Chi)", "p.13", ["Wider than the dictionary meaning: knowing right from wrong, and feeling guilt when wrong.","Instructor failures: poor technique through ignorance, hiding it behind a smart hall or flattery, teaching for money."]),
      R("Student failures", "p.13", ["Rigging breaking boards, asking for or buying rank, wanting rank for ego, saying one thing and doing another, being too proud to ask juniors."],
        {picture:"A board with a hidden saw-cut. It breaks, and nobody learns anything."}),
      C(["m1c07","t13","m1c12"]),
      R("Perseverance (In Nae)", "p.13", ["Set a goal, a degree or a technique, and keep at it. Patience brings merit.","Robert the Bruce learned persistence from a spider before freeing Scotland. The book calls overcoming every difficulty a key to leading in Taekwon-Do."],
        {picture:"A spider failing to swing its thread across, again and again, then making it."}),
      C(["t09","m1c11"]),
      {type:"say", kind:"Scenario", secs:90, ref:"p.12–13",
       prompt:"A brown belt asks you to 'have a word' with the examiner so they can grade early. Which tenet is at stake, and what do you say?",
       model:"Integrity: requesting rank is one of the book's listed failures. Reply calmly and kindly (courtesy). Explain that rank reflects an earned standard, then set a clear goal and training plan for the next grading (perseverance).",
       rubric:[{point:"Named integrity, with the requesting-rank example", ref:"p.13"},{point:"Responded with courtesy", ref:"p.12"},{point:"Gave them a goal to work towards", ref:"p.13"}]}
     ]},

    {id:"m1f", week:1, title:"Self-control and indomitable spirit", outcomes:["m1o2"], video:"",
     summary:["Self-control: vital in free sparring and in life; Lao-Tzu: the stronger person overcomes themselves.","Indomitable spirit: Leonidas and the 300 at Thermopylae; Confucius: silence before injustice is cowardice."],
     steps:[
      G("Lao-Tzu says the stronger person is the one who wins over whom?", ["Their opponent","Their teacher","Themselves","Their seniors"], 2, "Themselves. Guk Gi literally means 'overcoming oneself'.", "p.14"),
      R("Self-Control (Guk Gi)", "p.14", ["Losing control in free sparring can injure both people.","Living or working beyond your capability is also a lack of self-control."],
        {picture:"A head kick stopped a hand's width from the face. That is skill under control."}),
      C(["t10","m1c08"]),
      R("Indomitable Spirit (Baekjul Boolgul)", "p.14", ["Leonidas and his 300 Spartans held Thermopylae against Xerxes' far larger army.","Faced with injustice, a student acts without fear, whatever the odds. Confucius: failing to speak out against injustice is cowardice."],
        {picture:"Three hundred shields in a narrow pass, facing an army that fills the valley."}),
      C(["t11","t12"]),
      D("tenets"),
      {type:"say", kind:"Explain it", secs:120, ref:"p.12–14",
       prompt:"Name the five tenets with Korean terms, and give one book example for each.",
       model:"Courtesy, Ye Ui: e.g. distinguishing senior from junior. Integrity, Yom Chi: e.g. never rigging breaking boards. Perseverance, In Nae: Robert the Bruce and the spider. Self-Control, Guk Gi: control in free sparring; Lao-Tzu on overcoming oneself. Indomitable Spirit, Baekjul Boolgul: Leonidas and the 300 at Thermopylae.",
       rubric:[{point:"All five tenets in order", ref:"p.12"},{point:"All five Korean terms", ref:"p.12"},{point:"Examples for courtesy and integrity", ref:"p.12–13"},{point:"Robert the Bruce", ref:"p.13"},{point:"Examples for self-control and indomitable spirit", ref:"p.14"}]}
     ]},

    // ---------- Week 2: moral culture and philosophy ----------
    {id:"m1g", week:2, title:"What moral culture is", outcomes:["m1o3"], video:"",
     summary:["Moral culture (Jungshin Sooyang): becoming an exemplary person, like Confucius, through mental discipline.","Lao-Tzu's societies, best to worst: ideal, moral, legalistic, rule by deception and force."],
     steps:[
      G("Moral culture is the effort to become an exemplary person like whom?", ["Bodhidharma","Confucius","Leonidas","Mencius"], 1, "Confucius.", "p.26"),
      R("Jungshin Sooyang", "p.26", ["Moral culture is the effort to become an exemplary person, with Confucius as the model.","It comes through constant mental discipline. Such a person can help build a better society, even after death, through their example."]),
      C(["mc01","m1c13"]),
      R("Four kinds of society", "p.26", ["Best: the ruler's character is so high that people live freely by doing their duty. Next: people praise a caring ruler.","Then: a legalistic society, obeying out of fear. Worst: rule by deception and force, ending in ruin."],
        {diagram:"society", picture:"A class that runs itself because everyone respects the instructor, compared with one held together only by punishments."}),
      C(["m1c14"])
     ]},

    {id:"m1h", week:2, title:"The five virtues", outcomes:["m1o3"], video:"",
     summary:["Humanity (In), Righteousness (Ui), Propriety (Ye), Wisdom (Ji), Trust (Shin).","Confucius: virtue is like the north star."],
     steps:[
      G("Which virtue is about judging right from wrong, mainly in your own conduct?", ["Trust","Wisdom","Humanity","Propriety"], 1, "Wisdom (Ji): judging right and wrong in your own affairs, not other people's.", "p.29"),
      R("Five virtues", "p.27–29", ["Humanity (In): feeling for others' misfortunes and loving all equally.","Righteousness (Ui): shame at unjust acts, and doing your duty."],
        {diagram:"virtues"}),
      C(["mc02","mc03","mc04","m1c20"]),
      R("Three more", "p.29", ["Propriety (Ye): good conduct, like sharing your bread when both of you are starving.","Wisdom (Ji): judging right from wrong, above all in your own conduct.","Trust (Shin): keeping your word to everyone."],
        {picture:"Two starving people; one breaks their only loaf in half for the other."}),
      C(["mc05","mc06","mc07","m1c21","ph14"]),
      D("virtues"),
      R("The north star", "p.27", ["Confucius: virtue is like the north star. Everything else arranges itself around it."]),
      C(["mc08"])
     ]},

    {id:"m1i", week:2, title:"Becoming a better person", outcomes:["m1o3"], video:"",
     summary:["Mencius: even a robber saves a child from a well, so people are basically good.","Find your nature by keeping inborn goodness and dropping greed.","Mencius: position, age and moral integrity; three happinesses: family, honour, educating the young."],
     steps:[
      G("In Mencius' story, what does a robber do when he sees a child about to fall into a well?", ["Robs the house","Runs away","Saves the child","Calls for help"], 2, "He saves the child, forgetting the robbery. Mencius' point: people are basically good.", "p.27"),
      R("Return to your nature", "p.27, p.29", ["Greed and ambition hide our basic goodness.","Two ways to find yourself: keep the goodness you were born with, and give up greed for material things."],
        {picture:"A robber dropping his sack to catch a child at the edge of a well."}),
      C(["mc09","m1c19"]),
      R("Habits of a cultivated person", "p.29–32", ["Be humble: ripe grain bows its head, weeds stand up straight. Criticise yourself daily. Respect elders. Be frugal. Let actions speak.","Mencius valued position, age and moral integrity, and named three happinesses: a harmonious family, living honourably, educating the young."],
        {picture:"A wheat field: the full ears bow low, the empty ones stand tall."}),
      C(["m1c17","m1c18"])
     ]},

    {id:"m1j", week:2, title:"Mind, spirit and the instructor", outcomes:["m1o3"], video:"",
     summary:["Jung-Joong-Dong: active reflection in silence, not withdrawal.","Ki moves; Chi (will) leads.","Without moral culture an instructor may create bullies."],
     steps:[
      G("In Taekwon-Do, is meditation a withdrawal from the world?", ["Yes","No"], 1, "No. It's active reflection on your mistakes, to keep improving: Jung-Joong-Dong.", "p.32"),
      R("Jung-Joong-Dong", "p.32", ["Meditation here is active: silent reflection on past mistakes, so you keep improving.","Ki is the active energy that moves. Chi is the will that leads."],
        {picture:"A muddy pond left alone until it settles clear."}),
      C(["m1c15","m1c16"]),
      R("Why instructors can't skip it", "p.33", ["The book is blunt: without moral culture, an instructor gives a destructive force to people who may become bullies."]),
      {type:"say", kind:"Explain it", secs:90, ref:"p.26–33",
       prompt:"What is moral culture, and why does the book say an instructor cannot leave it out? Include the five virtues.",
       model:"Moral culture (Jungshin Sooyang) is the effort to become an exemplary person through mental discipline, on the model of Confucius. Its five virtues are humanity (In), righteousness (Ui), propriety (Ye), wisdom (Ji) and trust (Shin). Instructors must teach it because training gives real destructive power; without character development they may create bullies.",
       rubric:[{point:"Becoming an exemplary person through mental discipline", ref:"p.26"},{point:"Jungshin Sooyang", ref:"p.26"},{point:"Five virtues with Korean", ref:"p.27–29"},{point:"The bully risk for instructors", ref:"p.33"}]},
      {type:"say", kind:"Scenario", secs:90, ref:"p.29–32",
       prompt:"A talented junior black belt keeps belittling white belts. Say what you'd tell them privately.",
       model:"Speak privately and respectfully. Use humility (ripe grain bows its head) and propriety between senior and junior. Ask them to reflect on it themselves, then give them a positive job, such as helping a beginner, so their actions speak.",
       rubric:[{point:"Private and respectful", ref:""},{point:"Used humility or propriety", ref:"p.29–30"},{point:"Encouraged self-reflection", ref:"p.30"},{point:"Gave a positive action", ref:"p.32"}]}
     ]},

    {id:"m1k", week:2, title:"The purpose of Taekwon-Do", outcomes:["m1o4"], video:"",
     summary:["Philosophy: Taekwon-Do Chul Hak. Remedy for a corrupt age: moral civilisation.","Utmost purpose: eliminate fighting by stopping the strong oppressing the weak.","Never for selfish, aggressive, violent, commercial or political use."],
     steps:[
      G("What is the utmost purpose of Taekwon-Do?", ["To win competitions","To eliminate fighting","To build fitness","To spread Korean culture"], 1, "To eliminate fighting, by discouraging the strong from oppressing the weak.", "p.47"),
      R("The problem and the remedy", "p.47", ["The founder saw rising violence and lost morality, with the strong preying on the weak.","His remedy: develop moral civilisation fast enough to keep pace with material and scientific progress."]),
      C(["m1c22","m1c23"]),
      R("The utmost purpose", "p.47", ["Eliminate fighting by discouraging the strong from oppressing the weak. The power must rest on humanity, justice, morality, wisdom and faith.","So never for selfish, aggressive or violent ends, nor commercial or political ones."],
        {picture:"A bully stepping back because someone calm and capable has stepped in."}),
      C(["ph01","m1c24"]),
      {type:"say", kind:"Explain it", secs:90, ref:"p.47–48",
       prompt:"State the utmost purpose of Taekwon-Do and the limits it places on its use.",
       model:"To eliminate fighting by discouraging the strong from oppressing the weak, with power based on humanity, justice, morality, wisdom and faith, helping to build a more peaceful world. So it must never be used for selfish, aggressive or violent purposes, nor commercially or politically.",
       rubric:[{point:"Eliminate fighting / stop the strong oppressing the weak", ref:"p.47"},{point:"Basis: humanity, justice, morality, wisdom, faith", ref:"p.47"},{point:"Limits: selfish, aggressive, violent, commercial, political", ref:"p.47"}]}
     ]},

    {id:"m1l", week:2, title:"The nine guidelines", outcomes:["m1o4"], video:"",
     summary:["Nine guidelines, e.g. gentle to the weak, tough to the strong; teach by action, not words; be the eternal teacher.","The Charter (Taekwon-Do Hun Jang): art as part of daily life, equality, humility, respect."],
     steps:[
      G("Guideline: be content with what you have in money and position, but never in what?", ["Rank","Skill","Health","Friends"], 1, "Skill. Never stop improving.", "p.48"),
      R("Nine guidelines (1 to 5)", "p.48", ["1 Go where it's tough. 2 Gentle to the weak, tough to the strong. 3 Content in money and position, never in skill. 4 Finish what you begin. 5 Teach anyone, whatever their religion, race or ideology."]),
      C(["ph02","ph03","m1c26","ph04"]),
      R("Nine guidelines (6 to 9)", "p.48", ["6 Never yield to repression or threat in a noble cause. 7 Teach by action, not words. 8 Stay yourself as things change. 9 Be the eternal teacher: body when young, words when old, moral example after death."],
        {picture:"A young instructor demonstrating, an older one explaining, and a photo on the dojang wall still teaching."}),
      C(["m1c27","ph05","m1c25"]),
      D("guidelines"),
      R("The Charter", "p.9", ["The Charter (Taekwon-Do Hun Jang) treats the art as part of daily life, like breathing.","Themes: health and intellect serving justice, humility, equality of all students, self-discipline over materialism, respect for seniors and juniors."]),
      C(["m1c28"]),
      {type:"say", kind:"Teach-back", secs:60, ref:"p.48",
       prompt:"Pick one guideline and teach it to a 12-year-old in under a minute, with an example from their life.",
       model:"State the guideline plainly, e.g. 'always finish what you begin'. Give a school or training example, such as finishing a pattern after a mistake. Ask them for their own example.",
       rubric:[{point:"Guideline stated accurately", ref:"p.48"},{point:"Concrete, age-appropriate example", ref:""},{point:"Asked a question to check understanding", ref:""}]}
     ]},

    // ---------- Week 3: origin and history ----------
    {id:"m1m", week:3, title:"Ancient evidence and a legend", outcomes:["m1o5"], video:"",
     summary:["Egyptian boxing-like fighting c.3000 BC; Mesopotamia and Sumer; Greek pancratium.","Bodhidharma at the Shaolin temple c.520 AD is a legend with little evidence."],
     steps:[
      G("Which civilisation shows evidence of boxing-like fighting around 3,000 BC?", ["Rome","Egypt","China","Korea"], 1, "Egypt: tomb paintings and inscriptions.", "p.18"),
      R("The oldest evidence", "p.18", ["Egyptian tomb paintings show boxing-like fighting by about 3,000 BC; there are reports from Mesopotamia and Sumer too.","Greece had boxing and wrestling at the Olympiads. Pancratium used the whole body as a weapon."],
        {diagram:"origins"}),
      C(["or09","or08","or02","or03"]),
      R("The Bodhidharma story", "p.18–19", ["Legend credits the monk Bodhidharma (Daruma) with bringing exercises to the Shaolin temple around 520 AD, later combined with the 18 Lo-han movements.","The book notes there is little evidence for this."],
        {picture:"Exhausted monks, and a stern teacher giving them exercises. Then a question mark over the whole scene."}),
      C(["or04","m1c29"])
     ]},

    {id:"m1n", week:3, title:"Korea's own martial tradition", outcomes:["m1o5"], video:"",
     summary:["Three kingdoms: Silla, Koguryo, Baek Je. Silla's Hwa Rangdo followed Won Kang's five-point code.","Soo Bak-Gi in Koguryo; Taek Kyon contests in Koryo (25 postures).","Banned under Japanese occupation; kept alive by Song Duk Ki and others. No single country invented open hand fighting."],
     steps:[
      G("Which Korean kingdom formed the Hwa Rangdo?", ["Koguryo","Baek Je","Silla","Koryo"], 2, "Silla, the smallest kingdom, under King Chin Heung.", "p.19"),
      R("Silla and the Hwa Rangdo", "p.19", ["Korea was split into Silla, Koguryo and Baek Je. Small Silla's young aristocrats formed the Hwa Rangdo.","They trained in weapons and hand and foot fighting, and followed Won Kang's five-point code."],
        {picture:"Young warriors climbing mountains and swimming icy rivers in winter to harden themselves."}),
      C(["m1c32","or05","or06","or07"]),
      D("hwarang"),
      R("Soo Bak-Gi and Taek Kyon", "p.20–21", ["Soo Bak-Gi was popular in Koguryo, with festival contests. Koryo kings held annual Taek Kyon contests (25 postures).","Under Japanese occupation all martial arts were banned. Song Duk Ki, Han Il Dong and a few others kept Taek Kyon alive."]),
      C(["or01","m1c31","m1c33","m1c34","m1c30"]),
      {type:"say", kind:"Scenario", secs:90, ref:"p.20–24",
       prompt:"A student insists Taekwon-Do is 'just Korean karate'. Answer accurately and respectfully.",
       model:"The founder studied Karate and Taek Kyon and used them as references, but Taekwon-Do's theories and principles are different and were scientifically developed. It has Korean roots in Soo Bak-Gi and Taek Kyon. And open hand fighting grew up in many countries, so arguments about ownership miss the point.",
       rubric:[{point:"Karate and Taek Kyon acknowledged as references", ref:"p.24"},{point:"Principles stated as different", ref:"p.24"},{point:"Korean roots mentioned", ref:"p.20–21"},{point:"Respectful to other arts", ref:""}]}
     ]},

    {id:"m1o", week:3, title:"The young Choi Hong Hi", outcomes:["m1o6"], video:"",
     summary:["Born 9 November 1918; frail; learned Taek Kyon from about 15 (calligraphy teacher).","Karate black belt in Japan; jailed after the Pyongyang Student Soldier's Incident.","Liberation 1945; from January 1946 a second lieutenant teaching his soldiers."],
     steps:[
      G("Who encouraged the young Choi to take up Taek Kyon?", ["His father","His calligraphy teacher","An army officer","A monk"], 1, "His calligraphy teacher, because he was frail.", "p.23"),
      R("A frail boy", "p.747, p.23", ["Choi Hong Hi was born on 9 November 1918 and was sickly as a child.","His calligraphy teacher encouraged him to learn Taek Kyon at about fifteen."],
        {picture:"A thin boy at a calligraphy desk, brush in hand, being told to go and train."}),
      C(["hs01","hs02","m1c36","hs03"]),
      R("Japan, prison, liberation", "p.23, p.748", ["In Japan he earned a black belt in Karate. Back home he started the Pyongyang Student Soldier's Incident and was jailed.","Liberation in 1945 freed him. In January 1946 he became a second lieutenant and began teaching his soldiers."]),
      C(["hs04","hs07","hs06","m1c35"])
     ]},

    {id:"m1p", week:3, title:"Building and naming the art", outcomes:["m1o6"], video:"",
     summary:["New techniques developed systematically from 1946; named Taekwon-Do on 11 April 1955.","Spirit: Oriental ethics plus the founder's philosophy. Technique: Newtonian physics.","Style named Chang Hun, the founder's pen name."],
     steps:[
      G("On what date was the name Taekwon-Do given?", ["15 January 1946","11 April 1955","22 March 1966","9 November 1918"], 1, "11 April 1955.", "p.24"),
      R("A new Korean art", "p.24", ["From 1946 he developed new techniques systematically. By the end of 1954 the foundation was nearly complete.","On 11 April 1955 it was named Taekwon-Do."],
        {diagram:"timeline"}),
      C(["hs05","m1c41"]),
      R("Science and spirit", "p.24", ["Spiritually it draws on Oriental ethics and the founder's philosophy; technically, on Newtonian physics.","Karate and Taek Kyon were references, but the principles are different. His study had two parts: spiritual discipline and technical perfection."],
        {picture:"An apple falling past a dojang window: Newton is in every technique."}),
      C(["m1c37","m1c38"])
     ]},

    {id:"m1q", week:3, title:"Going international", outcomes:["m1o6"], video:"",
     summary:["March 1959: demonstration tour to South Vietnam and Taiwan; three ideals set out.","ITF formed 22 March 1966; AETF formed in Oslo, June 1979."],
     steps:[
      G("When was the ITF formed?", ["11 April 1955","March 1959","22 March 1966","June 1979"], 2, "22 March 1966.", "p.752"),
      R("The 1959 tour", "p.24", ["In March 1959 he led a military demonstration team to South Vietnam and Taiwan, the first such tour in Korea's history.","There he set out three ideals: justice, brotherhood without boundaries, and a peaceful society."],
        {picture:"A team in white doboks stepping off a plane in Saigon."}),
      C(["hs08","hs09"]),
      D("ideals"),
      R("Federations", "p.752, p.755", ["The International Taekwon-Do Federation was formed on 22 March 1966, with nine founding countries.","The All Europe Taekwon-Do Federation followed in Oslo in June 1979."]),
      C(["hs10","hs11","hs12"])
     ]},

    {id:"m1r", week:3, title:"The twelve technical principles", outcomes:["m1o6"], video:"",
     summary:["Twelve principles guide every technique: power, clarity, exact distance and angle, breathing, health, beauty, and more.","Together they make Taekwon-Do a martial art, an aesthetic art, a science and a sport."],
     steps:[
      G("How many technical principles did the founder set out?", ["Five","Nine","Twelve","Twenty-four"], 2, "Twelve.", "p.25"),
      R("Principles 1 to 6", "p.25", ["Maximum power by scientific formula. Clear enough for a novice to tell right from wrong. Exact distance and angle. Clear, simple purpose and method. Rational teaching methods for everyone. Correct breathing."]),
      R("Principles 7 to 12", "p.25", ["Attack any vital spot and defend any attack. Each tool based on the body's structure. Easy to execute, so enjoyable. Promote health and prevent injury. Harmonious and rhythmical. Each pattern movement expresses its namesake."],
        {picture:"An engineer, a teacher, a doctor and a dancer agreeing on one technique."}),
      C(["m1c39","m1c40"]),
      D("principles"),
      {type:"say", kind:"Explain it", secs:120, ref:"p.23–25, p.747–752",
       prompt:"Give a brief history of Taekwon-Do from the founder's birth to the ITF, with key dates.",
       model:"General Choi Hong Hi, born 9 November 1918, learned Taek Kyon and then Karate in Japan. He was jailed after the Pyongyang Student Soldier's Incident and freed at liberation in 1945. From January 1946 he taught soldiers and developed new techniques based on Newtonian physics and Oriental ethics. The art was named Taekwon-Do on 11 April 1955. After the 1959 tour he set out three ideals, and the ITF was formed on 22 March 1966.",
       rubric:[{point:"Founder and birth date", ref:"p.747"},{point:"Taek Kyon and Karate", ref:"p.23"},{point:"Imprisonment and 1945 liberation", ref:"p.23"},{point:"January 1946 teaching", ref:"p.21, p.23"},{point:"11 April 1955", ref:"p.24"},{point:"22 March 1966 ITF", ref:"p.752"}]},
      {type:"say", kind:"Teach-back", secs:90, ref:"p.25",
       prompt:"Explain to colour belts, in 90 seconds, why techniques have exact distances, angles and breathing.",
       model:"The founder's technical principles: techniques are designed scientifically for maximum power, distances and angles are exactly defined for efficient attack and defence, and breathing adds speed and reduces fatigue. Then demonstrate one technique done precisely and one sloppily, and ask which is which.",
       rubric:[{point:"Linked to the technical principles", ref:"p.25"},{point:"Covered distance, angle and breathing", ref:"p.25"},{point:"Used a demonstration or question", ref:""}]}
     ]}
  ];

  // Number lessons within each week (shown as 1.1 ... 3.6).
  var perWeek = {};
  m.lessons.forEach(function(l){ perWeek[l.week] = (perWeek[l.week]||0) + 1; l.n = l.week + "." + perWeek[l.week]; l.mins = 12; });
})(COURSE.content.m1);
