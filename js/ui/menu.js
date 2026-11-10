/**
 * Menu screen: topic and length pickers, start buttons, maintenance buttons.
 */
(function (Exam) {
  "use strict";

  const ui = (Exam.ui = Exam.ui || {});
  const { el, clear, button } = Exam.util;
  const { config, data, progress } = Exam;

  const ALL = config.allTopics;

  // Menu choices live here so they survive re-renders.
  let selectedTopic = ALL;
  let selectedLength = config.defaultSessionLength;
  let message = "";

  /** Builds a <select> from [value, label] pairs. */
  function buildSelect(pairs, current, onChange) {
    const select = el("select");
    pairs.forEach(([value, label]) => {
      const option = el("option", null, label);
      option.value = value;
      select.appendChild(option);
    });
    select.value = current;
    select.addEventListener("change", () => onChange(select.value));
    return select;
  }

  function labelled(labelText, control) {
    const wrapper = el("label", "field");
    wrapper.append(el("span", null, labelText), control);
    return wrapper;
  }

  function buildTopicField() {
    const pairs = [
      [ALL, `All topics (${data.questions.length})`],
      ...data.topics.map((t) => [t, `${t} (${data.byTopic[t].length})`]),
    ];
    const select = buildSelect(pairs, selectedTopic, (value) => {
      selectedTopic = value;
      message = "";
      render();
    });
    return labelled("Topic", select);
  }

  function buildLengthField() {
    const select = buildSelect(config.sessionLengths, selectedLength, (value) => {
      selectedLength = value;
    });
    return labelled("Questions per practice session", select);
  }

  function buildStartButtons() {
    const { mock } = config;
    const bar = el("div", "actions");
    bar.append(
      button("Practice", "btn primary", () => start("practice")),
      button("Weak spots only", "btn", () => start("weak")),
      button(`Mock exam (${mock.questions} q, ${mock.minutes / 60} h)`, "btn", () => start("mock"))
    );
    return bar;
  }

  function buildMaintenanceButtons() {
    const bar = el("div", "actions");
    bar.append(
      button("Clear flags", "btn small", () => {
        progress.clearFlags();
        render();
      }),
      button("Clear unsure marks", "btn small", () => {
        progress.clearUnsure();
        render();
      }),
      button("Reset all progress", "btn small", () => {
        if (window.confirm("Erase all progress and flags?")) {
          progress.reset();
          message = "";
          render();
        }
      })
    );
    return bar;
  }

  function start(mode) {
    const { session, error } = Exam.session.create(mode, {
      topic: selectedTopic,
      length: selectedLength,
    });

    if (error) {
      message = error;
      render();
      return;
    }

    message = "";
    ui.quiz.start(session);
  }

  function render() {
    const container = ui.screens.root.menu;
    clear(container);

    const card = el("div", "card");
    card.appendChild(el("h2", null, "Control panel"));
    card.appendChild(
      el(
        "p",
        "muted",
        `${data.questions.length} questions loaded in ${data.topics.length} topics. ` +
          `Flagged as wrong: ${progress.flaggedIds().length}.`
      )
    );

    if (!data.questions.length) {
      card.appendChild(
        el(
          "p",
          "warn",
          "No valid questions loaded. Keep the whole folder together: quiz.html needs the questions/, js/ and css/ folders next to it."
        )
      );
      container.appendChild(card);
      return;
    }

    const pool = data.poolFor(selectedTopic);
    const stats = progress.poolStats(pool);

    card.append(
      buildTopicField(),
      buildLengthField(),
      el(
        "p",
        "muted",
        `Pool: ${pool.length} questions. Seen: ${stats.seen}. ` +
          `Lifetime accuracy: ${stats.accuracy}. Marked unsure: ${stats.unsure}.`
      )
    );
    if (selectedTopic !== ALL) card.appendChild(ui.components.notesPanel(selectedTopic));
    if (message) card.appendChild(el("p", "warn", message));

    card.append(buildStartButtons(), buildMaintenanceButtons());
    container.appendChild(card);
  }

  /** Shows the menu screen. */
  function open() {
    render();
    ui.screens.show("menu");
  }

  /** Sets a one-off notice (e.g. "No weak spots yet") for the next render. */
  function setMessage(text) {
    message = text;
  }

  ui.menu = { open, render, setMessage };
})((window.Exam = window.Exam || {}));
