/**
 * Pure helpers for grading and formatting results (no DOM, no storage).
 */
(function (Exam) {
  "use strict";

  const { grading } = Exam.config;

  /** Maps a percentage to a letter grade. */
  function gradeOf(percent) {
    const band = grading.bands.find((b) => percent >= b.min);
    return band ? band.grade : grading.bands[grading.bands.length - 1].grade;
  }

  /** Converts a percentage to the points scale used by the exam. */
  function estimatedPoints(percent) {
    return (percent * grading.pointsTotal) / 100;
  }

  /** Human-readable legend, e.g. "A 90+, B 80+, ..., F below 40." */
  function bandsLegend() {
    const bands = grading.bands;
    const named = bands.slice(0, -1);
    const last = bands[bands.length - 1];
    const parts = named.map((b) => `${b.grade} ${b.min}+`).join(", ");
    return `Grade bands by percent: ${parts}, ${last.grade} below ${named[named.length - 1].min}.`;
  }

  /** True when two lists of option indexes contain the same values (any order). */
  function sameSelection(a, b) {
    const x = [...a].sort((m, n) => m - n);
    const y = [...b].sort((m, n) => m - n);
    return x.length === y.length && x.every((value, i) => value === y[i]);
  }

  /** Describes chosen option indexes as "1. text | 3. text". */
  function formatOptions(q, indexes) {
    if (!indexes.length) return "(not answered)";
    return indexes.map((i) => `${i + 1}. ${q.options[i]}`).join(" | ");
  }

  /** Per-topic right/total counts, sorted by topic name. */
  function topicBreakdown(results) {
    const per = {};
    results.forEach((r) => {
      const entry = (per[r.q.topic] = per[r.q.topic] || { right: 0, total: 0 });
      entry.total++;
      if (r.ok) entry.right++;
    });
    return Object.keys(per)
      .sort()
      .map((topic) => ({ topic, right: per[topic].right, total: per[topic].total }));
  }

  Exam.scoring = {
    gradeOf,
    estimatedPoints,
    bandsLegend,
    sameSelection,
    formatOptions,
    topicBreakdown,
  };
})((window.Exam = window.Exam || {}));
