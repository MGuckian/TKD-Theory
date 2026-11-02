// Module 1: Foundations (outcomes, cards, viva). All wording is original; refs are printed encyclopaedia pages
// unless marked "Club" (club colour belt syllabus).
COURSE.content.m1 = {
  outcomes: [
    {id:"m1o1", text:"Define Taekwon-Do, explain its name and its five-part composition",
      cards:["d01","d02","d03","d04","d05","d06","d07","c01","c02","c03","c04","c05","c06","c07","c08","cm01","ph12","ph13","m1c01","m1c02","m1c03","m1c04","m1c06"]},
    {id:"m1o2", text:"State the five tenets with Korean terms and explain each with the book's examples",
      cards:["t01","t02","t03","t04","t05","t06","t07","t08","t09","t10","t11","t12","t13","m1c07","m1c08","m1c10","m1c11","m1c12"]},
    {id:"m1o3", text:"Explain moral culture: the five virtues and the path of self-cultivation",
      cards:["mc01","mc02","mc03","mc04","mc05","mc06","mc07","mc08","mc09","ph14","m1c13","m1c14","m1c15","m1c16","m1c17","m1c18","m1c19","m1c20","m1c21"]},
    {id:"m1o4", text:"Explain the philosophy of Taekwon-Do: its purpose, limits and nine guidelines",
      cards:["ph01","ph02","ph03","ph04","ph05","m1c22","m1c23","m1c24","m1c25","m1c26","m1c27","m1c28"]},
    {id:"m1o5", text:"Outline the origin of open hand fighting worldwide and in Korea",
      cards:["or01","or02","or03","or04","or05","or06","or07","or08","or09","m1c29","m1c30","m1c31","m1c32","m1c33","m1c34"]},
    {id:"m1o6", text:"Outline the history of Taekwon-Do, its founder and its founding principles",
      cards:["hs01","hs02","hs03","hs04","hs05","hs06","hs07","hs08","hs09","hs10","hs11","hs12","m1c35","m1c36","m1c37","m1c38","m1c39","m1c40","m1c41"]}
  ],

  // Source references for existing flashcards used in this module.
  refs: {
    t01:"p.12",t02:"p.12",t03:"p.12",t04:"p.12",t05:"p.12",t06:"p.12",t07:"p.12",t08:"p.12",t09:"p.13",t10:"p.14",t11:"p.14",t12:"p.14",t13:"p.13",
    d01:"p.15",d02:"p.15",d03:"p.15",d04:"p.15",d05:"p.15",d06:"p.15",d07:"p.15",
    c01:"p.725",c02:"p.725",c03:"p.725",c04:"p.725",c05:"p.725",c06:"p.725",c07:"p.725",c08:"p.725",cm01:"p.725",
    ph12:"Club (1st Kup), not found in encyclopaedia",ph13:"Club (1st Kup), not found in encyclopaedia",
    mc01:"p.26",mc02:"p.27",mc03:"p.27",mc04:"p.28",mc05:"p.29",mc06:"p.29",mc07:"p.29",mc08:"p.27",mc09:"p.27",ph14:"p.27; Club (1st Kup)",
    ph01:"p.47",ph02:"p.48",ph03:"p.48",ph04:"p.48",ph05:"p.48",
    or01:"p.20",or02:"p.18",or03:"p.18",or04:"p.18",or05:"p.19",or06:"p.19",or07:"p.19",or08:"p.18",or09:"p.18",
    hs01:"p.23",hs02:"p.747",hs03:"p.23",hs04:"p.23",hs05:"p.24",hs06:"p.23",hs07:"p.23",hs08:"p.24",hs09:"p.24",hs10:"p.752",hs11:"p.752",hs12:"p.755"
  },

  // Korean hooks built from the Sino-Korean (Hanja) roots of each term. The Hanja are not
  // printed in the sources: flagged in DISCREPANCIES.md for checking. Shown in the course only.
  hookOverrides: {
    t02:"Jungshin (精神): jung = essence, shin = spirit. The tenets are the essential spirit of the art.",
    t03:"Ye Ui (禮儀): ye = propriety or proper conduct (the same Ye as the virtue of Propriety), ui = form or manners.",
    t04:"Yom Chi (廉恥): yom = upright and incorruptible, chi = shame. Integrity is having the conscience to feel shame when wrong.",
    t05:"In Nae (忍耐): both syllables mean to endure or bear. Perseverance is enduring, then enduring again.",
    t06:"Guk Gi (克己): guk = overcome, gi = oneself. Self-control is literally overcoming oneself, which is exactly Lao-Tzu's point.",
    t07:"Baekjul Boolgul (百折不屈): baek = a hundred, jul = to be broken or bent, bool = not, gul = to yield. Bent a hundred times, never yielding.",
    mc01:"Jungshin Sooyang (精神修養): jungshin = spirit or mind, sooyang = cultivation. Moral culture is cultivating the mind.",
    mc03:"In (仁): the classical virtue of benevolence or humaneness.",
    mc04:"Ui (義): rightness or justice. Not the same syllable as the 'ui' in Ye Ui.",
    mc05:"Ye (禮): propriety or proper conduct. The same Ye that opens Ye Ui, courtesy.",
    mc06:"Ji (智): wisdom or knowing.",
    mc07:"Shin (信): trust or faithfulness, keeping your word.",
    cm01:"Soonhwan (循環): circulation or cycle. Soonhwan Do is the diagram of the cycle.",
    c02:"Goosung (構成): composition or structure, how the parts are built together."
  },

  // Course-only cards (not added to the flashcard deck). Same fields and answer checking.
  cards: [
    {id:"m1c01",topic:"definition",ref:"p.15",q:"The definition chapter opens by describing Taekwon-Do as a way of ___?",a:"A way of life.",short:"Life",accept:["life"]},
    {id:"m1c02",topic:"definition",ref:"p.15",q:"What does the encyclopaedia say separates the true practitioner from the sensationalist?",a:"Mental conditioning: the discipline and mental training, not just mastering the fighting side.",short:"Mental conditioning",accept:["mental"]},
    {id:"m1c03",topic:"definition",ref:"p.16",q:"Taekwon-Do is specially designed for swift retaliation against what?",a:"A moving aggressor.",short:"The moving aggressor",accept:["moving"]},
    {id:"m1c04",topic:"definition",ref:"p.16",q:"Through constant practice, what do an expert's actions become?",a:"Conditioned reflexes: they act without stopping to think.",short:"Conditioned reflexes",accept:["reflex"]},
    {id:"m1c06",topic:"composition",ref:"p.725",q:"Why can't one element of Taekwon-Do's composition be taught in isolation?",a:"The elements are so closely related that each is needed to develop the others; you keep returning to fundamentals even at the highest level.",short:"Each element depends on and perfects the others",mcOnly:true,distractors:["Each element is tested separately at grading","Sparring must always be learned before patterns","Self-defence replaces the need for fundamentals"]},

    {id:"m1c07",topic:"tenets",ref:"p.13",q:"Integrity means being able to define right and wrong, and when wrong, having the conscience to feel what?",a:"Guilt.",short:"Guilt",accept:["guilt"]},
    {id:"m1c08",topic:"tenets",ref:"p.14",q:"Which tenet does the book stress is vital both in free sparring and in personal affairs, and is also lacking when someone lives beyond their capability?",a:"Self-Control (Guk Gi).",short:"Self-Control",accept:["self control","guk gi"]},
    {id:"m1c10",topic:"tenets",ref:"p.12",q:"The ninth element of courtesy: refrain from giving or accepting any gift when ___?",a:"In doubt.",short:"In doubt",accept:["doubt"]},
    {id:"m1c11",topic:"tenets",ref:"p.13",q:"What does the book call one of the most important secrets of becoming a leader in Taekwon-Do?",a:"Overcoming every difficulty through perseverance.",short:"Overcoming every difficulty by perseverance",mcOnly:true,distractors:["Winning major championships","Learning every pattern before 1st Dan","Never losing self-control in sparring"]},
    {id:"m1c12",topic:"tenets",ref:"p.13",q:"Which integrity failure does the book give for a student at demonstrations?",a:"'Fixing' breaking materials beforehand.",short:"Fixing breaking materials before demonstrations",accept:["fixing","fix","rigging","rig"]},

    {id:"m1c13",topic:"philosophy",ref:"p.26",q:"Moral culture is described as the process of becoming an exemplary person such as whom?",a:"Confucius.",short:"Confucius",accept:["confucius"],kind:"name"},
    {id:"m1c14",topic:"philosophy",ref:"p.26",q:"Lao-Tzu's four kinds of society, from best to worst?",a:"Ideal (ruler governs naturally through moral character), moral (people praise a caring ruler), legalistic (people obey from fear of punishment), and worst: a ruler who uses deception and force.",short:"Ideal, moral, legalistic, then rule by deception and force",mcOnly:true,distractors:["Moral, ideal, legalistic, then rule by deception and force","Legalistic, moral, ideal, then rule by deception and force","Ideal, legalistic, moral, then rule by deception and force"]},
    {id:"m1c15",topic:"philosophy",ref:"p.32",q:"What is the term for the active reflection in silence used in Taekwon-Do meditation?",a:"Jung-Joong-Dong: reflecting on past mistakes in silence in order to keep improving, not withdrawing from the world.",short:"Jung-Joong-Dong",accept:["jung joong dong","jungjoongdong"],kind:"korean"},
    {id:"m1c16",topic:"philosophy",ref:"p.32",q:"'Ki' is the active energy that moves. What is 'Chi'?",a:"Will: the motivating force that leads.",short:"Will, the motivating force",accept:["will"]},
    {id:"m1c17",topic:"philosophy",ref:"p.30",q:"Mencius named three things of value in society. What are they?",a:"Position (in government), age (in a community) and moral integrity (for a leader or advisor).",short:"Position, age and moral integrity",keywordGroups:[["position"],["age"],["integrity","moral"]]},
    {id:"m1c18",topic:"philosophy",ref:"p.32",q:"What are Mencius' three happinesses?",a:"Healthy parents and a harmonious family; living with pride and honour through correct behaviour; educating the young to be upright and useful.",short:"Family harmony, living honourably, educating the young",mcOnly:true,distractors:["Wealth, long life, many children","Victory, rank, a famous name","Health, wealth, a quiet death"]},
    {id:"m1c19",topic:"philosophy",ref:"p.29",q:"What two ways does moral culture give for finding one's own human nature?",a:"Preserve the goodness given at birth, and renounce greed for material things.",short:"Preserve inborn goodness and renounce material greed",mcOnly:true,distractors:["Study the classics and obey the ruler","Meditate in isolation and fast","Train daily and compete often"]},
    {id:"m1c20",topic:"philosophy",ref:"p.28",q:"Which virtue is the ability to feel ashamed of unjust acts and to do one's duty to others?",a:"Righteousness (Ui).",short:"Righteousness",accept:["righteous","ui"]},
    {id:"m1c21",topic:"philosophy",ref:"p.29",q:"Wisdom is the ability to judge right from wrong, especially in whose matters?",a:"One's own, rather than other people's.",short:"One's own",accept:["oneself","own","self","myself","yourself","themselves"]},

    {id:"m1c22",topic:"philosophy",ref:"p.47",q:"Korean term for the Philosophy of Taekwon-Do?",a:"Taekwon-Do Chul Hak.",short:"Taekwon-Do Chul Hak",accept:["chul hak","chulhak"],kind:"korean",hook:"Chul Hak (哲學): chul = wise, hak = study. The study of wisdom."},
    {id:"m1c23",topic:"philosophy",ref:"p.47",q:"The philosophy chapter says society's remedy is to develop what, to keep pace with material and scientific progress?",a:"Moral civilisation.",short:"Moral civilisation",accept:["moral civil"]},
    {id:"m1c24",topic:"philosophy",ref:"p.47",q:"Besides selfish, aggressive or violent use, Taekwon-Do must never be used for which two purposes?",a:"Commercial or political purposes.",short:"Commercial or political",keywordGroups:[["commerc"],["politic"]]},
    {id:"m1c25",topic:"philosophy",ref:"p.48",q:"Guideline 9: be the eternal teacher who teaches how?",a:"With the body when young, with words when old, and by moral example even after death.",short:"Body when young, words when old, moral precept after death",mcOnly:true,distractors:["Words when young, body when old, books after death","By example when young, by rank when old, by legacy after death","Body when young, patterns when old, students after death"]},
    {id:"m1c26",topic:"philosophy",ref:"p.48",q:"Guideline 3: be content with what you have in money and position, but never in ___?",a:"Skills.",short:"Skills",accept:["skill"]},
    {id:"m1c27",topic:"philosophy",ref:"p.48",q:"Guideline 6: never yield to ___ or threat in pursuit of a noble cause?",a:"Repression.",short:"Repression",accept:["repress"]},
    {id:"m1c28",topic:"philosophy",ref:"p.9",q:"Korean term for the Charter of Taekwon-Do?",a:"Taekwon-Do Hun Jang.",short:"Taekwon-Do Hun Jang",accept:["hun jang","hunjang"],kind:"korean",hook:"Hun Jang (憲章): hun = constitution or law, jang = chapter or article. A founding charter."},

    {id:"m1c29",topic:"history",ref:"p.19",q:"What were the 18 movements imitating temple idols, said to have been added to the monks' training?",a:"Shih Pa Lo-han (18 movements of Lo-han hands).",short:"Shih Pa Lo-han",accept:["lo han","lohan","shih pa"],kind:"name"},
    {id:"m1c30",topic:"history",ref:"p.22",q:"What does the encyclopaedia conclude about where open hand and foot fighting began?",a:"It probably developed naturally in many places as people needed defence; no single country can claim it.",short:"It arose naturally in many places, not one country",mcOnly:true,distractors:["It began in China and spread outward","It began in India with Bodhidharma","It began in Egypt around 3,000 BC"]},
    {id:"m1c31",topic:"history",ref:"p.21",q:"How many fundamental postures did Soo Bak-Gi/Taek Kyon practitioners use in the Koryo Dynasty?",a:"Twenty-five.",short:"Twenty-five",kind:"number"},
    {id:"m1c32",topic:"history",ref:"p.19",q:"Which three kingdoms divided the Korean peninsula from the 1st century BC to the 7th century AD?",a:"Silla, Koguryo and Baek Je.",short:"Silla, Koguryo and Baek Je",keywordGroups:[["silla"],["koguryo","goguryeo"],["baek je","baekje"]]},
    {id:"m1c33",topic:"history",ref:"p.21",q:"Who kept Taek Kyon alive in secret during the Japanese occupation?",a:"Song Duk Ki, Han Il Dong and a few others.",short:"Song Duk Ki and Han Il Dong",mcOnly:true,distractors:["Won Kang and Chin Heung","Lee Yi Min and Jang Joong Boo","Shin Chae Ho and An Ja San"]},
    {id:"m1c34",topic:"history",ref:"p.20",q:"Oyama suggested 'Kara' in Karate may come from which country at the southern tip of Korea?",a:"Kaya.",short:"Kaya",accept:["kaya"],kind:"name"},

    {id:"m1c35",topic:"history",ref:"p.21, p.23",q:"In what month and year did Choi, as a new second lieutenant, begin teaching his soldiers?",a:"January 1946.",short:"January 1946",keywordGroups:[["january","jan"],["1946"]]},
    {id:"m1c36",topic:"history",ref:"p.23",q:"Who encouraged the young Choi to learn Taek Kyon?",a:"His calligraphy teacher.",short:"His calligraphy teacher",accept:["calligraph"]},
    {id:"m1c37",topic:"history",ref:"p.24",q:"The physical techniques of Taekwon-Do are based on which branch of science?",a:"Modern science, in particular Newtonian physics.",short:"Newtonian physics",accept:["newton"]},
    {id:"m1c38",topic:"history",ref:"p.24",q:"The founder's study of Taekwon-Do proceeded in which two parts?",a:"Spiritual discipline and technical perfection.",short:"Spiritual discipline and technical perfection",keywordGroups:[["spirit"],["technic","technique"]]},
    {id:"m1c39",topic:"history",ref:"p.25",q:"How many technical principles does the founder list for creating techniques?",a:"Twelve.",short:"Twelve",kind:"number"},
    {id:"m1c40",topic:"history",ref:"p.25",q:"Keeping to those technical principles makes Taekwon-Do which four things?",a:"A martial art, an aesthetic art, a science and a sport.",short:"A martial art, an aesthetic art, a science and a sport",mcOnly:true,distractors:["A sport, a religion, a science and a way of life","A martial art, a philosophy, a business and a sport","A martial art, a military system, a science and a culture"]},
    {id:"m1c41",topic:"history",ref:"p.22",q:"What is the founder's pen name, which gives its name to his style of Taekwon-Do?",a:"Chang Hun.",short:"Chang Hun",accept:["chang hun","changhun"],kind:"name"}
  ],

  // Lessons, lists and class tasks: see module-1-lessons.js

  // Extra viva prompts for this module (explain and scenario prompts are also used).
  viva: [
    {q:"Why is Taekwon-Do called an art of self-defence and not simply a fighting system?", ref:"p.15", points:["Mental training and moral discipline are part of the art","It implies a way of thinking and life, with self-imposed discipline","Mental training prevents misuse of a potentially lethal skill"]},
    {q:"Explain the difference between courtesy (Ye Ui) and the virtue of propriety (Ye).", ref:"p.12, p.29", points:["Courtesy is a tenet with nine listed elements for training conduct","Propriety is one of the five virtues: proper conduct between people of different status","Both share 'Ye'; courtesy applies propriety to daily training"]},
    {q:"What do the pattern names have to do with the philosophy of Taekwon-Do?", ref:"p.24–25, p.47", points:["Named after illustrious figures from Korean history","These people defended but never invaded, so the art is for self-defence and justice","Each pattern should express its namesake's personality and intentions"]},
    {q:"What three ideals did the founder set out during the 1959 tour?", ref:"p.24", points:["Upright mind and strong body, standing for justice","Brotherhood regardless of religion, race, nation or ideology","Building a peaceful society where justice, morality, trust and humanism prevail"]}
  ],

  checkpoint: {size:12}
};
