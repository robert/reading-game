/*
 * PLAYER
 * ======
 * Each day opens on a LESSON HUB: numbered tiles (the day's sections), each
 * with a cute mascot. Tiles unlock in order; the next one to do is bigger with
 * a play icon. Tapping it opens the reading activity, where cards are read with
 * the draggable arrow. The sound-review cards show the sound twice, each with
 * its own dragger bar.
 *
 * Finishing a section (the last card's button is a tick) earns a STAR, plays a
 * pastel + confetti + "Good job!" + jingle transition, and unlocks the next
 * tile. Finishing every section opens the present.
 */

document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const weekN = parseInt(params.get("week"), 10) || 1;
  const dayN = parseInt(params.get("day"), 10) || 1;

  const built = buildWeek(weekN);
  if (!built) { window.location.href = "index.html"; return; }
  const dayData = built.days[dayN - 1];
  if (!dayData) { window.location.href = "index.html"; return; }
  const sections = dayData.sections;

  // ---- per-section tile theming ----
  const THEMES = {
    "Sound Review":     { grad: ["#5ad1cb", "#36b3ac"], label: "#1f7d77" },
    "Sight Words":      { grad: ["#9a8cff", "#7a68f0"], label: "#5a44c9" },
    "Word Reading":     { grad: ["#ff8d6b", "#ff6f54"], label: "#d2532f" },
    "Sentence Reading": { grad: ["#ff8fb6", "#ff6d9c"], label: "#cf4f79" }
  };
  const FALLBACK = { grad: ["#7fb2ff", "#5a8df0"], label: "#3a6bcf" };
  const themeFor = s => THEMES[s.label] || FALLBACK;

  // Four distinct but matching cute mascots (white bodies, pink cheeks).
  function mascot(i) {
    const body = '<path d="M60 14 C88 14 106 34 106 62 C106 94 88 110 60 110 C32 110 14 94 14 62 C14 34 32 14 60 14 Z" fill="#fff"/>';
    const cheeks = '<ellipse cx="39" cy="78" rx="8" ry="5.5" fill="#ffb3c7"/><ellipse cx="81" cy="78" rx="8" ry="5.5" fill="#ffb3c7"/>';
    const eyes = '<circle cx="46" cy="58" r="9" fill="#2c3e50"/><circle cx="74" cy="58" r="9" fill="#2c3e50"/><circle cx="49" cy="55" r="2.7" fill="#fff"/><circle cx="77" cy="55" r="2.7" fill="#fff"/>';
    const smile = '<path d="M49 76 Q60 88 71 76" stroke="#2c3e50" stroke-width="4" fill="none" stroke-linecap="round"/>';
    const grin = '<path d="M47 74 Q60 91 73 74" stroke="#2c3e50" stroke-width="4" fill="none" stroke-linecap="round"/>';
    const openMouth = '<path d="M50 74 Q60 87 70 74 Z" fill="#2c3e50"/>';

    const variants = [
      // 0: round with a little bobble on top
      '<circle cx="60" cy="9" r="5.5" fill="#fff"/>' + body + eyes + cheeks + smile,
      // 1: cat ears
      '<path d="M28 30 L24 5 L49 22 Z" fill="#fff"/><path d="M92 30 L96 5 L71 22 Z" fill="#fff"/>' + body + eyes + cheeks + grin,
      // 2: bunny ears
      '<ellipse cx="47" cy="15" rx="8" ry="24" fill="#fff"/><ellipse cx="73" cy="15" rx="8" ry="24" fill="#fff"/>' +
      '<ellipse cx="47" cy="17" rx="3.4" ry="16" fill="#ffd0dd"/><ellipse cx="73" cy="17" rx="3.4" ry="16" fill="#ffd0dd"/>' + body + eyes + cheeks + smile,
      // 3: bear ears with an open happy mouth
      '<circle cx="33" cy="27" r="13" fill="#fff"/><circle cx="87" cy="27" r="13" fill="#fff"/>' + body + eyes + cheeks + openMouth
    ];
    return '<svg class="mascot" viewBox="0 0 120 120" aria-hidden="true">' + variants[i % variants.length] + "</svg>";
  }

  const ARROW_INNER =
    '<div class="arrow-hitbox"></div>' +
    '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">' +
    '<path d="M 50 15 Q 52 17 54 20 L 70 36 Q 73 39 75 40 L 82 47 Q 85 50 85 55 L 85 85 Q 85 90 80 90 L 20 90 Q 15 90 15 85 L 15 55 Q 15 50 18 47 L 25 40 Q 27 39 30 36 L 46 20 Q 48 17 50 15 Z" fill="currentColor"/>' +
    '<line x1="35" y1="45" x2="35" y2="75" stroke="black" stroke-width="2" opacity="0.3"/>' +
    '<line x1="50" y1="35" x2="50" y2="75" stroke="black" stroke-width="2" opacity="0.3"/>' +
    '<line x1="65" y1="45" x2="65" y2="75" stroke="black" stroke-width="2" opacity="0.3"/>' +
    "</svg>";

  const DOWN_SVG = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 10 12 15 17 10"></polyline></svg>';
  const UP_SVG = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 14 12 9 17 14"></polyline></svg>';
  const TICK_SVG = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

  // ---- elements ----
  const hubView = document.getElementById("hubView");
  const tileGrid = document.getElementById("tileGrid");
  const activityView = document.getElementById("activityView");
  const activityBack = document.getElementById("activityBack");
  const readingLines = document.getElementById("readingLines");
  const dotsContainer = document.getElementById("dotsContainer");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");
  const transition = document.getElementById("transition");
  const transitionConfetti = document.getElementById("transitionConfetti");
  const presentContainer = document.getElementById("presentContainer");
  const present = document.getElementById("present");
  const prize = document.getElementById("prize");
  const confettiContainer = document.getElementById("confettiContainer");

  prevBtn.innerHTML = UP_SVG;
  nextBtn.innerHTML = DOWN_SVG;

  // ---- state ----
  const completed = sections.map(() => false);
  let sectionIndex = 0;
  let cardIndex = 0;
  let lines = [];          // current card's reading lines
  let isDragging = false;
  let current = null;      // line being dragged

  // ================= HUB =================
  const activeIndex = () => completed.findIndex(c => !c); // -1 when all done
  const isUnlocked = i => i === 0 || completed[i - 1];

  function renderHub() {
    const active = activeIndex();
    tileGrid.innerHTML = "";
    sections.forEach((section, i) => {
      const theme = themeFor(section);
      const done = completed[i];
      const isActive = i === active;
      const locked = !isUnlocked(i);

      const tile = document.createElement(locked ? "div" : "button");
      tile.className = "tile" + (done ? " done" : "") + (isActive ? " active" : "") + (locked ? " locked" : "");

      const card = document.createElement("div");
      card.className = "tile-card";
      card.style.background = "linear-gradient(150deg," + theme.grad[0] + " 0%," + theme.grad[1] + " 100%)";
      card.innerHTML =
        mascot(i) +
        '<div class="tile-num">' + (i + 1) + "</div>" +
        (done ? '<div class="tile-star">⭐</div>' : "") +
        (isActive ? '<div class="tile-play"><svg viewBox="0 0 24 24" width="34" height="34" fill="#fff"><path d="M8 5v14l11-7z"/></svg></div>' : "") +
        (locked ? '<div class="tile-lock">🔒</div>' : "");

      const label = document.createElement("div");
      label.className = "tile-label";
      label.style.color = theme.label;
      label.textContent = section.label;

      tile.appendChild(card);
      tile.appendChild(label);
      if (!locked) tile.onclick = () => openActivity(i);
      tileGrid.appendChild(tile);
    });
  }

  function showHub() {
    activityView.style.display = "none";
    presentContainer.classList.remove("show");
    hubView.style.display = "block";
    renderHub();
  }

  // ================= ACTIVITY =================
  function openActivity(i) {
    sectionIndex = i;
    cardIndex = 0;
    hubView.style.display = "none";
    activityView.style.display = "flex";
    initDots();
    displayCard();
  }

  function initDots() {
    dotsContainer.innerHTML = "";
    const n = sections[sectionIndex].cards.length;
    for (let i = 0; i < n; i++) {
      const dot = document.createElement("div");
      dot.classList.add("dot");
      dotsContainer.appendChild(dot);
    }
    updateDots();
  }
  function updateDots() {
    dotsContainer.querySelectorAll(".dot").forEach((dot, index) => {
      dot.classList.remove("completed", "current", "upcoming");
      if (index < cardIndex) dot.classList.add("completed");
      else if (index === cardIndex) dot.classList.add("current");
      else dot.classList.add("upcoming");
    });
  }

  const currentCard = () => sections[sectionIndex].cards[cardIndex];

  function buildLine(text) {
    const line = document.createElement("div");
    line.className = "reading-line";

    const word = document.createElement("div");
    word.className = "word";
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement("span");
      span.textContent = text[i];
      if (text[i] === " ") span.classList.add("space");
      word.appendChild(span);
    }

    const track = document.createElement("div");
    track.className = "arrow-track";
    const fill = document.createElement("div");
    fill.className = "progress-fill";
    track.appendChild(fill);

    const arrow = document.createElement("div");
    arrow.className = "arrow";
    arrow.innerHTML = ARROW_INNER;

    line.appendChild(word);
    line.appendChild(track);
    line.appendChild(arrow);

    const obj = { line, word, track, fill, arrow };
    arrow.addEventListener("mousedown", e => startDrag(e, obj));
    arrow.addEventListener("touchstart", e => startDrag(e, obj), { passive: false });
    return obj;
  }

  function displayCard() {
    const card = currentCard();
    readingLines.className = "reading-lines type-" + card.type;
    readingLines.innerHTML = "";
    lines = [];
    const copies = card.type === "digraph" ? 2 : 1; // sound shows twice
    for (let i = 0; i < copies; i++) {
      const obj = buildLine(card.text);
      lines.push(obj);
      readingLines.appendChild(obj.line);
    }
    fitAll();
    updateDots();

    prevBtn.classList.toggle("disabled", cardIndex === 0);
    const isLast = cardIndex === sections[sectionIndex].cards.length - 1;
    nextBtn.innerHTML = isLast ? TICK_SVG : DOWN_SVG;
    nextBtn.classList.toggle("finish", isLast);
  }

  function fitAll() {
    const type = currentCard().type;
    const bases = { digraph: 150, word: 120, sight: 120, sentence: 64 };
    const maxWidth = Math.min(window.innerWidth * 0.86, 1100);
    lines.forEach(obj => {
      let size = bases[type];
      obj.word.style.fontSize = size + "px";
      let guard = 0;
      while (obj.word.scrollWidth > maxWidth && size > 18 && guard < 200) {
        size -= 4; obj.word.style.fontSize = size + "px"; guard++;
      }
      obj.track.style.width = Math.round(obj.word.getBoundingClientRect().width) + "px";
      obj.arrow.style.left = "0px";
      obj.fill.style.width = "0px";
    });
  }

  function highlight(obj) {
    const arrowRect = obj.arrow.getBoundingClientRect();
    const arrowCenter = arrowRect.left + arrowRect.width / 2;
    obj.word.querySelectorAll("span").forEach(letter => {
      const r = letter.getBoundingClientRect();
      if (arrowCenter >= r.left) letter.classList.add("highlighted");
      else letter.classList.remove("highlighted");
    });
  }

  function next() {
    if (cardIndex < sections[sectionIndex].cards.length - 1) {
      cardIndex++;
      displayCard();
    } else {
      completeSection();
    }
  }
  function prev() {
    if (cardIndex > 0) { cardIndex--; displayCard(); }
  }

  // ================= COMPLETION + TRANSITION =================
  function completeSection() {
    completed[sectionIndex] = true;
    const theme = themeFor(sections[sectionIndex]);
    activityView.style.display = "none";
    playTransition(theme.grad[0], function () {
      showHub();
      if (completed.every(Boolean)) showPresent();
    });
  }

  function playTransition(pastel, done) {
    transition.style.background = pastel;
    transition.classList.add("show");
    spawnConfetti(transitionConfetti, 70);
    playJingle();
    setTimeout(function () {
      transition.classList.remove("show");
      setTimeout(() => { transitionConfetti.innerHTML = ""; }, 400);
      if (done) done();
    }, 3200); // ~2x longer
  }

  // ---- happy jingle via Web Audio (no asset files) ----
  let audioCtx = null;
  function playJingle() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = audioCtx || new Ctx();
      const ctx = audioCtx;
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      // bright rising major run, ending high and held
      const seq = [
        { f: 523.25, t: 0.00, d: 0.16 }, // C5
        { f: 659.25, t: 0.10, d: 0.16 }, // E5
        { f: 783.99, t: 0.20, d: 0.16 }, // G5
        { f: 1046.50, t: 0.30, d: 0.18 }, // C6
        { f: 1318.51, t: 0.42, d: 0.34 }  // E6 (held)
      ];
      seq.forEach(n => {
        const t = now + n.t;
        [["triangle", 0.22], ["sine", 0.10]].forEach(([type, vol]) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = type;
          o.frequency.value = n.f;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(vol, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t + n.d);
          o.connect(g); g.connect(ctx.destination);
          o.start(t); o.stop(t + n.d + 0.05);
        });
      });
    } catch (e) { /* audio not available */ }
  }

  function spawnConfetti(container, count) {
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24", "#f0932b", "#eb4d4b", "#6ab04c", "#c7ecee", "#a55eea"];
    for (let i = 0; i < count; i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = Math.random() * 100 + "%";
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.animationDelay = Math.random() * 0.8 + "s";
      c.style.animationDuration = (Math.random() * 1.4 + 1.8) + "s";
      container.appendChild(c);
    }
  }

  // ================= PRESENT (day complete) =================
  function showPresent() { presentContainer.classList.add("show"); }
  function createPresentConfetti() {
    spawnConfetti(confettiContainer, 60);
    const prizeEmojis = ["🚂", "🤩", "🦸", "🏎️", "🚒", "🎤", "🗡️", "🚜", "🏓", "🍪", "🍩", "🍎", "🦉", "👻", "🐶", "🦖", "🚀", "⭐", "🐙", "🦄"];
    const rand = Math.random();
    const numPrizes = rand < 0.7 ? 1 : rand < 0.9 ? 2 : 3;
    const selected = [];
    while (selected.length < numPrizes) {
      const p = prizeEmojis[Math.floor(Math.random() * prizeEmojis.length)];
      if (!selected.includes(p)) selected.push(p);
    }
    document.querySelector(".prize-emoji").textContent = selected.join(" ");
    setTimeout(() => { present.style.display = "none"; prize.classList.add("show"); }, 500);
  }

  // ---- drag (per line) ----
  function startDrag(e, obj) {
    if (e.target.closest(".nav-btn") || e.target.closest(".back-btn")) return;
    isDragging = true;
    current = obj;
    obj.arrow.classList.add("dragging");
    e.preventDefault();
  }
  function drag(e) {
    if (!isDragging || !current) return;
    const touch = e.touches ? e.touches[0] : e;
    const trackRect = current.track.getBoundingClientRect();
    const offset = Math.min(Math.max(touch.clientX - trackRect.left, 0), trackRect.width);
    current.arrow.style.left = offset + "px";
    current.fill.style.width = offset + "px";
    highlight(current);
    e.preventDefault();
  }
  function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    if (current) current.arrow.classList.remove("dragging");
    current = null;
    if (e.cancelable) e.preventDefault();
  }

  // ---- wire up ----
  nextBtn.onclick = next;
  prevBtn.onclick = prev;
  activityBack.onclick = showHub;
  present.onclick = function () {
    if (!present.classList.contains("opened")) { present.classList.add("opened"); createPresentConfetti(); }
  };

  document.addEventListener("mousemove", drag);
  document.addEventListener("touchmove", drag, { passive: false });
  document.addEventListener("mouseup", endDrag);
  document.addEventListener("touchend", endDrag, { passive: false });
  window.addEventListener("resize", function () { if (activityView.style.display !== "none") fitAll(); });

  // ---- go ----
  showHub();
});
