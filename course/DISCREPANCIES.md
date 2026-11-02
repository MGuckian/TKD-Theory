# Discrepancy log

Short notes only. "Enc" = Condensed Encyclopaedia (1999), printed pages. "Club" = club colour belt syllabus. "BB" = ITA Black Belt Testing (Aug 2026).

## Source handling
- Page offset: printed page = PDF page index **minus 2** (the brief said minus 1). Checked against page footers across the book, e.g. PDF 14 = p.12, PDF 727 = p.725.
- BB gives no theory syllabus. It says theory is drawn from the Training Manual and the 1999 encyclopaedia "appropriate to grade", and that 4th Dan and above must be exemplary because they become ITA examiners. The course does not claim any official 4th Dan theory list. Waiting on the ITA.

## Module 1
| Topic | Note | Course uses |
|---|---|---|
| Elements of courtesy | Enc p.12 lists 9; Club (Blue Belt page) lists 5 of them. | Enc's 9 |
| Integrity examples | Enc p.13 lists 8; Club lists 2. | Enc's 8 |
| Meaning of Tae/Kwon/Do | Club: foot/hand/art. Enc p.15: Tae = jump/fly/kick with foot, Kwon = fist/punch, Do = art or way. Enc p.21 (origin chapter) also gives foot/fist/art. | Enc p.15 |
| Indomitable spirit spelling | Enc p.12 "Baekjul Boolgool" (OCR garbled); app uses "Baekjul Boolgul"; Club "Baekjool Bolgool". | App spelling, unchanged |
| Five virtues | Enc p.27 list says "courtesy" as the third virtue, but its heading (p.29) is Propriety (Ye). | Propriety |
| Self-criticism | Enc p.30 says three questions daily, then lists seven. | Not tested |
| Order of composition | Enc p.725 gives three orders: opening sentence (FM, patterns, dallyon, sparring, SD); numbered military list (FM, dallyon, patterns, sparring, SD); illustration (FM, pattern, sparring, dallyon, SD). | Illustration order in the cycle diagram; please check |
| Year Choi went to Japan | Enc p.23 says 1938; About the Author p.747 says 1937. | Year not stated |
| Start of teaching | Enc p.21: began teaching soldiers 15 Jan 1946. Enc p.23: commissioned Jan 1946, then developed techniques from March 1946. | "January 1946" |
| Japanese occupation | Enc p.21 gives 1909–1945; p.23 says "thirty-six years". Consistent with each other. Common histories give 1910. | Enc dates |
| Plato's dates | Enc p.18 prints them reversed (347–427 BC). | Not used |
| "Do" from "Dao"; four facets of TKD | Club (1st Kup) only. Not found in Enc. | Kept, ref marked "Club" |
| Club history answer (Blue Belt pages) | Credited to the Enc, but includes post-1999 events (WTF, Choi's death in 2002) and wording not in Enc pp.23–25. | Enc only |
| Korean hooks | The Hanja roots in course hooks (e.g. Guk Gi 克己 = overcome self) are standard Sino-Korean but **are not printed in any source**. Please check. | Course only |
| Existing app hooks | Several flashcard hooks use English sound-alikes (t02 "genuine", t04 "true chi", t07 "bull", cm01). The course replaces them with root-based hooks; the flashcard app is unchanged. | — |

## Design choices to review (not source issues)
- Rhythm: six 12-minute micro-lessons a week plus a few minutes of daily review (replaces two 45-minute lessons; same weekly time). Lessons are in `course/module-1-lessons.js`.
- Module gate: 85% mastery, all "Explain it" tasks, and a checkpoint of 85% or more. A card counts fully once answered correctly on 2 separate days (half after 1). Thresholds are in `course/course.js`.
- Missed questions repeat at the end of the same set, then return the next day.
- Spaced rechecks at 7 and 28 days after a module's last lesson.
- Recordings of spoken answers stay in the browser for that session only; nothing is uploaded or saved.
