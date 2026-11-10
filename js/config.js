/**
 * Central settings. Change numbers here instead of hunting through the code.
 */
(function (Exam) {
  "use strict";

  Exam.config = Object.freeze({
    /** localStorage key. Kept unchanged so existing progress carries over. */
    storageKey: "dave3625_quiz_v1",

    /** Value used for "all topics" in the topic drop-down. */
    allTopics: "__all",

    /** Practice session length choices as [value, label]. */
    sessionLengths: [
      ["10", "10"],
      ["20", "20"],
      ["40", "40"],
      ["all", "All in pool"],
    ],
    defaultSessionLength: "20",

    mock: { questions: 40, minutes: 120 },

    /**
     * Leitner-style boxes: a question starts in box 1 and moves up when
     * answered confidently and correctly. Lower boxes are asked more often.
     */
    leitner: {
      maxBox: 5,
      /** Questions in this box or lower that were ever wrong count as weak spots. */
      weakBoxMax: 3,
      /** Sampling weight per box (index = box number; index 0 is unused). */
      weights: [0, 8, 4, 2, 1, 0.5],
      /** Sampling weight for questions never answered before. */
      unseenWeight: 3,
    },

    grading: {
      pointsTotal: 80,
      /** Highest band first. The last band is the catch-all. */
      bands: [
        { min: 90, grade: "A" },
        { min: 80, grade: "B" },
        { min: 60, grade: "C" },
        { min: 50, grade: "D" },
        { min: 40, grade: "E" },
        { min: 0, grade: "F" },
      ],
    },
  });
})((window.Exam = window.Exam || {}));
