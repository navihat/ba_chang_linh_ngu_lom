import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useStore } from '@/core/store';
import { colors, spacing } from '@/core/theme';
import { Button } from '@/core/ui';
import { fetchQuiz } from './api';

const BLOOM_LABELS = ['Nhớ', 'Hiểu', 'Vận dụng', 'Phân tích', 'Đánh giá', 'Sáng tạo'];

export default function TopicScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const topic = useStore((s) => s.analysis?.topics.find((t) => t.id === id));
  const questions = useStore((s) => s.questions[id]);
  const mastery = useStore((s) => s.mastery[id] ?? 0);
  const setQuestions = useStore((s) => s.setQuestions);
  const recordAnswer = useStore((s) => s.recordAnswer);

  const [picked, setPicked] = useState<Record<string, number>>({}); // questionId → lựa chọn
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    if (!topic) return;
    setLoading(true);
    setError('');
    fetchQuiz(topic)
      .then((qs) => {
        setPicked({});
        setQuestions(topic.id, qs);
      })
      .catch(() => setError('Không tải được câu hỏi. Kiểm tra kết nối tới server rồi thử lại.'))
      .finally(() => setLoading(false));
  }, [topic, setQuestions]);

  // Câu hỏi đã tải thì lấy từ store, chưa có mới gọi server
  useEffect(() => {
    if (!questions) load();
    // Chỉ tải tự động một lần khi mở chủ đề
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!topic) return <Text style={styles.muted}>Không tìm thấy chủ đề.</Text>;

  function choose(questionId: string, choice: number, answerIndex: number) {
    if (picked[questionId] !== undefined) return;
    setPicked((p) => ({ ...p, [questionId]: choice }));
    recordAnswer(id, choice === answerIndex);
  }

  const answered = questions?.filter((q) => picked[q.id] !== undefined) ?? [];
  const correct = answered.filter((q) => picked[q.id] === q.answerIndex).length;
  const done = !!questions?.length && answered.length === questions.length;
  const bloom = BLOOM_LABELS[Math.min(6, Math.max(1, topic.signals.bloom)) - 1];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{topic.title}</Text>
      <Text style={styles.muted}>
        {topic.chapter} · Mức Bloom: {bloom} · Mức nắm: {Math.round(mastery * 100)}%
      </Text>

      <Text style={styles.heading}>Tóm tắt</Text>
      {topic.summary.split('\n').map((line, i) => (
        <Text key={i} style={styles.text}>
          • {line}
        </Text>
      ))}

      <Text style={styles.heading}>Câu hỏi nhanh</Text>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? (
        <>
          <Text style={{ color: colors.wrong }}>{error}</Text>
          <Button label="Thử lại" variant="secondary" onPress={load} />
        </>
      ) : null}
      {!loading &&
        questions?.map((q, n) => {
          const isAnswered = picked[q.id] !== undefined;
          return (
            <View key={q.id} style={styles.question}>
              <Text style={styles.text}>
                {n + 1}. {q.prompt}
              </Text>
              {q.choices.map((choice, i) => (
                <Pressable
                  key={i}
                  style={[
                    styles.choice,
                    isAnswered && i === q.answerIndex && styles.correct,
                    isAnswered && i === picked[q.id] && i !== q.answerIndex && styles.wrong,
                  ]}
                  onPress={() => choose(q.id, i, q.answerIndex)}>
                  <Text style={styles.text}>{choice}</Text>
                </Pressable>
              ))}
              {isAnswered ? <Text style={styles.muted}>{q.explanation}</Text> : null}
            </View>
          );
        })}

      {done && !loading ? (
        <>
          <Text style={styles.result}>
            Đúng {correct}/{questions.length} câu. Mức nắm hiện tại: {Math.round(mastery * 100)}%
          </Text>
          <Button label="Câu hỏi khác" variant="secondary" onPress={load} />
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.sm, backgroundColor: colors.background, flexGrow: 1 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  heading: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  text: { fontSize: 16, color: colors.text },
  muted: { color: colors.muted },
  result: { fontSize: 16, fontWeight: '600', color: colors.text },
  question: { gap: spacing.sm, marginBottom: spacing.md },
  choice: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  correct: { borderColor: colors.correct, backgroundColor: '#E3F1E7' },
  wrong: { borderColor: colors.wrong, backgroundColor: '#FBE4E2' },
});
