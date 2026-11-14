import { postJson } from '@/core/api';
import type { Question, QuizRequest, QuizResponse, Topic } from '@shared/types';

export async function fetchQuiz(topic: Topic): Promise<Question[]> {
  const body: QuizRequest = { topic };
  const { questions } = await postJson<QuizResponse>('/quiz', body);
  return questions;
}
