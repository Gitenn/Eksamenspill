/**
 * Checks question and notes data loaded from the questions/*.js files.
 * Bad items are skipped and reported in the red banner instead of crashing.
 */
(function (Exam) {
  "use strict";

  const { isNonEmptyString } = Exam.util;

  function checkOptions(q) {
    if (!Array.isArray(q.options) || q.options.length < 2) {
      return ["options must be an array of 2 or more"];
    }
    const badIndex = q.options.findIndex((option) => !isNonEmptyString(option));
    return badIndex >= 0 ? [`option ${badIndex + 1} is not a non-empty string`] : [];
  }

  function checkAnswer(q) {
    if (!Array.isArray(q.answer) || q.answer.length < 1) {
      return ["answer must be a non-empty array"];
    }

    const problems = [];
    const optionCount = Array.isArray(q.options) ? q.options.length : Infinity;
    const seen = new Set();

    for (const index of q.answer) {
      if (!Number.isInteger(index) || index < 0 || index >= optionCount) {
        problems.push(`answer index out of range: ${index}`);
        break;
      }
      if (seen.has(index)) {
        problems.push(`duplicate answer index ${index}`);
        break;
      }
      seen.add(index);
    }

    if (q.type === "single" && q.answer.length !== 1) {
      problems.push("single needs exactly 1 answer");
    }
    if (q.type === "multi" && q.answer.length < 2) {
      problems.push("multi needs 2 or more answers");
    }
    return problems;
  }

  /** Returns a list of problems for one question (empty list = valid). */
  function findProblems(q) {
    const problems = [];

    if (!isNonEmptyString(q.id)) problems.push("missing id");
    if (!isNonEmptyString(q.topic)) problems.push("missing topic");
    if (q.type !== "single" && q.type !== "multi") {
      problems.push("type must be single or multi");
    }
    if (!isNonEmptyString(q.q)) problems.push("missing q");

    problems.push(...checkOptions(q), ...checkAnswer(q));

    if (!isNonEmptyString(q.why)) problems.push("missing why");
    if (!isNonEmptyString(q.source)) problems.push("missing source");
    return problems;
  }

  /** Validates window.QUESTIONS and returns only the valid questions. */
  function questions(raw) {
    if (!Array.isArray(raw)) return [];

    const valid = [];
    const seenIds = new Set();

    raw.forEach((q, i) => {
      const label = `Question #${i + 1}${q && q.id ? ` (${q.id})` : ""}`;

      if (!q || typeof q !== "object") {
        Exam.errors.add(`${label}: not an object`);
        return;
      }

      const problems = findProblems(q);
      if (isNonEmptyString(q.id) && seenIds.has(q.id)) problems.push("duplicate id");

      if (problems.length) {
        Exam.errors.add(`${label}: ${problems.join("; ")}`);
      } else {
        seenIds.add(q.id);
        valid.push(q);
      }
    });

    return valid;
  }

  /** Validates window.NOTES and returns only the valid topic blocks. */
  function notes(raw) {
    const valid = {};
    if (raw === undefined) return valid;

    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      Exam.errors.add("NOTES is not an object");
      return valid;
    }

    Object.keys(raw).forEach((topic) => {
      const lines = raw[topic];
      const ok =
        Array.isArray(lines) && lines.length > 0 && lines.every(isNonEmptyString);
      if (ok) {
        valid[topic] = lines;
      } else {
        Exam.errors.add(
          `Notes block "${topic}": must be a non-empty array of non-empty strings`
        );
      }
    });

    return valid;
  }

  Exam.validate = { questions, notes };
})((window.Exam = window.Exam || {}));
