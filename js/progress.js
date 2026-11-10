/**
 * Saved progress: which questions were seen, right, wrong, flagged or marked
 * unsure, and which Leitner box each question is in. Persisted in
 * localStorage; every storage call is guarded so the quiz still works when
 * storage is blocked (private mode, some file:// setups).
 */
(function (Exam) {
  "use strict";

  const { storageKey, leitner } = Exam.config;

  function fresh() {
    return { box: {}, seen: {}, right: {}, wrong: {}, flagged: {}, unsure: {} };
  }

  function load() {
    let saved = null;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) saved = JSON.parse(raw);
    } catch (error) {
      saved = null;
    }
    if (!saved || typeof saved !== "object") saved = fresh();

    // Fill in any section missing from older saves (e.g. "unsure").
    const defaults = fresh();
    Object.keys(defaults).forEach((key) => {
      if (!saved[key] || typeof saved[key] !== "object") saved[key] = defaults[key];
    });
    return saved;
  }

  let state = load();

  function save() {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      /* storage unavailable: progress simply is not remembered */
    }
  }

  /* ---------- queries ---------- */

  const isFlagged = (id) => Boolean(state.flagged[id]);
  const isUnsure = (id) => Boolean(state.unsure[id]);
  const flaggedIds = () => Object.keys(state.flagged);

  /** A weak spot is anything marked unsure, or once wrong and still in a low box. */
  function isWeak(q) {
    if (isUnsure(q.id)) return true;
    const everWrong = (state.wrong[q.id] || 0) > 0;
    return everWrong && (state.box[q.id] || 1) <= leitner.weakBoxMax;
  }

  /** How likely a question is to be picked: unseen and low-box questions first. */
  function weightOf(q) {
    const box = state.box[q.id];
    return box ? leitner.weights[box] : leitner.unseenWeight;
  }

  /** Summary numbers for a list of questions, shown on the menu. */
  function poolStats(pool) {
    let seen = 0;
    let right = 0;
    let wrong = 0;
    let unsure = 0;

    pool.forEach((q) => {
      if (state.seen[q.id]) seen++;
      if (state.unsure[q.id]) unsure++;
      right += state.right[q.id] || 0;
      wrong += state.wrong[q.id] || 0;
    });

    const attempts = right + wrong;
    const accuracy = attempts ? `${Math.round((100 * right) / attempts)}%` : "n/a";
    return { seen, unsure, accuracy };
  }

  /* ---------- changes ---------- */

  /**
   * Records one answer.
   * A lucky guess must not count as learned: an unsure answer drops the
   * question back to box 1 and keeps it in the weak-spot pool, even if right.
   */
  function record(q, { ok, unsure }) {
    const id = q.id;
    const box = state.box[id] || 1;

    state.box[id] = ok && !unsure ? Math.min(leitner.maxBox, box + 1) : 1;

    if (unsure) state.unsure[id] = true;
    else if (ok) delete state.unsure[id];

    state.seen[id] = (state.seen[id] || 0) + 1;
    const tally = ok ? state.right : state.wrong;
    tally[id] = (tally[id] || 0) + 1;

    save();
  }

  function toggleFlag(id) {
    if (state.flagged[id]) delete state.flagged[id];
    else state.flagged[id] = true;
    save();
  }

  function clearFlags() {
    state.flagged = {};
    save();
  }

  function clearUnsure() {
    state.unsure = {};
    save();
  }

  function reset() {
    state = fresh();
    save();
  }

  Exam.progress = {
    isFlagged,
    isUnsure,
    flaggedIds,
    isWeak,
    weightOf,
    poolStats,
    record,
    toggleFlag,
    clearFlags,
    clearUnsure,
    reset,
  };
})((window.Exam = window.Exam || {}));
