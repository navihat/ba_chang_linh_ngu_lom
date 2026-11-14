import type { ScoredTopic } from '@shared/types';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { scoreTopics, SELF_RATING, type SelfRatingLevel } from '@/core/scoring';
import { useStore } from '@/core/store';
import { colors, heatColor, heatTextColor, spacing } from '@/core/theme';
import { Button } from '@/core/ui';
import { reasons } from './reasons';

const RATING_LABELS = ['Chưa biết', 'Lơ mơ', 'Nắm chắc'];
const LEGEND = [0.1, 0.3, 0.5, 0.7, 0.9];

// Bản đồ nhiệt: mỗi chương một hàng, ô rộng theo độ quan trọng, màu theo độ nóng.
// Giữ thứ tự gốc để khi tự đánh giá chỉ đổi màu, ô không nhảy chỗ.
function HeatGrid({ topics, onOpen }: { topics: ScoredTopic[]; onOpen: (id: string) => void }) {
  const chapters = [...new Set(topics.map((t) => t.chapter))];
  return (
    <View style={styles.grid}>
      {chapters.map((chapter) => (
        <View key={chapter} style={styles.gridRow}>
          <Text style={styles.gridChapter} numberOfLines={2}>
            {chapter}
          </Text>
          {topics
            .filter((t) => t.chapter === chapter)
            .map((t) => (
              <Pressable
                key={t.id}
                style={[styles.tile, { flex: Math.max(0.2, t.importance), backgroundColor: heatColor(t.heat) }]}
                onPress={() => onOpen(t.id)}>
                <Text style={[styles.tileText, { color: heatTextColor(t.heat) }]} numberOfLines={3}>
                  {t.title}
                </Text>
              </Pressable>
            ))}
        </View>
      ))}
    </View>
  );
}

export default function HeatmapScreen() {
  const router = useRouter();
  const analysis = useStore((s) => s.analysis);
  const mastery = useStore((s) => s.mastery);
  const rateTopic = useStore((s) => s.rateTopic);

  if (!analysis) return <Text style={styles.empty}>Chưa có dữ liệu phân tích.</Text>;

  const scored = scoreTopics(analysis.topics, mastery);
  const topics = [...scored].sort((a, b) => b.heat - a.heat);
  const openTopic = (id: string) => router.push({ pathname: '/topic/[id]', params: { id } });

  return (
    <View style={styles.container}>
      <FlatList
        data={topics}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.course}>{analysis.course}</Text>
            <Text style={styles.hint}>
              Ô càng rộng càng quan trọng, càng đỏ càng cần ôn. Chạm vào ô để ôn chủ đề đó.
            </Text>
            <View style={styles.legend}>
              <Text style={styles.hint}>Nguội</Text>
              {LEGEND.map((h) => (
                <View key={h} style={[styles.swatch, { backgroundColor: heatColor(h) }]} />
              ))}
              <Text style={styles.hint}>Nóng</Text>
            </View>
            <HeatGrid topics={scored} onOpen={openTopic} />
            <Text style={styles.section}>Tự đánh giá, chủ đề nóng nhất ở trên cùng</Text>
          </View>
        }
        renderItem={({ item }) => {
          const textColor = heatTextColor(item.heat);
          return (
            <Pressable
              style={[styles.card, { backgroundColor: heatColor(item.heat) }]}
              onPress={() => openTopic(item.id)}>
              <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>
              <Text style={{ color: textColor }}>
                {item.chapter} · {reasons(item).join(' · ')}
              </Text>
              <Text style={{ color: textColor }}>Đã nắm {Math.round(item.mastery * 100)}%</Text>
              <View style={styles.ratings}>
                {RATING_LABELS.map((label, level) => (
                  <Pressable
                    key={label}
                    style={[
                      styles.chip,
                      mastery[item.id] === SELF_RATING[level] && styles.chipActive,
                    ]}
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
  header: { gap: spacing.sm, marginBottom: spacing.sm },
  course: { fontSize: 16, color: colors.muted },
  hint: { fontSize: 13, color: colors.muted },
  legend: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  swatch: { width: 24, height: 12, borderRadius: 3 },
  grid: { gap: spacing.xs, marginTop: spacing.xs },
  gridRow: { flexDirection: 'row', alignItems: 'stretch', gap: spacing.xs },
  gridChapter: { width: 64, fontSize: 11, color: colors.muted, alignSelf: 'center' },
  tile: { minHeight: 56, borderRadius: 6, padding: spacing.xs, justifyContent: 'center' },
  tileText: { fontSize: 11, fontWeight: '600' },
  section: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: spacing.md },
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
