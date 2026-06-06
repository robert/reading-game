/*
 * WEEKLY READING CURRICULUM
 * =========================
 *
 * Each week focuses on ONE digraph and 3 new sight words.
 *
 * To set up a week in a Claude Code session, edit the entry below:
 *   - digraph     : the focus digraph for the week, e.g. "sh"
 *   - status      : "new" (first time) or "review" (extra practice).
 *                   This only changes the label shown in the app.
 *   - examples    : 1-2 example words shown in the "sound" recap section.
 *   - sightWords  : the 3 NEW sight words for the week (introduced one per
 *                   day across days 1-3, then recapped).
 *   - words       : the bank of words that use THIS week's digraph.
 *                   Aim for ~24+ so daily lessons stay varied. The app
 *                   automatically pulls recap words from previous weeks
 *                   (2 from last week, 1 from 2 weeks ago, 1 from 3 weeks
 *                   ago) so you only ever list this week's own words here.
 *   - sentences   : 18 sentences. Use ONLY digraphs the child already knows
 *                   (this week's + every earlier week's), plus plain CVC
 *                   words and known sight words. Lean on this week's words
 *                   and the new sight words.
 *
 * Optional overrides:
 *   - recapDigraphWeek : force which earlier week's digraph is recapped
 *                        (a week number). Default: auto-rotates through the
 *                        last 3 weeks.
 *   - draft : true marks a week as not-yet-authored (no word/sentence banks
 *             yet). It still appears on the index but is labelled.
 *
 * Sight words the child ALREADY knows before week 1:
 */
const BASE_SIGHT_WORDS = ["the", "to", "I", "a", "is", "and"];

const WEEKS = [
  // ===================== WEEK 1 =====================
  {
    n: 1,
    digraph: "sh",
    status: "new",
    examples: ["ship", "fish"],
    sightWords: ["he", "she", "we"],
    words: [
      "ship", "shop", "shed", "shin", "shell", "shut", "shock", "shun",
      "fish", "dish", "wish", "cash", "dash", "rush", "gush", "hush",
      "mash", "bash", "gash", "posh", "gosh", "mesh", "fresh", "brush",
      "crash", "flash", "smash", "blush"
    ],
    sentences: [
      "I wish I had a big fish.",
      "She put the fish in a dish.",
      "He had to rush to the shop.",
      "We shut the shed.",
      "The ship is big and red.",
      "She got cash at the shop.",
      "He had a shell and a fish.",
      "We dash to the shop.",
      "I wish we had a ship.",
      "She had to shut the shed.",
      "He put the cash in the shed.",
      "We had fish in a dish.",
      "The fish is in the shed.",
      "She had a posh hat.",
      "He had to rush to get a fish.",
      "We wish we had a big shop.",
      "I had a fish and a shell.",
      "She put the shell in the shop."
    ]
  },

  // ===================== WEEK 2 =====================
  {
    n: 2,
    digraph: "ch",
    status: "new",
    examples: ["chip", "lunch"],
    sightWords: ["me", "be", "was"],
    words: [
      "chip", "chop", "chin", "chat", "chum", "chug", "chap", "chill",
      "chomp", "chimp", "chess", "chest", "chick", "check", "much", "such",
      "rich", "lunch", "bunch", "munch", "punch", "bench", "inch", "pinch",
      "ranch", "champ", "chant", "chap"
    ],
    sentences: [
      "I had chips for lunch.",
      "The chick is on the chest.",
      "He had a chat with me.",
      "She had much fun.",
      "We had a rich lunch.",
      "I sat on the bench.",
      "The chimp had a chip.",
      "He had to chop the log.",
      "She had a chip and a fish.",
      "We had lunch at the shop.",
      "The chick is in the shed.",
      "It will be fun to chat.",
      "He had a chest of cash.",
      "She had a chat at lunch.",
      "We had chips and fish.",
      "The chimp sat on the bench.",
      "I had a bunch of chips.",
      "He was rich and had a shop."
    ]
  },

  // ===================== WEEK 3 =====================
  {
    n: 3,
    digraph: "th",
    status: "new",
    examples: ["this", "moth"],
    sightWords: ["my", "you", "they"],
    words: [
      "this", "that", "then", "them", "with", "thin", "thick", "thud",
      "moth", "bath", "path", "math", "cloth", "than", "thump", "thank",
      "thing", "think", "froth", "both", "thug", "thatch", "thrill", "throb",
      "depth", "tenth", "moth", "with"
    ],
    sentences: [
      "This is my hat.",
      "That is a big moth.",
      "I had a bath with them.",
      "The moth is thin.",
      "We ran on the path.",
      "They had a chat.",
      "I think you had my fish.",
      "She had a thick cloth.",
      "We had a bath then lunch.",
      "This fish is for you.",
      "They had a moth in the shed.",
      "I think this is my chip.",
      "He had a thud on the path.",
      "Both of them had lunch.",
      "That moth is thin.",
      "They ran on the path with me.",
      "I think they had a bath.",
      "This is my thick cloth."
    ]
  },

  // ============ PROPOSED ROADMAP (weeks 4+) ============
  // Digraph order roughly follows UK Letters & Sounds Phase 3 -> 5:
  // consonant digraphs first, then vowel digraphs/trigraphs.
  // Sight words build on common high-frequency / tricky words.
  // These are DRAFTS: word banks and sentences are filled in after you
  // approve the order. Edit / reorder freely.
  { n: 4,  digraph: "ng", status: "new", examples: ["ring", "song"],  sightWords: ["her", "all", "are"],        words: [], sentences: [], draft: true },
  { n: 5,  digraph: "ck", status: "new", examples: ["duck", "sock"],  sightWords: ["said", "so", "have"],       words: [], sentences: [], draft: true },
  { n: 6,  digraph: "ai", status: "new", examples: ["rain", "tail"],  sightWords: ["like", "some", "come"],     words: [], sentences: [], draft: true },
  { n: 7,  digraph: "ee", status: "new", examples: ["feet", "tree"],  sightWords: ["were", "there", "little"],  words: [], sentences: [], draft: true },
  { n: 8,  digraph: "igh",status: "new", examples: ["light", "high"], sightWords: ["one", "do", "when"],        words: [], sentences: [], draft: true },
  { n: 9,  digraph: "oa", status: "new", examples: ["boat", "coat"],  sightWords: ["out", "what", "oh"],        words: [], sentences: [], draft: true },
  { n: 10, digraph: "oo", status: "new", examples: ["moon", "book"],  sightWords: ["their", "people", "Mr"],    words: [], sentences: [], draft: true },
  { n: 11, digraph: "ar", status: "new", examples: ["car", "star"],   sightWords: ["Mrs", "looked", "called"],  words: [], sentences: [], draft: true },
  { n: 12, digraph: "or", status: "new", examples: ["fork", "corn"],  sightWords: ["asked", "could", "would"],  words: [], sentences: [], draft: true },
  { n: 13, digraph: "ur", status: "new", examples: ["turn", "burn"],  sightWords: ["should", "your", "water"],  words: [], sentences: [], draft: true },
  { n: 14, digraph: "ow", status: "new", examples: ["cow", "owl"],    sightWords: ["where", "who", "again"],     words: [], sentences: [], draft: true },
  { n: 15, digraph: "oi", status: "new", examples: ["coin", "boil"],  sightWords: ["thought", "through", "work"],words: [], sentences: [], draft: true },
  { n: 16, digraph: "ear",status: "new", examples: ["ear", "hear"],   sightWords: ["many", "laughed", "any"],    words: [], sentences: [], draft: true },
  { n: 17, digraph: "air",status: "new", examples: ["hair", "chair"], sightWords: ["because", "different", "eyes"],words: [], sentences: [], draft: true },
  { n: 18, digraph: "er", status: "new", examples: ["fern", "her"],   sightWords: ["friends", "once", "please"], words: [], sentences: [], draft: true }
];

// Number of practice days per week.
const DAYS_PER_WEEK = 6;
