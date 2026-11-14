import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { scoreTopics } from '@/core/scoring';
import { useStore } from '@/core/store';
import { colors, heatColor, spacing } from '@/core/theme';
import { buildPlan } from './plan';

export default function PlanScreen() {
  const router = useRouter();
  const analysis = useStore((s) => s.analysis);
  const mastery = useStore((s) => s.mastery);
  const goal = useStore((s) => s.goal);

  if (!analysis) return <Text style={styles.empty}>Chưa có dữ liệu phân tích.</Text>;

  const plan = buildPlan(scoreTopics(analysis.topics, mastery), goal);
  const firstOverBudget = plan.items.findIndex((i) => !i.inBudget);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.list}
      data={plan.items}
      keyExtractor={(i) => i.topic.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.goal}>
            Mục tiêu {goal.targetGrade} điểm · còn {plan.budgetMinutes} phút
          </Text>
          <Text style={{ color: plan.reachable ? colors.correct : colors.wrong }}>
            {plan.reachable
              ? 'Đủ thời gian cho các phần cần học để đạt mục tiêu.'
              : 'Không đủ thời gian cho mọi phần cần học. Hãy học theo thứ tự dưới đây.'}
          </Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <View>
          {index === firstOverBudget ? <Text style={styles.cut}>Hết quỹ thời gian</Text> : null}
          <Pressable
            style={[styles.card, !item.inBudget && styles.dimmed]}
            onPress={() => router.push({ pathname: '/topic/[id]', params: { id: item.topic.id } })}>
            <View style={[styles.dot, { backgroundColor: heatColor(item.topic.heat) }]} />
            <View style={styles.body}>
              <Text style={styles.title}>
                {index + 1}. {item.topic.title}
              </Text>
              <Text style={styles.meta}>
                {item.topic.estMinutes} phút · xong ở phút {item.endMinute} ·{' '}
                {item.neededForTarget ? 'cần cho mục tiêu' : 'học thêm để lên điểm'}
              </Text>
            </View>
          </Pressable>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  empty: { padding: spacing.md, color: colors.muted },
  list: { padding: spacing.md, gap: spacing.sm },
  header: { gap: spacing.xs, marginBottom: spacing.sm },
  goal: { fontSize: 18, fontWeight: '700', color: colors.text },
  cut: {
    textAlign: 'center',
    color: colors.wrong,
    fontWeight: '700',
    paddingVertical: spacing.sm,
    borderTopWidth: 2,
    borderTopColor: colors.wrong,
    marginBottom: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  dimmed: { opacity: 0.5 },
  dot: { width: 16, height: 16, borderRadius: 8 },
  body: { flex: 1, gap: spacing.xs },
  title: { fontSize: 16, fontWeight: '600', color: colors.text },
  meta: { color: colors.muted, fontSize: 13 },
});
