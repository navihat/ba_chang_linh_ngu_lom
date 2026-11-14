import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { scoreTopics } from '@/core/scoring';
import { useStore } from '@/core/store';
import { colors, heatColor, spacing } from '@/core/theme';
import { Button } from '@/core/ui';
import sample from '@shared/sample/csdl.json';
import type { Analysis } from '@shared/types';
import { ACCEPTED_TYPES, analyzeDocuments, type DocKind, type PickedFiles } from './api';
import { loadCourses, removeCourse, saveCourse, type SavedCourse } from './library';

const SLOTS: Record<DocKind, { title: string; hint: string }> = {
  syllabus: { title: 'Đề cương học phần', hint: 'Bắt buộc, 1 file có CLO' },
  slides: { title: 'Slide bài giảng', hint: 'Bắt buộc, chọn được nhiều file' },
  exams: { title: 'Đề thi cũ', hint: 'Không bắt buộc, có thì heatmap chuẩn hơn' },
};

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
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Hôm nay ôn môn nào?</Text>

      {courses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>Môn đã lưu</Text>
          {courses.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => open(c.analysis)}
              style={({ pressed }) => [styles.course, pressed && styles.pressed]}>
              <View style={styles.courseHead}>
                <Text style={styles.courseName} numberOfLines={2}>
                  {c.analysis.course}
                </Text>
                <Pressable onPress={() => remove(c.id)} hitSlop={12}>
                  <Text style={styles.remove}>Xóa</Text>
                </Pressable>
              </View>
              <HeatStrip analysis={c.analysis} />
              <Text style={styles.meta}>
                {c.analysis.topics.length} chủ đề, lưu ngày {formatDate(c.savedAt)}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.heading}>Mục tiêu</Text>
        <View style={styles.row}>
          <View style={styles.goal}>
            <TextInput style={styles.goalValue} keyboardType="numeric" value={grade} onChangeText={setGrade} />
            <Text style={styles.label}>điểm muốn đạt (thang 10)</Text>
          </View>
          <View style={styles.goal}>
            <TextInput style={styles.goalValue} keyboardType="numeric" value={hours} onChangeText={setHours} />
            <Text style={styles.label}>giờ còn lại để ôn</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Thêm môn mới</Text>
        <Text style={styles.label}>Nhận PDF, Word, PowerPoint, TXT, MD và ảnh chụp (JPG, PNG, WEBP).</Text>
        {(Object.keys(SLOTS) as DocKind[]).map((kind) => {
          const picked = files[kind];
          return (
            <Pressable
              key={kind}
              onPress={() => pick(kind)}
              style={({ pressed }) => [styles.slot, picked.length > 0 && styles.slotFilled, pressed && styles.pressed]}>
              <Text style={styles.slotTitle}>{SLOTS[kind].title}</Text>
              <Text style={picked.length ? styles.fileNames : styles.label} numberOfLines={3}>
                {picked.length ? picked.map((f) => f.name).join('\n') : `${SLOTS[kind].hint}. Chạm để chọn file.`}
              </Text>
            </Pressable>
          );
        })}

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.label}>Đang đọc tài liệu, thường mất khoảng một phút...</Text>
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

      <Button label="Dùng môn mẫu: Cơ sở dữ liệu" variant="secondary" onPress={() => open(sample)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, paddingBottom: spacing.lg * 2, gap: spacing.lg, backgroundColor: colors.background, flexGrow: 1 },
  title: { fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: -0.5, marginTop: spacing.sm },
  section: { gap: spacing.sm },
  heading: { fontSize: 18, fontWeight: '700', color: colors.text },
  label: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  row: { flexDirection: 'row', gap: spacing.md },
  goal: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: spacing.md },
  goalValue: { fontSize: 40, fontWeight: '800', color: colors.primary, padding: 0 },
  course: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
  },
  courseHead: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  courseName: { flex: 1, fontSize: 17, fontWeight: '700', color: colors.text },
  remove: { color: colors.muted, fontSize: 14 },
  strip: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', gap: 2 },
  stripCell: { flex: 1 },
  meta: { color: colors.muted, fontSize: 13 },
  slot: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.xs,
  },
  slotFilled: { borderStyle: 'solid', borderColor: colors.text },
  slotTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  fileNames: { color: colors.text, fontSize: 14, lineHeight: 20 },
  pressed: { opacity: 0.6 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  error: { color: colors.wrong },
});
