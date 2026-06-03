# Reading Practice

A little web game to practice reading, with a weekly rhythm. Each week focuses
on one **digraph** and three new **sight words**. Every day the child:

1. **Recaps this week's sound** plus one digraph from the last 3 weeks.
2. **Meets a new sight word** and recaps the week's words + 2 from the past.
3. **Reads 12 words** — 8 with this week's digraph, 2 from last week, 1 from
   two weeks ago, 1 from three weeks ago.
4. **Reads 6 sentences** built from those words plus already-known words.

Words and sentences are read using the draggable **arrow** that highlights
letters as it sweeps across (the same mechanic as the reading game on
robert.github.com).

Each day opens on a **lesson hub**: a row of tiles (the four sections), each
with a cute mascot. Tiles unlock in order — the next one to do is bigger and
shows a play icon. Finishing a section earns a **star**, plays a quick
pastel-screen + confetti + jingle transition, and unlocks the next tile.
Finishing all four opens a **present** with confetti. 🎁

## Using it

- Open `index.html`, pick a week, then pick a day (1–6).
- On the lesson hub, tap the highlighted tile to start that section.
- Drag the arrow under the word to read along; tap the down/up chevrons to
  move to the next/previous card. The back arrow returns to the hub.

## Files

| File | What it is |
|------|------------|
| `index.html` / `js/index.js` | Week & day chooser |
| `player.html` / `js/player.js` | The daily lesson player |
| `js/weeks.js` | **The curriculum** — one entry per week (edit this) |
| `js/lessons.js` | Builds the daily lessons from the curriculum |
| `css/styles.css` | Styling |

## Setting up a week (in a Claude Code session)

Edit the relevant entry in `js/weeks.js`. Tell me at the start of the week
whether the digraph is **new** or a **review**, and I'll fill in:

- `digraph`, `status` (`"new"` / `"review"`), `examples`
- `sightWords` — the 3 new sight words
- `words` — ~24+ words that use this week's digraph (recap words from earlier
  weeks are pulled in automatically)
- `sentences` — 18 sentences using only already-known digraphs

The builder spreads these across 6 days so each word is read about twice
(some three times) and each sentence twice, with no repeats within a single
day. Weeks 1–3 are fully written; weeks 4–18 are a proposed roadmap (digraph
+ sight-word order) waiting to be filled in.

### Design notes / things you can change

- **6 practice days per week** (`DAYS_PER_WEEK` in `weeks.js`).
- The recap digraph rotates through the last 3 weeks by day; override per week
  with `recapDigraphWeek`.
- Sight words are introduced one per day on days 1–3, then all are recapped.

## Publishing to GitHub Pages

This is a plain static site at the repo root, so:

1. Push to GitHub.
2. Repo **Settings → Pages → Build from branch**, branch `main`, folder `/root`.
3. It will be live at `https://<user>.github.io/<repo>/`.
