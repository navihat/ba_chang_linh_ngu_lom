import { Router } from 'express';

import type { Question, QuizRequest, QuizResponse } from '../../../shared/types';

export const quizRouter = Router();

quizRouter.post('/quiz', (req, res) => {
  const { topic, count = 3 } = req.body as QuizRequest;

  // TODO(C): sinh câu hỏi bằng OpenAI theo mức Bloom của chủ đề (topic.signals.bloom).
  const questions: Question[] = Array.from({ length: count }, (_, i) => ({
    id: `${topic.id}-q${i + 1}`,
    topicId: topic.id,
    prompt: `[Câu hỏi giả ${i + 1}] Nội dung nào thuộc chủ đề "${topic.title}"?`,
    choices: [topic.summary.split('\n')[0], 'Một nội dung không liên quan', 'Một nội dung khác'],
    answerIndex: 0,
    explanation: 'Đây là câu hỏi giả để thử giao diện.',
  }));

  const response: QuizResponse = { questions };
  res.json(response);
});
