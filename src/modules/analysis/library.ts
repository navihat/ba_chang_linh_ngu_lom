// Kho môn đã phân tích, lưu trên máy để lần sau mở lại không cần tải tài liệu lên.
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Analysis } from '@shared/types';

const KEY = 'chu-tung-library';

export type SavedCourse = { id: string; savedAt: number; analysis: Analysis };

export async function loadCourses(): Promise<SavedCourse[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedCourse[]) : [];
  } catch {
    return [];
  }
}

async function write(courses: SavedCourse[]): Promise<SavedCourse[]> {
  await AsyncStorage.setItem(KEY, JSON.stringify(courses));
  return courses;
}

// Môn trùng tên thì ghi đè bản cũ; môn mới nhất đứng đầu
export async function saveCourse(analysis: Analysis): Promise<SavedCourse[]> {
  const rest = (await loadCourses()).filter((c) => c.analysis.course !== analysis.course);
  return write([{ id: String(Date.now()), savedAt: Date.now(), analysis }, ...rest]);
}

export async function removeCourse(id: string): Promise<SavedCourse[]> {
  return write((await loadCourses()).filter((c) => c.id !== id));
}
