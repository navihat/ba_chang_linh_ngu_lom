import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useStore } from '@/core/store';
import { colors, spacing } from '@/core/theme';
import { Button } from '@/core/ui';
import sample from '@shared/sample/csdl.json';
import type { Analysis } from '@shared/types';
import { ACCEPTED_TYPES, analyzeDocuments, type DocKind, type PickedFiles } from './api';

const KIND_LABELS: Record<DocKind, string> = {
  syllabus: 'Đề cương học phần',
  slides: 'Slide bài giảng',
  exams: 'Đề thi cũ (tùy chọn)',
};

export default function UploadScreen() {
  const router = useRouter();
  const goal = useStore((s) => s.goal);
  const setGoal = useStore((s) => s.setGoal);
  const setAnalysis = useStore((s) => s.setAnalysis);

  const [grade, setGrade] = useState(String(goal.targetGrade));
  const [hours, setHours] = useState(String(goal.hoursLeft));
  const [files, setFiles] = useState<PickedFiles>({ syllabus: [], slides: [], exams: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      open(await analyzeDocuments(files));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Mục tiêu</Text>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Điểm mục tiêu (thang 10)</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={grade} onChangeText={setGrade} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Số giờ còn lại</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={hours} onChangeText={setHours} />
        </View>
      </View>

      <Text style={styles.heading}>Tài liệu</Text>
      <Text style={styles.label}>Nhận PDF, Word, PowerPoint, TXT, MD và ảnh chụp (JPG, PNG, WEBP).</Text>
      {(Object.keys(KIND_LABELS) as DocKind[]).map((kind) => (
        <View key={kind} style={styles.doc}>
          <Text style={styles.label}>
            {KIND_LABELS[kind]}: {files[kind].length ? files[kind].map((f) => f.name).join(', ') : 'chưa chọn'}
          </Text>
          <Button label="Chọn file" variant="secondary" onPress={() => pick(kind)} />
        </View>
      ))}

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <Button
          label="Phân tích tài liệu"
          onPress={analyze}
          disabled={!files.syllabus.length || !files.slides.length}
        />
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button label="Dùng môn mẫu: Cơ sở dữ liệu" variant="secondary" onPress={() => open(sample)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md, gap: spacing.md, backgroundColor: colors.background, flexGrow: 1 },
  heading: { fontSize: 20, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', gap: spacing.md },
  field: { flex: 1, gap: spacing.xs },
  label: { color: colors.muted, fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 18,
    color: colors.text,
  },
  doc: { gap: spacing.sm },
  error: { color: colors.wrong },
});
