export function gradeAnswers(
  studentAnswers: Record<string, string>,
  answerKeyText: string,
  numQuestions: number
) {
  let right = 0;
  let wrong = 0;
  const scores: Record<string, number> = {};
  
  let answerKey: Record<string, string> = {};
  try {
    answerKey = JSON.parse(answerKeyText);
  } catch (e) {
    console.error("Invalid Answer Key JSON. Grading will default to 0 marks unless wildcard '*' is used.");
  }

  for (let q = 1; q <= numQuestions; q++) {
    const qStr = q.toString();
    const qKeyFull = `q${q}`;
    
    // Support either "1": "A" or "q1": "A" in the answer key
    const correctAns = answerKey[qStr] || answerKey[qKeyFull];
    const studentAns = studentAnswers[qStr];

    if (correctAns === '*') {
      // Wildcard rule: Award mark to everyone
      scores[qKeyFull] = 1;
      right++;
    } else if (studentAns && studentAns.trim() !== '') {
      if (correctAns && studentAns.trim().toUpperCase() === correctAns.trim().toUpperCase()) {
        scores[qKeyFull] = 1;
        right++;
      } else {
        scores[qKeyFull] = -1;
        wrong++;
      }
    } else {
      scores[qKeyFull] = 0; // Unanswered
    }
  }

  return { right, wrong, scores };
}