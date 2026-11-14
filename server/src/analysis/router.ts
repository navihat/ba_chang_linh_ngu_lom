import { Router, type Request } from 'express';
import multer from 'multer';

import { getModel, getOpenAI } from '../openai';
import type { Analysis, Topic } from '../../../shared/types';

type UploadedFile = {
  fieldname: string;
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

const MAX_TOTAL_BYTES = 50 * 1024 * 1024;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_TOTAL_BYTES, files: 20 } });

export const analysisRouter = Router();

const analysisSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['course', 'clos', 'topics'],
  properties: {
    course: { type: 'string' },
    clos: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'text'],
        properties: {
          id: { type: 'string' },
          text: { type: 'string' },
        },
      },
    },
    topics: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'title', 'chapter', 'summary', 'signals', 'estMinutes'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          chapter: { type: 'string' },
          summary: { type: 'string' },
          signals: {
            type: 'object',
            additionalProperties: false,
            required: ['hours', 'cloIds', 'bloom', 'pastExamHits', 'slidePages'],
            properties: {
              hours: { type: 'number' },
              cloIds: { type: 'array', items: { type: 'string' } },
              bloom: { type: 'number', minimum: 1, maximum: 6 },
              pastExamHits: { type: 'number', minimum: 0 },
              slidePages: { type: 'array', items: { type: 'number' } },
            },
          },
          estMinutes: { type: 'number', minimum: 5 },
        },
      },
    },
  },
} as const;

function getFiles(req: Request): Record<'syllabus' | 'slides' | 'exams', UploadedFile[]> {
  const files = req.files as Record<string, UploadedFile[]> | undefined;
  return {
    syllabus: files?.syllabus ?? [],
    slides: files?.slides ?? [],
    exams: files?.exams ?? [],
  };
}

function validateFiles(files: Record<'syllabus' | 'slides' | 'exams', UploadedFile[]>): string | null {
  if (files.syllabus.length !== 1) return 'Cần đúng 1 file đề cương PDF.';
  if (files.slides.length < 1) return 'Cần ít nhất 1 file slide PDF.';

  const all = [...files.syllabus, ...files.slides, ...files.exams];
  const nonPdf = all.find((f) => f.mimetype !== 'application/pdf' && !f.originalname.toLowerCase().endsWith('.pdf'));
  if (nonPdf) return `File ${nonPdf.originalname} không phải PDF.`;

  const totalBytes = all.reduce((sum, f) => sum + f.size, 0);
  if (totalBytes > MAX_TOTAL_BYTES) return 'Tổng dung lượng PDF vượt 50 MB. Hãy chia slide theo chương.';

  return null;
}

function toInputParts(kind: string, file: UploadedFile, index: number) {
  return [
    { type: 'input_text', text: `Tài liệu ${kind} ${index + 1}: ${file.originalname}` },
    {
      type: 'input_file',
      filename: file.originalname,
      file_data: `data:application/pdf;base64,${file.buffer.toString('base64')}`,
      detail: 'low',
    },
  ];
}

function normalizeAnalysis(analysis: Analysis): Analysis {
  return {
    course: analysis.course.trim(),
    clos: analysis.clos.map((clo) => ({ id: clo.id.trim(), text: clo.text.trim() })),
    topics: analysis.topics.map((topic, index) => normalizeTopic(topic, index)),
  };
}

function normalizeTopic(topic: Topic, index: number): Topic {
  return {
    id: topic.id?.trim() || `t${index + 1}`,
    title: topic.title.trim(),
    chapter: topic.chapter.trim(),
    summary: topic.summary.trim(),
    signals: {
      hours: clampNumber(topic.signals.hours, 0, 200),
      cloIds: topic.signals.cloIds.map((id) => id.trim()).filter(Boolean),
      bloom: Math.round(clampNumber(topic.signals.bloom, 1, 6)),
      pastExamHits: Math.round(clampNumber(topic.signals.pastExamHits, 0, 200)),
      slidePages: topic.signals.slidePages.map((page) => Math.round(page)).filter((page) => page > 0),
    },
    estMinutes: Math.max(5, Math.round(topic.estMinutes)),
  };
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

async function analyzeWithOpenAI(files: Record<'syllabus' | 'slides' | 'exams', UploadedFile[]>): Promise<Analysis> {
  const client = getOpenAI();
  const model = getModel();
  const response = await client.responses.create({
    model,
    input: [
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: [
              'Bạn là trợ lý phân tích tài liệu học phần cho app Chú Tủng.',
              'Hãy đọc các PDF: đề cương, slide và đề thi cũ nếu có.',
              'Trả về JSON đúng schema Analysis. Không thêm markdown, không giải thích ngoài JSON.',
              'Chỉ trích tín hiệu từ tài liệu, không tự chấm điểm quan trọng, độ nóng hay mức nắm.',
              'course: tên học phần ngắn gọn.',
              'clos: chuẩn đầu ra trong đề cương, giữ id dạng CLO1, CLO2 nếu tài liệu có.',
              'topics: nhóm kiến thức để sinh viên ôn thi, ưu tiên chủ đề có trong slide hoặc đề thi cũ.',
              'summary: 2-5 dòng tiếng Việt, mỗi ý một dòng, đủ để sinh câu hỏi nhanh.',
              'signals.hours: số tiết hoặc thời lượng trong đề cương; nếu không rõ, ước lượng tương đối theo độ dài tài liệu.',
              'signals.cloIds: các CLO liên quan trực tiếp.',
              'signals.bloom: mức Bloom cao nhất của CLO liên quan, từ 1 nhớ đến 6 sáng tạo.',
              'signals.pastExamHits: số lần/chủ điểm xuất hiện trong đề thi cũ; không có đề cũ thì để 0.',
              'signals.slidePages: số trang slide liên quan.',
              'estMinutes: số phút ôn ước tính cho sinh viên trước kỳ thi, tối thiểu 5.',
              'Đặt id chủ đề ổn định dạng t1, t2, t3 theo thứ tự học hợp lý.',
            ].join('\n'),
          },
          ...files.syllabus.flatMap((file, index) => toInputParts('đề cương', file, index)),
          ...files.slides.flatMap((file, index) => toInputParts('slide', file, index)),
          ...files.exams.flatMap((file, index) => toInputParts('đề thi cũ', file, index)),
        ],
      },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'analysis',
        strict: true,
        schema: analysisSchema,
      },
    },
  } as any);

  const text = response.output_text;
  if (!text) throw new Error('OpenAI không trả về nội dung phân tích.');
  return normalizeAnalysis(JSON.parse(text) as Analysis);
}

// multipart: syllabus (1 PDF), slides (nhiều PDF), exams (nhiều PDF, tùy chọn)
analysisRouter.post(
  '/analyze',
  upload.fields([{ name: 'syllabus', maxCount: 1 }, { name: 'slides' }, { name: 'exams' }]),
  async (req, res) => {
    try {
      const files = getFiles(req);
      const fileError = validateFiles(files);
      if (fileError) {
        res.status(400).json({ error: fileError });
        return;
      }

      const analysis = await analyzeWithOpenAI(files);
      res.json(analysis);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Không phân tích được tài liệu.' });
    }
  },
);
