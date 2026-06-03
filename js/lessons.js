/*
 * LESSON BUILDER
 * ==============
 * Turns the WEEKS config (weeks.js) into concrete daily lessons.
 *
 * A week produces DAYS_PER_WEEK days. Each day has four sections:
 *   1. "This week's sound"  - the focus digraph + examples, plus one recap
 *                             digraph from the last 3 weeks.
 *   2. "Sight words"        - one new sight word introduced (days 1-3),
 *                             the week's known sight words, plus 2 from the past.
 *   3. "Read the words"     - 12 words: 8 this-week digraph, 2 last week,
 *                             1 two weeks ago, 1 three weeks ago. Across the
 *                             week every word appears (about) twice.
 *   4. "Read the sentences" - 6 of the week's 18 sentences (each ~twice/week).
 *
 * Everything is seeded so a given (week, day) is always identical.
 */

// ---- deterministic RNG (mulberry32) ----
function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function weekByNumber(n) {
  return WEEKS.find(w => w.n === n) || null;
}

// Pick `size` distinct items from a bank (deterministically). Returns the whole
// bank if it has `size` or fewer items.
function pickSubset(bank, size, rng) {
  const uniq = bank.filter((w, i) => bank.indexOf(w) === i);
  if (uniq.length <= size) return uniq;
  return seededShuffle(uniq, rng).slice(0, size);
}

// Earlier weeks (1..3 back) that actually have a word bank, nearest first.
function priorWeeksWithWords(n) {
  const out = [];
  for (let back = 1; back <= 3; back++) {
    const w = weekByNumber(n - back);
    if (w && w.words && w.words.length) out.push(w);
  }
  return out;
}

// Deal `bank` across `days` days, `perDay` each, so every item is used as
// evenly as possible and the same item never lands in one day twice (provided
// each item's repeat count <= days, which holds for any bank of size >= perDay).
// Returns days x perDay array.
//
// Method: give each distinct item an (almost) equal share of the perDay*days
// slots, lay the copies out contiguously, then deal round-robin into days.
// Contiguous copies + round-robin => consecutive copies land in different days.
function dealAcrossDays(bank, perDay, days, rng) {
  const uniq = bank.filter((w, i) => bank.indexOf(w) === i);
  if (!uniq.length || perDay <= 0) return Array.from({ length: days }, () => []);

  const total = perDay * days;
  const order = seededShuffle(uniq, rng);
  const counts = order.map(() => Math.floor(total / order.length));
  let rem = total - counts.reduce((a, b) => a + b, 0);
  for (let i = 0; i < rem; i++) counts[i]++;

  const grouped = [];
  order.forEach((item, idx) => { for (let c = 0; c < counts[idx]; c++) grouped.push(item); });

  const offset = Math.floor(rng() * days);
  const result = Array.from({ length: days }, () => []);
  grouped.forEach((item, i) => { result[(i + offset) % days].push(item); });
  return result;
}

// Pick the recap digraph week for a given day (rotates through last 3 weeks).
function recapDigraphFor(week, dayIndex) {
  if (week.recapDigraphWeek) return weekByNumber(week.recapDigraphWeek);
  const priors = [];
  for (let back = 1; back <= 3; back++) {
    const w = weekByNumber(week.n - back);
    if (w) priors.push(w);
  }
  if (!priors.length) return null;
  return priors[dayIndex % priors.length];
}

// Sight words seen in all weeks before `n` (plus the base known words).
function pastSightPool(n) {
  const pool = BASE_SIGHT_WORDS.slice();
  for (const w of WEEKS) {
    if (w.n < n && w.sightWords) pool.push(...w.sightWords);
  }
  // de-dupe, preserve order
  return pool.filter((w, idx) => pool.indexOf(w) === idx);
}

// ---- build a whole week's worth of days ----
function buildWeek(n) {
  const week = weekByNumber(n);
  if (!week) return null;

  const priors = priorWeeksWithWords(n);
  const days = DAYS_PER_WEEK;

  // Word composition: 8 this-week / 2 last / 1 two-ago / 1 three-ago.
  // Missing prior weeks fold their share back into this week.
  let cur = 8;
  const perPrior = [2, 1, 1];
  const priorPlans = [];
  for (let p = 0; p < 3; p++) {
    if (priors[p]) priorPlans.push({ week: priors[p], perDay: perPrior[p] });
    else cur += perPrior[p];
  }

  // Aim for each word to appear ~twice over the week: use a subset of each
  // bank sized at half the week's slots for that bank. If a bank is smaller
  // than that, all its words are used and some land 3 times.
  const curBank = pickSubset(week.words || [], Math.round(cur * days / 2), makeRng(n * 7919 + 17));
  const curDeal = curBank.length
    ? dealAcrossDays(curBank, cur, days, makeRng(n * 7919 + 41))
    : Array.from({ length: days }, () => []);
  const priorDeals = priorPlans.map(pp => {
    const bank = pickSubset(pp.week.words, Math.round(pp.perDay * days / 2), makeRng(n * 53 + pp.week.n));
    return dealAcrossDays(bank, pp.perDay, days, makeRng(n * 31 + pp.week.n));
  });

  // Sentences: deal the 18 across the week so each appears ~twice.
  const sentenceDeal = week.sentences && week.sentences.length
    ? dealAcrossDays(week.sentences, 6, days, makeRng(n * 104729 + 3))
    : Array.from({ length: days }, () => []);

  const pastSights = pastSightPool(n);

  const result = [];
  for (let d = 0; d < days; d++) {
    const dayRng = makeRng(n * 1000 + d);

    // --- Section 1: sound recap ---
    const soundCards = [
      { text: week.digraph, type: "digraph", note: week.status === "review" ? "this week (review)" : "this week" }
    ];
    week.examples.forEach(ex => soundCards.push({ text: ex, type: "word" }));
    const recapWeek = recapDigraphFor(week, d);
    if (recapWeek) {
      soundCards.push({ text: recapWeek.digraph, type: "digraph", note: "remember this one?" });
      if (recapWeek.examples && recapWeek.examples[0]) {
        soundCards.push({ text: recapWeek.examples[0], type: "word" });
      }
    }

    // --- Section 2: sight words ---
    const introducedCount = Math.min(week.sightWords.length, d + 1);
    const weekSights = week.sightWords.slice(0, introducedCount);
    const todaysNew = d < week.sightWords.length ? week.sightWords[d] : null;
    // 2 past sight words, rotating by day
    const past2 = [];
    if (pastSights.length) {
      for (let k = 0; k < 2; k++) {
        past2.push(pastSights[(d * 2 + k) % pastSights.length]);
      }
    }
    const sightCards = [];
    const sightSeen = new Set();
    const pushSight = (word, isNew) => {
      if (!word || sightSeen.has(word)) return;
      sightSeen.add(word);
      sightCards.push({ text: word, type: "sight", note: isNew ? "new!" : "" });
    };
    pushSight(todaysNew, true);
    weekSights.forEach(w => pushSight(w, false));
    past2.forEach(w => pushSight(w, false));

    // --- Section 3: words ---
    let dayWords = curDeal[d].slice();
    priorDeals.forEach(pd => { dayWords = dayWords.concat(pd[d]); });
    dayWords = seededShuffle(dayWords, dayRng).map(t => ({ text: t, type: "word" }));

    // --- Section 4: sentences ---
    const daySentences = sentenceDeal[d].map(t => ({ text: t, type: "sentence" }));

    const sections = [
      { label: "This week's sound", cards: soundCards },
      { label: "Sight words", cards: sightCards }
    ];
    if (dayWords.length) sections.push({ label: "Read the words", cards: dayWords });
    if (daySentences.length) sections.push({ label: "Read the sentences", cards: daySentences });

    result.push({ day: d + 1, sections });
  }

  return { week, days: result };
}
