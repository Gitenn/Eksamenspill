/**
 * Part C drill: short-answer prompts from window.ESSAYS.
 * Write an answer, reveal the rubric, score yourself 0-5. Scores are saved
 * in localStorage (wrapped in try/catch) so the lowest-scored prompts come first.
 */
(function (Exam) {
  "use strict";

  const ui = (Exam.ui = Exam.ui || {});
  const { el, clear, button } = Exam.util;

  const STORE_KEY = "dave3625_essays_v1";
  const essays = validate(window.ESSAYS);

  function validate(list) {
    if (!Array.isArray(list)) return [];
    const seen = {};
    return list.filter((e, i) => {
      const where = e && e.id ? e.id : `essay #${i + 1}`;
      const ok =
        e &&
        typeof e.id === "string" &&
        typeof e.title === "string" &&
        typeof e.prompt === "string" &&
        Array.isArray(e.rubric) &&
        e.rubric.length > 0 &&
        typeof e.source === "string" &&
        !seen[e.id];
      if (!ok) Exam.errors.add(`${where}: malformed or duplicate essay (needs id, title, prompt, rubric[], source)`);
      else seen[e.id] = true;
      return ok;
    });
  }

  function loadScores() {
    try {
      return JSON.parse(window.localStorage.getItem(STORE_KEY)) || {};
    } catch (err) {
      return {};
    }
  }

  function saveScore(id, score) {
    const scores = loadScores();
    scores[id] = score;
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(scores));
    } catch (err) {
      /* storage blocked: keep going without saving */
    }
  }

  /** Unscored first, then lowest score first. */
  function ordered() {
    const scores = loadScores();
    const rank = (e) => (e.id in scores ? scores[e.id] : -1);
    return essays.slice().sort((a, b) => rank(a) - rank(b));
  }

  let queue = [];
  let index = 0;

  function wordCount(text) {
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.length;
  }

  function render() {
    const container = ui.screens.root.essay;
    clear(container);
    const e = queue[index];
    const scores = loadScores();

    const card = el("div", "card");
    card.append(
      el("p", "tag", `PART C  ${index + 1} / ${queue.length}  ·  5 points`),
      el("h2", null, e.title),
      el("p", "qtext", e.prompt),
      el("p", "hint", "Write about 80-150 words, as on the exam. Name the risk, say why, give a concrete action with a reason.")
    );

    const box = el("textarea", "essaybox");
    box.rows = 8;
    box.placeholder = "Your answer...";
    const counter = el("p", "muted", "0 words");
    box.addEventListener("input", () => {
      const n = wordCount(box.value);
      counter.textContent = `${n} words` + (n > 150 ? " (over 150: tighten it)" : "");
    });
    card.append(box, counter);

    const rubric = el("div", "feedback ok");
    rubric.hidden = true;
    rubric.appendChild(el("p", "verdict", "MODEL ANSWER POINTS"));
    const list = el("ul");
    e.rubric.forEach((line) => list.appendChild(el("li", null, line)));
    rubric.append(
      list,
      el("p", "muted", "Score: 1 point per correct idea, max 2 in each part, plus 1 for a short reason. Total 5."),
      el("p", "src", `Source: ${e.source}`)
    );

    const scoreBar = el("div", "actions");
    scoreBar.appendChild(el("span", "muted", "Your score: "));
    [0, 1, 2, 3, 4, 5].forEach((s) => {
      const b = button(String(s), "btn small", () => {
        saveScore(e.id, s);
        next();
      });
      scoreBar.appendChild(b);
    });
    rubric.appendChild(scoreBar);

    const actions = el("div", "actions");
    const reveal = button("Show model answer", "btn primary", () => {
      rubric.hidden = false;
      reveal.hidden = true;
    });
    actions.append(
      reveal,
      button("Skip", "btn", next),
      button("Back to menu", "btn", () => ui.menu.open())
    );

    if (e.id in scores) card.appendChild(el("p", "muted", `Last self-score: ${scores[e.id]} / 5`));
    card.append(rubric, actions);
    container.appendChild(card);
    ui.screens.show("essay");
    box.focus();
  }

  function next() {
    index++;
    if (index >= queue.length) {
      showSummary();
      return;
    }
    render();
  }

  function showSummary() {
    const container = ui.screens.root.essay;
    clear(container);
    const scores = loadScores();
    const card = el("div", "card");
    card.appendChild(el("h2", null, "Part C summary"));
    const table = el("table", "tbl");
    const header = el("tr");
    ["Prompt", "Last score"].forEach((h) => header.appendChild(el("th", null, h)));
    table.appendChild(header);
    let total = 0;
    let counted = 0;
    essays.forEach((e) => {
      const row = el("tr");
      const s = e.id in scores ? scores[e.id] : null;
      if (s !== null) {
        total += s;
        counted++;
      }
      row.append(el("td", null, `${e.id} ${e.title}`), el("td", null, s === null ? "-" : `${s} / 5`));
      table.appendChild(row);
    });
    card.append(
      table,
      el("p", null, counted ? `Average: ${(total / counted).toFixed(1)} / 5 (the exam has 5 prompts = 25 points).` : "No scores yet.")
    );
    const actions = el("div", "actions");
    actions.append(
      button("Again (lowest first)", "btn primary", start),
      button("Back to menu", "btn", () => ui.menu.open())
    );
    card.appendChild(actions);
    container.appendChild(card);
    ui.screens.show("essay");
  }

  function start() {
    queue = ordered();
    index = 0;
    if (!queue.length) {
      ui.menu.setMessage("No Part C prompts loaded (questions/essays.js).");
      ui.menu.open();
      return;
    }
    render();
  }

  ui.essay = { start, count: () => essays.length };
})((window.Exam = window.Exam || {}));
