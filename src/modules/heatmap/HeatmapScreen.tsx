import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { scoreTopics, SELF_RATING, type SelfRatingLevel } from '@/core/scoring';
import { useStore } from '@/core/store';
import { colors, heatColor, heatTextColor, spacing } from '@/core/theme';
import { Button } from '@/core/ui';
import { reasons } from './reasons';

const RATING_LABELS = ['Chưa biết', 'Lơ mơ', 'Nắm chắc'];

export default function HeatmapScreen() {
  const router = useRouter();
  const analysis = useStore((s) => s.analysis);
  const mastery = useStore((s) => s.mastery);
  const rateTopic = useStore((s) => s.rateTopic);

  if (!analysis) return <Text style={styles.empty}>Chưa có dữ liệu phân tích.</Text>;

  const topics = scoreTopics(analysis.topics, mastery).sort((a, b) => b.heat - a.heat);

  return (
    <View style={styles.container}>
      <FlatList
        data={topics}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.course}>{analysis.course}</Text>}
        renderItem={({ item }) => {
          const textColor = heatTextColor(item.heat);
          return (
            <Pressable
              style={[styles.card, { backgroundColor: heatColor(item.heat) }]}
              onPress={() => router.push({ pathname: '/topic/[id]', params: { id: item.id } })}>
              <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>
              <Text style={{ color: textColor }}>
                {item.chapter} · {reasons(item).join(' · ')}
              </Text>
              <View style={styles.ratings}>
                {RATING_LABELS.map((label, level) => (
                  <Pressable
                    key={label}
                    style={[styles.chip, item.mastery === SELF_RATING[level] && styles.chipActive]}
                    onPress={() => rateTopic(item.id, level as SelfRatingLevel)}>
                    <Text style={styles.chipText}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            </Pressable>
          );
        }}
      />
      <View style={styles.footer}>
        <Button label="Xem lộ trình" onPress={() => router.push('/plan')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  empty: { padding: spacing.md, color: colors.muted },
  list: { padding: spacing.md, gap: spacing.sm },
  course: { fontSize: 16, color: colors.muted, marginBottom: spacing.sm },
  card: { padding: spacing.md, borderRadius: 12, gap: spacing.xs },
  title: { fontSize: 17, fontWeight: '700' },
  ratings: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: { backgroundColor: '#FFFFFF', borderColor: colors.text },
  chipText: { color: colors.text, fontSize: 13 },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});
