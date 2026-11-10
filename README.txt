DAVE3625 Exam Lab

An exam study game for the Introduction to AI course.
A vibecoding project to make studying engaging and fun.

HOW TO RUN
  Keep the whole folder together and double-click quiz.html (works offline).

FOLDER LAYOUT
  quiz.html            page shell: markup and script tags only
  css/styles.css       all styling
  questions/           question banks, one file per topic area
  js/                  application code (see below)
  js/ui/               everything that draws on screen

CODE MAP (js/)
  errors.js            red error banner (loads first)
  config.js            settings: mock exam size/time, grade bands, box weights
  util.js              small shared helpers
  validation.js        checks question and notes data
  data.js              builds the validated question bank
  progress.js          saved progress in localStorage (seen, wrong, unsure, flags)
  scoring.js           grades and formatting (no screen code)
  session.js           picking questions, recording answers (no screen code)
  ui/screens.js        switching between menu, quiz and results
  ui/components.js     shared pieces, such as the "Read first" notes panel
  ui/menu.js           menu screen
  ui/quiz.js           question screen, timer, keyboard shortcuts
  ui/results.js        results screen
  app.js               starts everything (loads last)

  Plain script files are used on purpose instead of ES modules, because
  browsers block modules when a page is opened by double-clicking (file://).

ADDING QUESTIONS
  1. Edit or create a file in questions/. Expected names:
     questions_00_sample, 01_evaluation, 02_mlbasics, 03_data, 04_regclust,
     05_mlyearning, 06_genai, 07_buildmodel, 08_aiindex, 09_labs,
     10_prompting, 11_history (.js)
  2. Use double-quoted strings only, no line breaks inside strings, no trailing
     commas. "answer" is an array of option indexes starting at 0.
  3. A new file name needs one matching <script> line in quiz.html.
  4. A red banner at the top of quiz.html lists any malformed question or a
     file with a syntax error.

USING THE QUIZ
  Keys: 1-9 pick an option, U toggles "I'm not sure", Enter submits / continues.
  "I'm not sure": mark a question before submitting if you are guessing. Even if
  the guess is right, it goes back to the start of the repeat cycle and shows up
  in "Weak spots only" until you answer it confidently and correctly.
  "Flag as wrong": use it on a bad answer key and send me the ids from the
  results screen.
  Delete questions/questions_00_sample.js once the real files exist.
