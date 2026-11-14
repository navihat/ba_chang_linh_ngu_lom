import { Router } from 'express';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

import type { Question, QuizRequest, QuizResponse, Topic } from '../../../shared/types';
import { getModel, getOpenAI } from '../openai';

export const quizRouter = Router();

// Mô tả mức Bloom để model đặt câu hỏi đúng tầng tư duy
const BLOOM = [
  'Nhớ: nhắc lại định nghĩa, thuật ngữ, sự kiện',
  'Hiểu: giải thích, phân biệt, nhận ra ví dụ đúng',
  'Vận dụng: áp dụng khái niệm vào một tình huống hoặc bài tập cụ thể',
  'Phân tích: so sánh, tìm lỗi, chỉ ra quan hệ giữa các thành phần',
  'Đánh giá: chọn phương án tốt nhất và nêu lý do',
  'Sáng tạo: chọn thiết kế hoặc lời giải phù hợp nhất cho một yêu cầu mới',
];

const QuizSchema = z.object({
  questions: z.array(
    z.object({
      prompt: z.string(),
      choices: z.array(z.string()),
      answerIndex: z.number(),
      explanation: z.string(),
    }),
  ),
});

quizRouter.post('/quiz', async (req, res) => {
  const { topic, count = 10 } = req.body as QuizRequest;
  if (!topic?.id) {
    res.status(400).json({ error: 'Thiếu topic' });
    return;
  }
  const n = Math.min(10, Math.max(1, count));

  try {
    const questions = process.env.OPENAI_API_KEY ? await generate(topic, n) : mock(topic, n);
    const response: QuizResponse = { questions };
    res.json(response);
  } catch (e) {
    console.error('/quiz lỗi:', e);
    res.status(502).json({ error: 'Không sinh được câu hỏi' });
  }
});

async function generate(topic: Topic, n: number): Promise<Question[]> {
  const bloom = Math.min(6, Math.max(1, Math.round(topic.signals.bloom)));
  const response = await getOpenAI().responses.parse({
    model: getModel(),
    instructions:
      'Bạn là giảng viên đại học ra câu hỏi trắc nghiệm ôn thi bằng tiếng Việt. ' +
      'Chỉ dùng kiến thức trong phần tóm tắt chủ đề. Mỗi câu có đúng 4 lựa chọn, một đáp án đúng, ' +
      'các phương án sai phải hợp lý, không dùng "tất cả các ý trên". ' +
      'Lời giải thích ngắn, nói vì sao đáp án đúng. Không dùng công thức LaTeX.',
    input:
      `Chương: ${topic.chapter}\nChủ đề: ${topic.title}\nTóm tắt:\n${topic.summary}\n\n` +
      `Viết ${n} câu hỏi ở mức Bloom ${bloom} (${BLOOM[bloom - 1]}).`,
    text: { format: zodTextFormat(QuizSchema, 'quiz') },
    reasoning: { effort: 'low' }, // câu trắc nghiệm từ tóm tắt không cần suy luận sâu, giữ chi phí thấp
  });

  const parsed = response.output_parsed;
  if (!parsed) throw new Error('Model không trả về JSON');

  return parsed.questions
    .filter((q) => q.choices.length >= 2 && Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < q.choices.length)
    .slice(0, n)
    .map((q, i) => ({ id: `${topic.id}-q${Date.now()}-${i}`, topicId: topic.id, ...shuffle(q) }));
}

// Model hay đặt đáp án đúng ở vị trí đầu, nên xáo lại trong code
function shuffle(q: { prompt: string; choices: string[]; answerIndex: number; explanation: string }) {
  const order = q.choices.map((_, i) => i).sort(() => Math.random() - 0.5);
  return {
    prompt: q.prompt,
    choices: order.map((i) => q.choices[i]),
    answerIndex: order.indexOf(q.answerIndex),
    explanation: q.explanation,
  };
}

// Dữ liệu giả khi chưa có OPENAI_API_KEY, để thử giao diện
function mock(topic: Topic, n: number): Question[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `${topic.id}-q${Date.now()}-${i}`,
    topicId: topic.id,
    prompt: `[Câu hỏi giả ${i + 1}] Nội dung nào thuộc chủ đề "${topic.title}"?`,
    choices: [topic.summary.split('\n')[0], 'Một nội dung không liên quan', 'Một nội dung khác'],
    answerIndex: 0,
    explanation: 'Đây là câu hỏi giả vì server chưa có OPENAI_API_KEY.',
  }));
}
