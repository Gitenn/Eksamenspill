/**
 * Error banner.
 *
 * Loaded first (from <head>) so it can catch syntax errors in any question
 * file that loads later. Other modules report data problems with
 * Exam.errors.add(message).
 */
(function (Exam) {
  "use strict";

  const messages = [];

  /** Redraws the red banner from the list of collected messages. */
  function render() {
    const bar = document.getElementById("errbar");
    if (!bar) return;

    bar.replaceChildren();
    if (!messages.length) {
      bar.hidden = true;
      return;
    }

    bar.hidden = false;
    const heading = document.createElement("strong");
    heading.textContent =
      `DATA ERRORS (${messages.length}): the items below were skipped or a file failed to load.`;

    const list = document.createElement("ul");
    messages.forEach((message) => {
      const item = document.createElement("li");
      item.textContent = message;
      list.appendChild(item);
    });

    bar.append(heading, list);
  }

  function add(message) {
    messages.push(String(message));
    render();
  }

  window.addEventListener("error", (event) => {
    if (!event || !event.message) return;

    let text = `Script error: ${event.message}`;
    if (event.filename) {
      text += ` in ${String(event.filename).split("/").pop()} line ${event.lineno}`;
    }
    if (event.message === "Script error.") {
      text += " (a question file probably has a syntax error: check quotes, commas and brackets)";
    }
    add(text);
  });

  document.addEventListener("DOMContentLoaded", render);

  Exam.errors = { add, render };
})((window.Exam = window.Exam || {}));
