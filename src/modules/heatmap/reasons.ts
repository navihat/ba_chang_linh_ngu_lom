import type { Topic } from '@shared/types';

const BLOOM = ['', 'nhớ', 'hiểu', 'vận dụng', 'phân tích', 'đánh giá', 'sáng tạo'];

// Lý do một chủ đề quan trọng, dựng từ tín hiệu để người dùng kiểm tra được
export function reasons(topic: Topic): string[] {
  const s = topic.signals;
  const list = [`${s.hours} tiết`, s.cloIds.join(', '), `mức ${BLOOM[s.bloom] ?? s.bloom}`];
  if (s.pastExamHits > 0) list.unshift(`${s.pastExamHits} câu trong đề cũ`);
  return list;
}
