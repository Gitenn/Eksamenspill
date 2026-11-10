/**
 * Small UI pieces used on more than one screen.
 */
(function (Exam) {
  "use strict";

  const ui = (Exam.ui = Exam.ui || {});
  const { el } = Exam.util;

  /** Collapsible "Read first" panel with the study notes for a topic. */
  function notesPanel(topic) {
    const lines = Exam.data.notes[topic];
    const panel = el("details", "notes");
    panel.appendChild(el("summary", null, `Read first: ${topic}`));

    if (!lines) {
      panel.appendChild(el("p", "muted", "No notes for this topic yet."));
      return panel;
    }

    const list = el("ul");
    lines.forEach((line) => list.appendChild(el("li", null, line)));
    panel.appendChild(list);
    return panel;
  }

  ui.components = { notesPanel };
})((window.Exam = window.Exam || {}));
