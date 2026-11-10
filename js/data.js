/**
 * Builds the validated question bank once, after all questions/*.js files
 * have loaded, and offers lookups by topic.
 */
(function (Exam) {
  "use strict";

  const questions = Exam.validate.questions(window.QUESTIONS);
  const notes = Exam.validate.notes(window.NOTES);

  const byTopic = {};
  questions.forEach((q) => {
    (byTopic[q.topic] = byTopic[q.topic] || []).push(q);
  });

  const topics = Object.keys(byTopic).sort();

  /** Returns a copy of the questions for a topic (or all questions). */
  function poolFor(topic) {
    return topic === Exam.config.allTopics ? questions.slice() : (byTopic[topic] || []).slice();
  }

  Exam.data = { questions, notes, topics, byTopic, poolFor };
})((window.Exam = window.Exam || {}));
