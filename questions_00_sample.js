window.QUESTIONS = (window.QUESTIONS || []).concat([
  { id: "sample-001", topic: "Model evaluation", type: "single", q: "A model answers healthy for every one of 1000 patients, of whom 950 are healthy. What are its accuracy and its recall for the sick class?", options: ["Accuracy 95%, recall 0%", "Accuracy 95%, recall 95%", "Accuracy 5%, recall 0%", "Accuracy 50%, recall 50%"], answer: [0], why: "Accuracy = 950/1000 = 95%. It finds 0 of the 50 sick patients, so recall = 0/50 = 0%.", source: "ModelEvaluation slides 7 and 27" },
  { id: "sample-002", topic: "Model evaluation", type: "single", q: "Of 100 patients, 10 are really sick. A model says sick for 20 patients, and 8 of those are really sick. What is its precision?", options: ["80%", "40%", "20%", "8%"], answer: [1], why: "Precision = TP / (TP + FP) = 8 / 20 = 40%. The 80% figure is recall (8 of 10 sick found).", source: "ModelEvaluation slides 24, 27 and 28" },
  { id: "sample-003", topic: "Model evaluation", type: "multi", q: "Which statements about the three data sets are correct?", options: ["Dev set (Ng) and validation set (scikit-learn) are the same thing", "The test set is used again and again to choose between algorithms", "The dev set is used for decisions such as algorithm, settings and features", "The training set is opened only once, at the end"], answer: [0, 2], why: "Dev = validation and it drives decisions. The test set is opened once at the end, and the model learns from the training set constantly.", source: "ModelEvaluation slide 10" },
  { id: "sample-004", topic: "Model evaluation", type: "single", q: "A model scores 100% on the training set and 70% on the test set. What is this called?", options: ["Overfitting (high variance)", "Underfitting (high bias)", "A good model", "Regularisation"], answer: [0], why: "Very good on training data and clearly worse on new data means the model memorised the training data: overfitting, also called high variance.", source: "ModelEvaluation slides 35, 37 and 46-47" },
  { id: "sample-005", topic: "Build an AI model", type: "single", q: "Which of these does NOT change the weights of the model?", options: ["Pretraining", "Instruction tuning", "RAG", "LoRA fine-tuning"], answer: [2], why: "RAG retrieves documents and places them in the prompt at inference time. Pretraining, instruction tuning and LoRA all train weights.", source: "How to Build an AI model slides 35 and 38" }
]);

window.NOTES = Object.assign(window.NOTES || {}, {
  "Model evaluation": [
    "Four questions for any model: measured on what, measured how, why is it wrong, what do I fix next.",
    "Training set: the model learns from it. Dev (validation) set: you choose algorithm, settings and features with it. Test set: final honest estimate, opened once.",
    "Dev set (Ng) and validation set (scikit-learn, most textbooks) are the same thing.",
    "Accuracy can mislead on imbalanced data: always predicting healthy gives 95% when 950 of 1000 are healthy, yet finds nobody sick.",
    "Recall = TP / (TP + FN): of the real positives, how many did the model find.",
    "Precision = TP / (TP + FP): of the alarms the model raised, how many were real.",
    "F1 is high only when both precision and recall are high: precision 100% with recall 20% gives F1 of about 33%.",
    "Training 100% and test 70% is overfitting (high variance). Poor on both is underfitting (high bias).",
    "Error analysis: look at about 100 misclassified dev examples and count the error categories before choosing what to fix.",
    "Dev and test sets must look like the future data you expect, and come from the same source."
  ]
});
