// Công thức tính điểm. VÙNG ĐÓNG BĂNG: báo cả nhóm trước khi sửa.
import type { ScoredTopic, Topic } from '@shared/types';

// Trọng số độ quan trọng (ước lượng ban đầu, chỉnh sau khi xem dữ liệu thật)
export const WEIGHTS = { pastExam: 0.4, hours: 0.3, bloom: 0.2, clo: 0.1 };

// Mức nắm ban đầu theo tự đánh giá: chưa biết / lơ mơ / nắm chắc
export const SELF_RATING = [0, 0.4, 0.8] as const;
export type SelfRatingLevel = 0 | 1 | 2;

// Mức nắm sau một câu hỏi
export function updateMastery(current: number, correct: boolean): number {
  return 0.7 * current + 0.3 * (correct ? 1 : 0);
}

export function scoreTopics(topics: Topic[], mastery: Record<string, number>): ScoredTopic[] {
  const max = (pick: (t: Topic) => number) => Math.max(1, ...topics.map(pick));
  const maxExam = max((t) => t.signals.pastExamHits);
  const maxHours = max((t) => t.signals.hours);
  const maxClo = max((t) => t.signals.cloIds.length);

  return topics.map((t) => {
    const s = t.signals;
    const importance =
      WEIGHTS.pastExam * (s.pastExamHits / maxExam) +
      WEIGHTS.hours * (s.hours / maxHours) +
      WEIGHTS.bloom * (s.bloom / 6) +
      WEIGHTS.clo * (s.cloIds.length / maxClo);
    const m = mastery[t.id] ?? 0;
    return { ...t, importance, mastery: m, heat: importance * (1 - m) };
  });
}
