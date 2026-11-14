import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { scoreTopics } from '@/core/scoring';
import { useStore } from '@/core/store';
import { colors, heatColor, spacing } from '@/core/theme';
import { buildPlan } from './plan';

// 150 → "2 giờ 30 phút"
function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = Math.round(total % 60);
  if (h === 0) return `${m} phút`;
  return m === 0 ? `${h} giờ` : `${h} giờ ${m} phút`;
}

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
            Mục tiêu {goal.targetGrade} điểm · còn {formatMinutes(plan.budgetMinutes)}
          </Text>
          <Text style={styles.meta}>
            Cần khoảng {formatMinutes(plan.neededMinutes)} cho các chủ đề cần để đạt mục tiêu.
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
                {item.topic.estMinutes} phút · xong sau {formatMinutes(item.endMinute)}
              </Text>
              <Text style={item.neededForTarget ? styles.needed : styles.meta}>
                {item.neededForTarget ? 'Cần cho mục tiêu' : 'Học thêm để lên điểm'}
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
  needed: { color: colors.primary, fontSize: 13, fontWeight: '700' },
});
