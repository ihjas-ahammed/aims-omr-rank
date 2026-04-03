export interface Topic {
  name: string;
  questions: number[];
}

export interface Chapter {
  name: string;
  topics: Topic[];
  questions: number[];
}

export function parseTopicMapping(mappingText: string): Chapter[] {
  const chapters: Chapter[] = [];
  let currentChapter: Chapter | null = null;

  const lines = mappingText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('###')) {
      // New chapter
      const chapterName = trimmed.replace(/^###\s*/, '').replace(/\*\*/g, '').trim();
      currentChapter = { name: chapterName, topics: [], questions: [] };
      chapters.push(currentChapter);
    } else if (trimmed.startsWith('*') && currentChapter) {
      // New topic
      // Example: *   **Magnetic Force on a Charge:** Q1, Q2
      const topicMatch = trimmed.match(/\*\s*\*\*(.*?):\*\*\s*(.*)/);
      if (topicMatch) {
        const topicName = topicMatch[1].trim();
        const questionsStr = topicMatch[2].trim();
        
        // Parse Q1, Q2, Q10 into [1, 2, 10]
        const questions = questionsStr.split(',')
          .map(q => q.trim().toUpperCase().replace('Q', ''))
          .map(q => parseInt(q, 10))
          .filter(q => !isNaN(q));

        currentChapter.topics.push({ name: topicName, questions });
        currentChapter.questions.push(...questions);
      }
    }
  }

  return chapters;
}
