/**
 * Entry point: wires up the keyboard handler and opens the menu.
 * Loaded last, after every other module.
 */
(function (Exam) {
  "use strict";

  Exam.errors.render();
  document.addEventListener("keydown", Exam.ui.quiz.handleKey);
  Exam.ui.menu.open();
})(window.Exam);
