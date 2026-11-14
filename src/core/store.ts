// Trạng thái dùng chung của app, lưu trên máy. VÙNG ĐÓNG BĂNG: báo cả nhóm trước khi sửa.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Analysis, Goal, Question } from '@shared/types';
import { SELF_RATING, type SelfRatingLevel, updateMastery } from './scoring';

type State = {
  analysis: Analysis | null;
  goal: Goal;
  mastery: Record<string, number>; // topicId → 0–1
  questions: Record<string, Question[]>; // topicId → câu hỏi đã tải
  setAnalysis: (analysis: Analysis) => void; // xóa mastery và questions cũ
  setGoal: (goal: Goal) => void;
  rateTopic: (topicId: string, level: SelfRatingLevel) => void;
  recordAnswer: (topicId: string, correct: boolean) => void;
  setQuestions: (topicId: string, questions: Question[]) => void;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      analysis: null,
      goal: { targetGrade: 5, hoursLeft: 3 },
      mastery: {},
      questions: {},
      setAnalysis: (analysis) => set({ analysis, mastery: {}, questions: {} }),
      setGoal: (goal) => set({ goal }),
      rateTopic: (topicId, level) =>
        set((s) => ({ mastery: { ...s.mastery, [topicId]: SELF_RATING[level] } })),
      recordAnswer: (topicId, correct) =>
        set((s) => ({
          mastery: { ...s.mastery, [topicId]: updateMastery(s.mastery[topicId] ?? 0, correct) },
        })),
      setQuestions: (topicId, questions) =>
        set((s) => ({ questions: { ...s.questions, [topicId]: questions } })),
    }),
    { name: 'chu-tung', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
