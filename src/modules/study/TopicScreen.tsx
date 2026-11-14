import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useStore } from '@/core/store';
import { colors, spacing } from '@/core/theme';
import { fetchQuiz } from './api';

export default function TopicScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const topic = useStore((s) => s.analysis?.topics.find((t) => t.id === id));
  const questions = useStore((s) => s.questions[id]);
  const mastery = useStore((s) => s.mastery[id] ?? 0);
  const setQuestions = useStore((s) => s.setQuestions);
  const recordAnswer = useStore((s) => s.recordAnswer);

  const [picked, setPicked] = useState<Record<string, number>>({}); // questionId → lựa chọn
  const [error, setError] = useState('');

  // Câu hỏi đã tải thì lấy từ store, chưa có mới gọi server
  useEffect(() => {
    if (!topic || questions) return;
    fetchQuiz(topic)
      .then((qs) => setQuestions(topic.id, qs))
      .catch((e) => setError(String(e)));
  }, [topic, questions, setQuestions]);

  if (!topic) return <Text style={styles.muted}>Không tìm thấy chủ đề.</Text>;

  function choose(questionId: string, choice: number, answerIndex: number) {
    if (picked[questionId] !== undefined) return;
    setPicked((p) => ({ ...p, [questionId]: choice }));
    recordAnswer(id, choice === answerIndex);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{topic.title}</Text>
      <Text style={styles.muted}>
        {topic.chapter} · Mức nắm: {Math.round(mastery * 100)}%
      </Text>

      <Text style={styles.heading}>Tóm tắt</Text>
      {topic.summary.split('\n').map((line) => (
        <Text key={line} style={styles.text}>
          • {line}
        </Text>
      ))}

      <Text style={styles.heading}>Câu hỏi nhanh</Text>
      {error ? <Text style={{ color: colors.wrong }}>{error}</Text> : null}
      {!questions && !error ? <ActivityIndicator color={colors.primary} /> : null}
      {questions?.map((q) => {
        const answered = picked[q.id] !== undefined;
        return (
          <View key={q.id} style={styles.question}>
            <Text style={styles.text}>{q.prompt}</Text>
            {q.choices.map((choice, i) => (
              <Pressable
                key={choice}
                style={[
                  styles.choice,
                  answered && i === q.answerIndex && styles.correct,
                  answered && i === picked[q.id] && i !== q.answerIndex && styles.wrong,
                ]}
                onPress={() => choose(q.id, i, q.answerIndex)}>
                <Text style={styles.text}>{choice}</Text>
              </Pressable>
            ))}
            {answered ? <Text style={styles.muted}>{q.explanation}</Text> : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.sm, backgroundColor: colors.background, flexGrow: 1 },
  title: { fontSize: 22, fontWeight: '700', color: colors.text },
  heading: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  text: { fontSize: 16, color: colors.text },
  muted: { color: colors.muted },
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
