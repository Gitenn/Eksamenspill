/**
 * Results screen: score, grade, per-topic table, flagged ids, and review of
 * wrong and lucky-guess answers.
 */
(function (Exam) {
  "use strict";

  const ui = (Exam.ui = Exam.ui || {});
  const { el, clear, button, sortedCopy } = Exam.util;
  const { progress, scoring } = Exam;

  let current = null; // the session being shown

  function buildSummaryCard(session) {
    const results = session.results;
    const right = results.filter((r) => r.ok).length;
    const percent = (100 * right) / results.length;
    const points = scoring.estimatedPoints(percent).toFixed(1);

    const card = el("div", "card");
    card.appendChild(
      el("h2", null, session.mode === "mock" ? "Mock exam result" : "Session result")
    );
    if (session.timeUp) {
      card.appendChild(el("p", "warn", "Time is up. Unanswered questions count as wrong."));
    }
    card.append(
      el("p", "big", `${right} / ${results.length}  (${percent.toFixed(1)}%)`),
      el(
        "p",
        null,
        `Estimated grade: ${scoring.gradeOf(percent)}  (equivalent to about ${points} of ${Exam.config.grading.pointsTotal} points)`
      ),
      el("p", "muted", scoring.bandsLegend())
    );
    return card;
  }

  function buildTopicCard(results) {
    const card = el("div", "card");
    card.appendChild(el("h3", null, "Score per topic"));

    const table = el("table", "tbl");
    const header = el("tr");
    ["Topic", "Right", "Total", "%"].forEach((label) => header.appendChild(el("th", null, label)));
    table.appendChild(header);

    scoring.topicBreakdown(results).forEach(({ topic, right, total }) => {
      const row = el("tr");
      row.append(
        el("td", null, topic),
        el("td", null, String(right)),
        el("td", null, String(total)),
        el("td", null, `${Math.round((100 * right) / total)}%`)
      );
      table.appendChild(row);
    });

    card.appendChild(table);
    return card;
  }

  function buildFlaggedCard() {
    const card = el("div", "card");
    card.appendChild(el("h3", null, "Flagged as wrong (report these ids)"));

    const ids = progress.flaggedIds();
    card.appendChild(el("p", "ids", ids.length ? ids.join(", ") : "none"));
    if (ids.length) {
      card.appendChild(
        button("Clear flags", "btn small", () => {
          progress.clearFlags();
          render(current);
        })
      );
    }
    return card;
  }

  /** One collapsible review entry. */
  function reviewItem(result, showChosen) {
    const { q } = result;
    const item = el("details", "rev");
    item.appendChild(el("summary", null, `[${q.id}] ${q.q}`));
    if (showChosen) {
      item.appendChild(el("p", null, `Your answer: ${scoring.formatOptions(q, result.chosen)}`));
    }
    item.append(
      el("p", null, `Correct: ${scoring.formatOptions(q, sortedCopy(q.answer))}`),
      el("p", null, q.why),
      el("p", "muted", `Source: ${q.source}`)
    );
    return item;
  }

  function buildUnsureCard(results) {
    const lucky = results.filter((r) => r.ok && r.unsure);
    const card = el("div", "card");
    card.appendChild(el("h3", null, `Right but unsure (${lucky.length})`));
    card.appendChild(
      el(
        "p",
        "muted",
        lucky.length
          ? "These count as right in your score, but stay in Weak spots until you answer them confidently."
          : "None."
      )
    );
    lucky.forEach((result) => card.appendChild(reviewItem(result, false)));
    return card;
  }

  function buildWrongCard(results) {
    const wrong = results.filter((r) => !r.ok);
    const card = el("div", "card");
    card.appendChild(el("h3", null, `Review of wrong answers (${wrong.length})`));
    if (!wrong.length) card.appendChild(el("p", "muted", "None. Clean run."));
    wrong.forEach((result) => card.appendChild(reviewItem(result, true)));
    return card;
  }

  function buildActions(session) {
    const bar = el("div", "actions");
    bar.append(
      button("Back to menu", "btn primary", () => ui.menu.open()),
      button("Run again", "btn", () => {
        const { session: next, error } = Exam.session.create(session.mode, session.options);
        if (error) {
          ui.menu.setMessage(error);
          ui.menu.open();
          return;
        }
        ui.quiz.start(next);
      })
    );
    return bar;
  }

  /** Draws the results for a finished session and shows the screen. */
  function render(session) {
    current = session;
    const container = ui.screens.root.results;
    clear(container);

    container.append(
      buildSummaryCard(session),
      buildTopicCard(session.results),
      buildFlaggedCard(),
      buildUnsureCard(session.results),
      buildWrongCard(session.results),
      buildActions(session)
    );
    ui.screens.show("results");
  }

  ui.results = { render };
})((window.Exam = window.Exam || {}));
