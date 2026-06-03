document.addEventListener("DOMContentLoaded", function () {
  const grid = document.getElementById("weekGrid");

  WEEKS.forEach(week => {
    const card = document.createElement("div");
    card.className = "week-card" + (week.draft ? " draft" : "");

    const header = document.createElement("div");
    header.className = "week-header";
    header.innerHTML =
      '<div class="week-num">Week ' + week.n + '</div>' +
      '<div class="week-digraph">' + week.digraph + '</div>' +
      '<div class="week-status">' + (week.status === "review" ? "review" : "new sound") + '</div>';
    card.appendChild(header);

    const sights = document.createElement("div");
    sights.className = "week-sights";
    sights.textContent = "Sight words: " + week.sightWords.join(", ");
    card.appendChild(sights);

    if (week.draft) {
      const note = document.createElement("div");
      note.className = "week-draft-note";
      note.textContent = "Words & sentences not written yet";
      card.appendChild(note);
    }

    const days = document.createElement("div");
    days.className = "day-row";
    for (let d = 1; d <= DAYS_PER_WEEK; d++) {
      const a = document.createElement("a");
      a.className = "day-btn";
      a.textContent = d;
      a.href = "player.html?week=" + week.n + "&day=" + d;
      days.appendChild(a);
    }
    card.appendChild(days);

    grid.appendChild(card);
  });
});
