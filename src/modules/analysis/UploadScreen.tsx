import * as DocumentPicker from 'expo-document-picker';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { scoreTopics } from '@/core/scoring';
import { useStore } from '@/core/store';
import { colors, heatColor, spacing } from '@/core/theme';
import { Button } from '@/core/ui';
import sample from '@shared/sample/csdl.json';
import type { Analysis } from '@shared/types';
import { ACCEPTED_TYPES, analyzeDocuments, type DocKind, type PickedFiles } from './api';
import { brand } from './brand';
import { loadCourses, removeCourse, saveCourse, type SavedCourse } from './library';

const SLOTS: Record<DocKind, { title: string; hint: string }> = {
  syllabus: { title: 'Đề cương học phần', hint: 'Bắt buộc, 1 file có CLO' },
  slides: { title: 'Slide bài giảng', hint: 'Bắt buộc, chọn được nhiều file' },
  exams: { title: 'Đề thi cũ', hint: 'Không bắt buộc, có thì heatmap chuẩn hơn' },
};

const GRID = 14; // cỡ một ô ly
const GRID_ROWS = 24;

// Nền vở ô ly kẻ bằng mực trắng mờ, mỗi 4 ô một dòng đậm
function NotebookGrid() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: GRID_ROWS }, (_, i) => (
        <View
          key={i}
          style={[
            styles.gridRow,
            { top: (i + 1) * GRID, backgroundColor: i % 4 === 3 ? brand.gridLineStrong : brand.gridLine },
          ]}
        />
      ))}
      <View style={styles.margin} />
    </View>
  );
}

// Dải màu theo độ quan trọng của từng chủ đề, nóng nhất bên trái
function HeatStrip({ analysis }: { analysis: Analysis }) {
  const scored = scoreTopics(analysis.topics, {}).sort((a, b) => b.importance - a.importance);
  return (
    <View style={styles.strip}>
      {scored.map((t) => (
        <View key={t.id} style={[styles.stripCell, { backgroundColor: heatColor(t.importance) }]} />
      ))}
    </View>
  );
}

function formatDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default function UploadScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const goal = useStore((s) => s.goal);
  const setGoal = useStore((s) => s.setGoal);
  const setAnalysis = useStore((s) => s.setAnalysis);

  const [grade, setGrade] = useState(String(goal.targetGrade));
  const [hours, setHours] = useState(String(goal.hoursLeft));
  const [files, setFiles] = useState<PickedFiles>({ syllabus: [], slides: [], exams: [] });
  const [courses, setCourses] = useState<SavedCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCourses().then(setCourses);
  }, []);

  async function pick(kind: DocKind) {
    const result = await DocumentPicker.getDocumentAsync({
      type: ACCEPTED_TYPES,
      multiple: kind !== 'syllabus',
    });
    if (!result.canceled) setFiles((f) => ({ ...f, [kind]: result.assets }));
  }

  function open(analysis: Analysis) {
    setGoal({ targetGrade: Number(grade) || 5, hoursLeft: Number(hours) || 3 });
    setAnalysis(analysis);
    router.push('/heatmap');
  }

  async function analyze() {
    setLoading(true);
    setError('');
    try {
      const analysis = await analyzeDocuments(files);
      setCourses(await saveCourse(analysis));
      setFiles({ syllabus: [], slides: [], exams: [] });
      open(analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    setCourses(await removeCourse(id));
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}>
        <NotebookGrid />
        <Text style={styles.wordmark}>Chú Tủng</Text>
        <Text style={styles.headline}>Hôm nay ôn môn nào?</Text>
        <View style={styles.sentence}>
          <Text style={styles.sentenceText}>Mình cần</Text>
          <TextInput
            style={styles.goalInput}
            keyboardType="numeric"
            value={grade}
            onChangeText={setGrade}
            maxLength={4}
            selectTextOnFocus
          />
          <Text style={styles.sentenceText}>điểm, còn</Text>
          <TextInput
            style={styles.goalInput}
            keyboardType="numeric"
            value={hours}
            onChangeText={setHours}
            maxLength={3}
            selectTextOnFocus
          />
          <Text style={styles.sentenceText}>giờ để ôn.</Text>
        </View>
      </View>

      <View style={styles.body}>
        {courses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.heading}>Môn đã lưu</Text>
            {courses.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => open(c.analysis)}
                style={({ pressed }) => [styles.course, pressed && styles.pressed]}>
                <HeatStrip analysis={c.analysis} />
                <View style={styles.courseBody}>
                  <View style={styles.courseHead}>
                    <Text style={styles.courseName} numberOfLines={2}>
                      {c.analysis.course}
                    </Text>
                    <Pressable onPress={() => remove(c.id)} hitSlop={12}>
                      <Text style={styles.remove}>Xóa</Text>
                    </Pressable>
                  </View>
                  <Text style={styles.meta}>
                    {c.analysis.topics.length} chủ đề, lưu ngày {formatDate(c.savedAt)}. Chạm để mở heatmap.
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.heading}>Thêm môn mới</Text>
          <Text style={styles.label}>Nhận PDF, Word, PowerPoint, TXT, MD và ảnh chụp (JPG, PNG, WEBP).</Text>
          {(Object.keys(SLOTS) as DocKind[]).map((kind) => {
            const picked = files[kind];
            const filled = picked.length > 0;
            return (
              <Pressable
                key={kind}
                onPress={() => pick(kind)}
                style={({ pressed }) => [styles.slot, filled && styles.slotFilled, pressed && styles.pressed]}>
                <View style={styles.slotHead}>
                  <Text style={styles.slotTitle}>{SLOTS[kind].title}</Text>
                  <Text style={styles.slotAction}>{filled ? 'Đổi file' : 'Chọn file'}</Text>
                </View>
                <Text style={filled ? styles.fileNames : styles.label} numberOfLines={3}>
                  {filled ? picked.map((f) => f.name).join('\n') : SLOTS[kind].hint}
                </Text>
              </Pressable>
            );
          })}

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={brand.ink} />
              <Text style={styles.label}>Chú đang đọc tài liệu, thường mất khoảng một phút...</Text>
            </View>
          ) : (
            <Button
              label="Phân tích và lưu môn"
              onPress={analyze}
              disabled={!files.syllabus.length || !files.slides.length}
            />
          )}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <Pressable
          onPress={() => open(sample)}
          style={({ pressed }) => [styles.sample, pressed && styles.pressed]}>
          <Text style={styles.sampleTitle}>Chưa có tài liệu? Thử môn mẫu</Text>
          <Text style={styles.label}>Cơ sở dữ liệu, đã phân tích sẵn</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: brand.paper },
  container: { flexGrow: 1, paddingBottom: spacing.lg * 2 },

  hero: {
    backgroundColor: brand.ink,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg * 1.5,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    gap: spacing.sm,
  },
  gridRow: { position: 'absolute', left: 0, right: 0, height: 1 },
  margin: { position: 'absolute', top: 0, bottom: 0, left: 18, width: 1.5, backgroundColor: 'rgba(255,120,120,0.35)' },
  wordmark: { color: brand.chalk, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  headline: { color: '#FFFFFF', fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -0.8 },
  sentence: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 6, rowGap: 4, marginTop: spacing.sm },
  sentenceText: { color: 'rgba(255,255,255,0.88)', fontSize: 18 },
  goalInput: {
    width: 56,
    flexGrow: 0,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: brand.chalk,
    color: brand.inkDeep,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },

  body: { padding: spacing.md, paddingTop: spacing.lg, gap: spacing.lg },
  section: { gap: spacing.sm },
  heading: { fontSize: 20, fontWeight: '800', color: brand.inkDeep, letterSpacing: -0.3 },
  label: { color: brand.muted, fontSize: 14, lineHeight: 20 },

  course: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: brand.line,
  },
  strip: { flexDirection: 'row', height: 8, gap: 2 },
  stripCell: { flex: 1 },
  courseBody: { padding: spacing.md, gap: spacing.xs },
  courseHead: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  courseName: { flex: 1, fontSize: 18, fontWeight: '700', color: brand.text },
  remove: { color: brand.muted, fontSize: 14 },
  meta: { color: brand.muted, fontSize: 13 },

  slot: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.ink,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.xs,
    backgroundColor: '#FFFFFF',
  },
  slotFilled: { borderStyle: 'solid', backgroundColor: brand.inkSoft },
  slotHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  slotTitle: { fontSize: 16, fontWeight: '700', color: brand.text },
  slotAction: { fontSize: 14, fontWeight: '700', color: brand.ink },
  fileNames: { color: brand.inkDeep, fontSize: 14, lineHeight: 20 },

  sample: {
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: '#FFF4CC',
    borderWidth: 1,
    borderColor: brand.chalk,
    gap: 2,
  },
  sampleTitle: { fontSize: 16, fontWeight: '700', color: brand.text },

  pressed: { opacity: 0.6 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  error: { color: colors.wrong },
});
