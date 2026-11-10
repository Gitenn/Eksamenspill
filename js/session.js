/**
 * Quiz session logic: choosing questions, recording answers, finishing.
 * Contains no DOM code, so it can be read and tested on its own.
 *
 * A session looks like:
 *   { mode, options, topic, list, index, results, deadline, timeUp, finished }
 * where mode is "practice", "weak" or "mock".
 */
(function (Exam) {
  "use strict";

  const { config, data, progress, scoring } = Exam;
  const { shuffle } = Exam.util;

  /** Picks `count` questions at random, favouring heavier-weighted ones. */
  function weightedSample(pool, count) {
    const remaining = pool.slice();
    const picked = [];

    while (picked.length < count && remaining.length) {
      const total = remaining.reduce((sum, q) => sum + progress.weightOf(q), 0);
      let roll = Math.random() * total;
      let index = 0;
      for (; index < remaining.length - 1; index++) {
        roll -= progress.weightOf(remaining[index]);
        if (roll <= 0) break;
      }
      picked.push(remaining.splice(index, 1)[0]);
    }
    return picked;
  }

  /** Returns { list } or { error } for the requested mode and menu options. */
  function buildList(mode, options) {
    if (mode === "mock") {
      const count = Math.min(config.mock.questions, data.questions.length);
      return { list: shuffle(data.questions).slice(0, count) };
    }

    let pool = data.poolFor(options.topic);
    if (mode === "weak") pool = pool.filter((q) => progress.isWeak(q));

    if (!pool.length) {
      return {
        error:
          mode === "weak"
            ? "No weak spots yet in this pool. Answer some questions wrong, or mark them unsure, first."
            : "No questions in this pool.",
      };
    }

    const wanted =
      options.length === "all"
        ? pool.length
        : parseInt(options.length, 10) || parseInt(config.defaultSessionLength, 10);

    return { list: weightedSample(pool, Math.min(wanted, pool.length)) };
  }

  /**
   * Starts a session.
   * @param {"practice"|"weak"|"mock"} mode
   * @param {{topic: string, length: string}} options menu choices
   * @returns {{session?: object, error?: string}}
   */
  function create(mode, options) {
    const built = buildList(mode, options);
    if (built.error) return { error: built.error };

    const isMock = mode === "mock";
    return {
      session: {
        mode,
        options,
        topic: isMock ? config.allTopics : options.topic,
        list: built.list,
        index: 0,
        results: [],
        deadline: isMock ? Date.now() + config.mock.minutes * 60000 : 0,
        timeUp: false,
        finished: false,
      },
    };
  }

  const current = (session) => session.list[session.index];
  const isLast = (session) => session.index === session.list.length - 1;

  /** Grades the selection for the current question and saves progress. */
  function answer(session, selected, unsure) {
    const q = current(session);
    const chosen = [...selected].sort((a, b) => a - b);
    const ok = scoring.sameSelection(q.answer, chosen);
    const result = { q, chosen, ok, unsure: Boolean(unsure) };

    session.results.push(result);
    progress.record(q, { ok, unsure: result.unsure });
    return result;
  }

  /** Moves to the next question. Returns false when there are no more. */
  function advance(session) {
    session.index++;
    return session.index < session.list.length;
  }

  /** Ends the session. In a mock exam, unanswered questions count as wrong. */
  function finish(session) {
    if (session.finished) return;
    session.finished = true;

    if (session.mode === "mock") {
      for (let i = session.results.length; i < session.list.length; i++) {
        session.results.push({ q: session.list[i], chosen: [], ok: false, unsure: false });
      }
    }
  }

  Exam.session = { create, current, isLast, answer, advance, finish };
})((window.Exam = window.Exam || {}));
