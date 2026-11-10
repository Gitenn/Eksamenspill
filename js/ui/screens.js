/**
 * The three screens (menu, quiz, results) and switching between them.
 */
(function (Exam) {
  "use strict";

  const ui = (Exam.ui = Exam.ui || {});
  const { $ } = Exam.util;

  const root = {
    menu: $("menu"),
    quiz: $("quiz"),
    results: $("results"),
  };

  /** Shows one screen, hides the others, and scrolls to the top. */
  function show(name) {
    Object.keys(root).forEach((key) => {
      root[key].hidden = key !== name;
    });
    window.scrollTo(0, 0);
  }

  ui.screens = { root, show };
})((window.Exam = window.Exam || {}));
