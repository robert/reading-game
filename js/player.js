/*
 * PLAYER
 * ======
 * Each day opens on a LESSON HUB: a grid of tiles (the day's sections), each
 * with a cute mascot. Tiles unlock in order. Tapping the active tile (bigger,
 * with a play icon) opens the reading activity for that section, where cards
 * (sounds / words / sight words / sentences) are read with the draggable arrow.
 *
 * Finishing a section earns a STAR, plays a short pastel + confetti + jingle
 * transition, and unlocks the next tile. Finishing every section opens the
 * present at the end of the day.
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
    "This week's sound":   { grad: ["#5ad1cb", "#36b3ac"], label: "#1f7d77", emoji: "🔊" },
    "Sight words":         { grad: ["#9a8cff", "#7a68f0"], label: "#5a44c9", emoji: "👀" },
    "Read the words":      { grad: ["#ff8d6b", "#ff6f54"], label: "#d2532f", emoji: "🧩" },
    "Read the sentences":  { grad: ["#ff8fb6", "#ff6d9c"], label: "#cf4f79", emoji: "📖" }
  };
  const FALLBACK = { grad: ["#7fb2ff", "#5a8df0"], label: "#3a6bcf", emoji: "⭐" };
  const themeFor = s => THEMES[s.label] || FALLBACK;

  function mascot(animate) {
    return (
      '<svg class="mascot' + (animate ? " bob" : "") + '" viewBox="0 0 120 120" aria-hidden="true">' +
      '<path d="M60 8 C90 8 108 30 108 60 C108 95 88 113 60 113 C32 113 12 95 12 60 C12 30 30 8 60 8 Z" fill="#ffffff"/>' +
      '<ellipse cx="38" cy="80" rx="9" ry="6" fill="#ffb3c7"/>' +
      '<ellipse cx="82" cy="80" rx="9" ry="6" fill="#ffb3c7"/>' +
      '<circle cx="45" cy="58" r="10" fill="#2c3e50"/>' +
      '<circle cx="75" cy="58" r="10" fill="#2c3e50"/>' +
      '<circle cx="48" cy="55" r="3" fill="#fff"/>' +
      '<circle cx="78" cy="55" r="3" fill="#fff"/>' +
      '<path d="M48 78 Q60 90 72 78" stroke="#2c3e50" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      "</svg>"
    );
  }

  // ---- elements ----
  const hubView = document.getElementById("hubView");
  const lessonTitle = document.getElementById("lessonTitle");
  const tileGrid = document.getElementById("tileGrid");
  const activityView = document.getElementById("activityView");
  const activityBack = document.getElementById("activityBack");
  const activityTitle = document.getElementById("activityTitle");
  const cardNote = document.getElementById("cardNote");
  const wordElement = document.getElementById("word");
  const wordArea = document.getElementById("wordArea");
  const dotsContainer = document.getElementById("dotsContainer");
  const arrowElement = document.getElementById("arrow");
  const arrowTrack = document.querySelector(".arrow-track");
  const progressFill = document.getElementById("progressFill");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");
  const transition = document.getElementById("transition");
  const transitionConfetti = document.getElementById("transitionConfetti");
  const presentContainer = document.getElementById("presentContainer");
  const present = document.getElementById("present");
  const prize = document.getElementById("prize");
  const confettiContainer = document.getElementById("confettiContainer");
  const playAgainBtn = document.getElementById("playAgainBtn");
  const nextDayBtn = document.getElementById("nextDayBtn");

  // ---- state ----
  const completed = sections.map(() => false);
  let sectionIndex = 0;
  let cardIndex = 0;
  let isDragging = false;
  let arrowOffset = 0;

  lessonTitle.textContent = "Week " + built.week.n + " · " + built.week.digraph + " · Day " + dayN;
  const lastDay = built.days.length;
  if (dayN < lastDay) {
    nextDayBtn.href = "player.html?week=" + weekN + "&day=" + (dayN + 1);
    nextDayBtn.textContent = "Next day";
  } else {
    nextDayBtn.href = "index.html";
    nextDayBtn.textContent = "Back to weeks";
  }

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
        mascot(isActive) +
        '<div class="tile-badge">' + theme.emoji + "</div>" +
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
    hubView.style.display = "block";
    renderHub();
  }

  // ================= ACTIVITY =================
  function openActivity(i) {
    sectionIndex = i;
    cardIndex = 0;
    hubView.style.display = "none";
    activityView.style.display = "flex";
    activityTitle.textContent = sections[i].label;
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

  function fitText() {
    const card = currentCard();
    wordArea.classList.remove("type-digraph", "type-word", "type-sight", "type-sentence");
    wordArea.classList.add("type-" + card.type);
    const bases = { digraph: 200, word: 120, sight: 120, sentence: 64 };
    let size = bases[card.type];
    wordElement.style.fontSize = size + "px";
    const maxWidth = Math.min(window.innerWidth * 0.86, 1100);
    let guard = 0;
    while (wordElement.scrollWidth > maxWidth && size > 18 && guard < 200) {
      size -= 4; wordElement.style.fontSize = size + "px"; guard++;
    }
    arrowTrack.style.width = Math.round(wordElement.getBoundingClientRect().width) + "px";
  }

  function displayCard() {
    const card = currentCard();
    cardNote.textContent = card.note || "";
    wordElement.innerHTML = "";
    for (let i = 0; i < card.text.length; i++) {
      const span = document.createElement("span");
      span.textContent = card.text[i];
      if (card.text[i] === " ") span.classList.add("space");
      wordElement.appendChild(span);
    }
    fitText();
    updateDots();
    resetArrow();
    prevBtn.classList.toggle("disabled", cardIndex === 0);
  }

  function resetArrow() {
    arrowOffset = 0;
    arrowElement.style.left = "0px";
    progressFill.style.width = "0px";
    wordElement.querySelectorAll("span").forEach(l => l.classList.remove("highlighted"));
  }

  function updateHighlighting() {
    const arrowRect = arrowElement.getBoundingClientRect();
    const arrowCenter = arrowRect.left + arrowRect.width / 2;
    wordElement.querySelectorAll("span").forEach(letter => {
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
      if (completed.every(Boolean)) { showHub(); showPresent(); }
      else showHub();
    });
  }

  function playTransition(pastel, done) {
    transition.style.background = pastel;
    transition.classList.add("show");
    spawnConfetti(transitionConfetti, 40);
    playJingle();
    setTimeout(function () {
      transition.classList.remove("show");
      setTimeout(() => { transitionConfetti.innerHTML = ""; }, 300);
      if (done) done();
    }, 1600);
  }

  // ---- short happy jingle via Web Audio (no asset files) ----
  let audioCtx = null;
  function playJingle() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = audioCtx || new Ctx();
      const ctx = audioCtx;
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
      notes.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "triangle";
        o.frequency.value = f;
        const t = now + i * 0.1;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.25, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
        o.connect(g); g.connect(ctx.destination);
        o.start(t); o.stop(t + 0.28);
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
      c.style.animationDelay = Math.random() * 0.6 + "s";
      c.style.animationDuration = (Math.random() * 1.2 + 1.4) + "s";
      container.appendChild(c);
    }
  }

  // ================= PRESENT (day complete) =================
  function showPresent() {
    presentContainer.classList.add("show");
  }
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
  function resetDay() {
    for (let i = 0; i < completed.length; i++) completed[i] = false;
    presentContainer.classList.remove("show");
    prize.classList.remove("show");
    present.classList.remove("opened");
    present.style.display = "block";
    confettiContainer.innerHTML = "";
    showHub();
  }

  // ---- drag ----
  function startDrag(e) {
    if (e.target.closest(".nav-btn") || e.target.closest(".back-btn")) return;
    isDragging = true;
    arrowElement.classList.add("dragging");
    e.preventDefault();
  }
  function drag(e) {
    if (!isDragging) return;
    const touch = e.touches ? e.touches[0] : e;
    const trackRect = arrowTrack.getBoundingClientRect();
    arrowOffset = Math.min(Math.max(touch.clientX - trackRect.left, 0), trackRect.width);
    arrowElement.style.left = arrowOffset + "px";
    progressFill.style.width = arrowOffset + "px";
    updateHighlighting();
    e.preventDefault();
  }
  function endDrag(e) {
    if (!isDragging) return;
    isDragging = false;
    arrowElement.classList.remove("dragging");
    if (e.cancelable) e.preventDefault();
  }

  // ---- wire up ----
  nextBtn.onclick = next;
  prevBtn.onclick = prev;
  activityBack.onclick = showHub;
  present.onclick = function () {
    if (!present.classList.contains("opened")) { present.classList.add("opened"); createPresentConfetti(); }
  };
  playAgainBtn.onclick = resetDay;

  arrowElement.addEventListener("mousedown", startDrag);
  arrowElement.addEventListener("touchstart", startDrag, { passive: false });
  document.addEventListener("mousemove", drag);
  document.addEventListener("touchmove", drag, { passive: false });
  document.addEventListener("mouseup", endDrag);
  document.addEventListener("touchend", endDrag, { passive: false });
  window.addEventListener("resize", function () { if (activityView.style.display !== "none") fitText(); });

  // ---- go ----
  showHub();
});
