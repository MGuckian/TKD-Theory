// Course structure. Module content files (course/module-N.js) fill COURSE.content[id].
// Page references ("p.15") are printed pages of the Taekwon-Do Condensed Encyclopaedia (1999 ed.).
// "Club" refers to the club colour belt syllabus.
var COURSE = {
  version: 1,
  storageKey: "sohnjip-course-v1",
  // Six 12-minute micro-lessons per week. Module completion rule. Mastery: a card counts fully once answered correctly on two
  // separate days (Leitner box 2+), half after one correct answer (box 1).
  gate: { mastery: 85, checkpoint: 85 },
  modules: [
    {id:"m1", n:1, title:"Foundations", blurb:"Definition, tenets, moral culture, philosophy, history and origin", weeks:3, lessons:18},
    {id:"m2", n:2, title:"Theory of power", blurb:"Six factors, sine wave, formulas, reflex research", weeks:3, lessons:18},
    {id:"m3", n:3, title:"Body and tools", blurb:"Attacking and blocking tools, stances, vital spots", weeks:4, lessons:24},
    {id:"m4", n:4, title:"Techniques and terminology", blurb:"Hand and foot techniques, Korean terminology", weeks:4, lessons:24},
    {id:"m5", n:5, title:"Patterns", blurb:"History, meaning and structure of the 24 patterns", weeks:4, lessons:24},
    {id:"m6", n:6, title:"Sparring and self-defence", blurb:"Principles of sparring and self-defence", weeks:3, lessons:18},
    {id:"m7", n:7, title:"Organisation and rules", blurb:"Rank, testing, competition, ITF/ITA, umpiring", weeks:3, lessons:18},
    {id:"m8", n:8, title:"Instructor practice", blurb:"Class etiquette, teaching method, error correction, ethics", weeks:3, lessons:18}
  ],
  capstone: {title:"Capstone: revision and viva rehearsal", weeks:3},
  content: {}
};
