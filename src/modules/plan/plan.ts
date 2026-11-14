import type { Goal, ScoredTopic } from '@shared/types';

export type PlanItem = {
  topic: ScoredTopic;
  endMinute: number; // tổng số phút tính đến hết chủ đề này
  inBudget: boolean; // còn nằm trong quỹ thời gian
  neededForTarget: boolean; // phải học để đạt điểm mục tiêu
};

export type Plan = {
  items: PlanItem[];
  budgetMinutes: number;
  reachable: boolean; // mọi chủ đề cần cho mục tiêu đều nằm trong quỹ thời gian
};

// Phần dư an toàn cộng thêm vào tỉ lệ điểm mục tiêu (ước lượng ban đầu)
const TARGET_MARGIN = 0.1;

// Tham lam: ưu tiên chủ đề có độ nóng trên mỗi phút cao nhất.
export function buildPlan(topics: ScoredTopic[], goal: Goal): Plan {
  const budgetMinutes = goal.hoursLeft * 60;
  const total = topics.reduce((sum, t) => sum + t.importance, 0) || 1;
  const target = Math.min(1, goal.targetGrade / 10 + TARGET_MARGIN);

  // Phần kiến thức (theo độ quan trọng) coi như đã nắm
  let coverage = topics.reduce((sum, t) => sum + t.importance * t.mastery, 0) / total;
  let minutes = 0;

  const items = [...topics]
    .sort((a, b) => b.heat / b.estMinutes - a.heat / a.estMinutes)
    .map((topic) => {
      const neededForTarget = coverage < target;
      minutes += topic.estMinutes;
      coverage += topic.heat / total;
      return { topic, endMinute: minutes, inBudget: minutes <= budgetMinutes, neededForTarget };
    });

  return {
    items,
    budgetMinutes,
    reachable: items.every((i) => !i.neededForTarget || i.inBudget),
  };
}
