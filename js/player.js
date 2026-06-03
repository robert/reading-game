/*
 * PLAYER
 * ======
 * Walks the child through one day's lesson, section by section. Each card
 * (a sound, word, sight word or sentence) is read with the draggable arrow
 * that highlights letters as it passes. A present + confetti appears at the
 * very end of the day.
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

  // ---- elements ----
  const dayTitle = document.getElementById("dayTitle");
  const breadcrumb = document.getElementById("breadcrumb");
  const cardNote = document.getElementById("cardNote");
  const wordElement = document.getElementById("word");
  const wordArea = document.getElementById("wordArea");
  const dotsContainer = document.getElementById("dotsContainer");
  const arrowElement = document.getElementById("arrow");
  const arrowTrack = document.querySelector(".arrow-track");
  const progressFill = document.getElementById("progressFill");
  const nextBtn = document.getElementById("nextBtn");
  const prevBtn = document.getElementById("prevBtn");
  const bigModeBtn = document.getElementById("bigModeBtn");
  const presentContainer = document.getElementById("presentContainer");
  const present = document.getElementById("present");
  const prize = document.getElementById("prize");
  const confettiContainer = document.getElementById("confettiContainer");
  const playAgainBtn = document.getElementById("playAgainBtn");
  const nextDayBtn = document.getElementById("nextDayBtn");

  // ---- state ----
  let sectionIndex = 0;
  let cardIndex = 0;
  let isDragging = false;
  let arrowOffset = 0;

  dayTitle.textContent = "Week " + built.week.n + " · " + built.week.digraph +
    " · Day " + dayN;

  // Next-day link target
  const lastDay = built.days.length;
  if (dayN < lastDay) {
    nextDayBtn.href = "player.html?week=" + weekN + "&day=" + (dayN + 1);
    nextDayBtn.textContent = "Next day";
  } else {
    nextDayBtn.href = "index.html";
    nextDayBtn.textContent = "Back to weeks";
  }

  function buildBreadcrumb() {
    breadcrumb.innerHTML = "";
    sections.forEach((s, i) => {
      const el = document.createElement("button");
      el.className = "crumb";
      if (i < sectionIndex) el.classList.add("done");
      if (i === sectionIndex) el.classList.add("current");
      el.textContent = s.label;
      el.onclick = () => goToSection(i);
      breadcrumb.appendChild(el);
    });
  }

  function goToSection(i) {
    if (i === sectionIndex) return;
    sectionIndex = i;
    cardIndex = 0;
    buildBreadcrumb();
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
    const dots = dotsContainer.querySelectorAll(".dot");
    dots.forEach((dot, index) => {
      dot.classList.remove("completed", "current", "upcoming");
      if (index < cardIndex) dot.classList.add("completed");
      else if (index === cardIndex) dot.classList.add("current");
      else dot.classList.add("upcoming");
    });
  }

  function currentCard() {
    return sections[sectionIndex].cards[cardIndex];
  }

  // Auto-fit font so the text fits on one line, then make the bar span just
  // the width of the word/digraph.
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
      size -= 4;
      wordElement.style.fontSize = size + "px";
      guard++;
    }

    // Bar spans exactly the rendered word width.
    arrowTrack.style.width = Math.round(wordElement.getBoundingClientRect().width) + "px";
  }

  function displayCard() {
    const card = currentCard();
    cardNote.textContent = card.note || "";

    wordElement.innerHTML = "";
    const text = card.text;
    for (let i = 0; i < text.length; i++) {
      const span = document.createElement("span");
      span.textContent = text[i];
      if (text[i] === " ") span.classList.add("space");
      wordElement.appendChild(span);
    }
    fitText();
    updateDots();
    resetArrow();
    updateNavState();
  }

  function updateNavState() {
    const firstEver = sectionIndex === 0 && cardIndex === 0;
    prevBtn.classList.toggle("disabled", firstEver);
  }

  function resetArrow() {
    arrowOffset = 0;
    arrowElement.style.left = "0px";
    progressFill.style.width = "0px";
    wordElement.querySelectorAll("span").forEach(l => l.classList.remove("highlighted"));
  }

  function updateHighlighting() {
    const letters = wordElement.querySelectorAll("span");
    const arrowRect = arrowElement.getBoundingClientRect();
    const arrowCenter = arrowRect.left + arrowRect.width / 2;
    letters.forEach(letter => {
      const r = letter.getBoundingClientRect();
      if (arrowCenter >= r.left) letter.classList.add("highlighted");
      else letter.classList.remove("highlighted");
    });
  }

  function next() {
    const section = sections[sectionIndex];
    if (cardIndex < section.cards.length - 1) {
      cardIndex++;
      displayCard();
    } else if (sectionIndex < sections.length - 1) {
      sectionIndex++;
      cardIndex = 0;
      buildBreadcrumb();
      initDots();
      displayCard();
    } else {
      showPresent();
    }
  }

  function prev() {
    if (cardIndex > 0) {
      cardIndex--;
      displayCard();
    } else if (sectionIndex > 0) {
      sectionIndex--;
      cardIndex = sections[sectionIndex].cards.length - 1;
      buildBreadcrumb();
      initDots();
      displayCard();
    }
  }

  // ---- present / prize ----
  function showPresent() {
    wordArea.style.display = "none";
    dotsContainer.style.display = "none";
    nextBtn.style.display = "none";
    prevBtn.style.display = "none";
    breadcrumb.style.visibility = "hidden";
    presentContainer.classList.add("show");
  }

  function createConfetti() {
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24", "#f0932b", "#eb4d4b", "#6ab04c", "#c7ecee"];
    const prizeEmojis = ["🚂", "🤩", "🦸", "🏎️", "🚒", "🎤", "🗡️", "🚜", "🏓", "🍪", "🍩", "🍎", "🦉", "👻", "🐶", "🦖", "🚀", "⭐", "🐙", "🦄"];
    for (let i = 0; i < 60; i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = Math.random() * 100 + "%";
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.animationDelay = Math.random() * 3 + "s";
      c.style.animationDuration = (Math.random() * 2 + 2) + "s";
      confettiContainer.appendChild(c);
    }
    const rand = Math.random();
    const numPrizes = rand < 0.7 ? 1 : rand < 0.9 ? 2 : 3;
    const selected = [];
    while (selected.length < numPrizes) {
      const p = prizeEmojis[Math.floor(Math.random() * prizeEmojis.length)];
      if (!selected.includes(p)) selected.push(p);
    }
    const prizeEmoji = document.querySelector(".prize-emoji");
    if (prizeEmoji) prizeEmoji.textContent = selected.join(" ");
    setTimeout(() => {
      present.style.display = "none";
      prize.classList.add("show");
    }, 500);
  }

  function restart() {
    sectionIndex = 0;
    cardIndex = 0;
    presentContainer.classList.remove("show");
    prize.classList.remove("show");
    present.classList.remove("opened");
    present.style.display = "block";
    confettiContainer.innerHTML = "";
    wordArea.style.display = "flex";
    dotsContainer.style.display = "flex";
    nextBtn.style.display = "flex";
    prevBtn.style.display = "flex";
    breadcrumb.style.visibility = "visible";
    buildBreadcrumb();
    initDots();
    displayCard();
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
    const relativeX = touch.clientX - trackRect.left;
    arrowOffset = Math.min(Math.max(relativeX, 0), trackRect.width);
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
  present.onclick = function () {
    if (!present.classList.contains("opened")) {
      present.classList.add("opened");
      createConfetti();
    }
  };
  playAgainBtn.onclick = restart;

  arrowElement.addEventListener("mousedown", startDrag);
  arrowElement.addEventListener("touchstart", startDrag, { passive: false });
  document.addEventListener("mousemove", drag);
  document.addEventListener("touchmove", drag, { passive: false });
  document.addEventListener("mouseup", endDrag);
  document.addEventListener("touchend", endDrag, { passive: false });
  window.addEventListener("resize", fitText);

  // ---- go ----
  buildBreadcrumb();
  initDots();
  displayCard();
});
