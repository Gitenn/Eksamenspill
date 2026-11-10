/**
 * Small, dependency-free helpers shared by every module.
 */
(function (Exam) {
  "use strict";

  /** Shorthand for document.getElementById. */
  const $ = (id) => document.getElementById(id);

  /** Creates an element with an optional class name and text content. */
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  /** Removes all children of a node. */
  function clear(node) {
    node.replaceChildren();
  }

  /** Creates a <button type="button"> with a click handler. */
  function button(label, className, onClick) {
    const node = el("button", className, label);
    node.type = "button";
    node.addEventListener("click", onClick);
    return node;
  }

  /**
   * Stops a button from taking keyboard focus when clicked, so the quiz
   * keyboard shortcuts (1-9, U, Enter) keep working after a mouse click.
   */
  function noFocusOnClick(node) {
    node.addEventListener("mousedown", (event) => event.preventDefault());
  }

  const pad = (n) => String(n).padStart(2, "0");

  const numAsc = (a, b) => a - b;

  /** Returns a numerically sorted copy, leaving the original untouched. */
  const sortedCopy = (numbers) => [...numbers].sort(numAsc);

  const isNonEmptyString = (value) => typeof value === "string" && value.length > 0;

  /** Fisher-Yates shuffle that returns a new array. */
  function shuffle(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  Exam.util = {
    $,
    el,
    clear,
    button,
    noFocusOnClick,
    pad,
    numAsc,
    sortedCopy,
    isNonEmptyString,
    shuffle,
  };
})((window.Exam = window.Exam || {}));
