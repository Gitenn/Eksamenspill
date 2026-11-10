/**
 * Quiz screen: one question at a time, with feedback in practice mode and a
 * countdown timer in mock-exam mode. Game rules live in js/session.js; this
 * file only draws and handles clicks and keys.
 */
(function (Exam) {
  "use strict";

  const ui = (Exam.ui = Exam.ui || {});
  const { $, el, clear, button, noFocusOnClick, pad, sortedCopy } = Exam.util;
  const { config, progress } = Exam;
  const engine = Exam.session;

  let session = null; // the running session
  let view = null; // per-question UI state, reset for every question
  let timerId = null;

  /* ---------- timer ---------- */

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function updateTimer() {
    if (!session || !session.deadline || session.finished) return;

    const msLeft = session.deadline - Date.now();
    if (msLeft <= 0) {
      session.timeUp = true;
      finish();
      return;
    }

    const label = $("timer");
    if (label) {
      const seconds = Math.floor(msLeft / 1000);
      label.textContent = `Time left ${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
    }
  }

  /* ---------- building the question card ---------- */

  function buildHeader(q) {
    const header = el("div", "topbar");
    header.append(
      el("span", "tag", q.topic),
      el("span", "muted", `Question ${session.index + 1} of ${session.list.length}`)
    );
    if (session.mode === "mock") {
      const timer = el("span", "timer");
      timer.id = "timer";
      header.appendChild(timer);
    }
    return header;
  }

  function buildProgressBar() {
    const bar = el("div", "bar");
    const fill = el("div", "fill");
    fill.style.width = `${(100 * session.index) / session.list.length}%`;
    bar.appendChild(fill);
    return bar;
  }

  function buildOptions(q) {
    const wrapper = el("div", "opts");
    q.options.forEach((text, i) => {
      const option = el("button", "opt");
      option.type = "button";
      option.append(el("span", "num", String(i + 1)), el("span", "otext", text));
      noFocusOnClick(option);
      option.addEventListener("click", () => pick(i));
      wrapper.appendChild(option);
      view.optionButtons.push(option);
    });
    return wrapper;
  }

  function mainButtonLabel() {
    const last = engine.isLast(session);
    if (session.mode === "mock") return last ? "Lock in and finish" : "Lock in and next";
    return "Submit";
  }

  function buildActions(q) {
    const bar = el("div", "actions");

    const main = button(mainButtonLabel(), "btn primary", onMainAction);
    view.mainButton = main;

    const unsure = button("", "btn small", toggleUnsure);
    view.unsureButton = unsure;
    refreshUnsureButton();

    const flag = button("", "btn small", () => {
      progress.toggleFlag(q.id);
      refreshFlagButton();
    });
    function refreshFlagButton() {
      const on = progress.isFlagged(q.id);
      flag.textContent = on ? "Flagged (click to undo)" : "Flag as wrong";
      flag.className = `btn small${on ? " flagged" : ""}`;
    }
    refreshFlagButton();

    const end = button("End session", "btn small", () => {
      if (window.confirm("End this session and see results?")) finish();
    });

    [main, unsure, flag, end].forEach(noFocusOnClick);
    bar.append(main, unsure, flag, end);
    return bar;
  }

  function renderQuestion() {
    const container = ui.screens.root.quiz;
    clear(container);

    const q = engine.current(session);
    view = {
      selected: [],
      locked: false,
      unsure: false,
      optionButtons: [],
      feedback: null,
      mainButton: null,
      unsureButton: null,
    };

    const card = el("div", "card");
    card.append(buildHeader(q), buildProgressBar());
    if (session.topic !== config.allTopics) card.appendChild(ui.components.notesPanel(q.topic));

    card.append(
      el("p", "qtext", q.q),
      el(
        "p",
        "hint",
        q.type === "multi"
          ? "Select ALL correct answers. All-or-nothing scoring."
          : "Select ONE answer."
      ),
      buildOptions(q)
    );

    view.feedback = el("div", "feedback");
    view.feedback.hidden = true;
    card.append(view.feedback, buildActions(q));

    container.appendChild(card);
    if (session.mode === "mock") updateTimer();
  }

  /* ---------- user actions ---------- */

  function pick(index) {
    if (!session || view.locked) return;

    const q = engine.current(session);
    if (q.type === "single") {
      view.selected = [index];
    } else {
      const at = view.selected.indexOf(index);
      if (at >= 0) view.selected.splice(at, 1);
      else view.selected.push(index);
    }

    view.optionButtons.forEach((node, i) => {
      node.classList.toggle("sel", view.selected.includes(i));
    });
  }

  function refreshUnsureButton() {
    const on = view.unsure;
    view.unsureButton.textContent = on ? "Marked unsure (click to undo)" : "I'm not sure (U)";
    view.unsureButton.className = `btn small${on ? " flagged" : ""}`;
  }

  function toggleUnsure() {
    if (view.locked) return;
    view.unsure = !view.unsure;
    refreshUnsureButton();
  }

  function onMainAction() {
    if (!session || session.finished) return;
    if (view.locked) next();
    else submit();
  }

  function submit() {
    if (!view.selected.length) return;

    const result = engine.answer(session, view.selected, view.unsure);
    view.locked = true;

    // Mock exams give no feedback until the end.
    if (session.mode === "mock") {
      next();
      return;
    }
    showFeedback(result);
  }

  function verdictText(result) {
    if (result.ok) {
      return result.unsure ? "CORRECT (but you were unsure: it will come back)" : "CORRECT";
    }
    return result.unsure ? "WRONG (you were unsure)" : "WRONG";
  }

  function showFeedback(result) {
    const expected = sortedCopy(result.q.answer);

    view.optionButtons.forEach((node, i) => {
      node.classList.remove("sel");
      const isAnswer = expected.includes(i);
      const isChosen = result.chosen.includes(i);
      if (isAnswer && isChosen) node.classList.add("correct");
      else if (isAnswer) node.classList.add("missed");
      else if (isChosen) node.classList.add("wrong");
    });

    const box = view.feedback;
    clear(box);
    box.hidden = false;
    box.className = `feedback ${result.ok ? "ok" : "bad"}`;
    box.append(
      el("p", "verdict", verdictText(result)),
      el("p", null, `Correct answer: ${expected.map((i) => i + 1).join(", ")}`),
      el("p", null, result.q.why),
      el("p", "src", `Source: ${result.q.source}`)
    );

    view.mainButton.textContent = engine.isLast(session) ? "Finish" : "Next";
  }

  function next() {
    if (engine.advance(session)) renderQuestion();
    else finish();
  }

  function finish() {
    if (!session || session.finished) return;

    stopTimer();
    engine.finish(session);

    if (!session.results.length) {
      ui.menu.open();
      return;
    }
    ui.results.render(session);
  }

  /* ---------- keyboard ---------- */

  const TYPING_TAGS = ["BUTTON", "SUMMARY", "SELECT", "INPUT", "TEXTAREA"];

  /** Keyboard shortcuts: 1-9 pick an option, U toggles unsure, Enter submits/continues. */
  function handleKey(event) {
    if (!session || session.finished || ui.screens.root.quiz.hidden) return;
    if (event.target && TYPING_TAGS.includes(event.target.tagName)) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    if (event.key === "Enter") {
      event.preventDefault();
      onMainAction();
    } else if (event.key === "u" || event.key === "U") {
      event.preventDefault();
      toggleUnsure();
    } else if (/^[1-9]$/.test(event.key)) {
      const index = parseInt(event.key, 10) - 1;
      if (index < engine.current(session).options.length) {
        event.preventDefault();
        pick(index);
      }
    }
  }

  /* ---------- public ---------- */

  /** Starts running a session created by Exam.session.create. */
  function start(newSession) {
    stopTimer();
    session = newSession;
    if (session.mode === "mock") timerId = setInterval(updateTimer, 1000);
    ui.screens.show("quiz");
    renderQuestion();
  }

  ui.quiz = { start, handleKey };
})((window.Exam = window.Exam || {}));
