import type { DocumentPickerAsset } from 'expo-document-picker';

import { API_URL } from '@/core/api';
import type { Analysis } from '@shared/types';

// Tên field multipart gửi lên POST /analyze
export const DOC_KINDS = ['syllabus', 'slides', 'exams'] as const;
export type DocKind = (typeof DOC_KINDS)[number];
export type PickedFiles = Record<DocKind, DocumentPickerAsset[]>;

// Loại file server nhận (khớp MIME_BY_EXT trong server/src/analysis/router.ts)
export const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/markdown',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export async function analyzeDocuments(files: PickedFiles): Promise<Analysis> {
  const form = new FormData();
  for (const kind of DOC_KINDS) {
    for (const f of files[kind]) {
      // Web có sẵn File; trên điện thoại React Native nhận { uri, name, type }
      const part = f.file ?? { uri: f.uri, name: f.name, type: f.mimeType ?? 'application/octet-stream' };
      form.append(kind, part as any);
    }
  }
  const res = await fetch(`${API_URL}/analyze`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`/analyze lỗi ${res.status}`);
  return res.json();
}
