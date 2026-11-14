import { Router } from 'express';
import multer from 'multer';

import sample from '../../../shared/sample/csdl.json' with { type: 'json' };
import type { Analysis } from '../../../shared/types';

const upload = multer({ storage: multer.memoryStorage() });

export const analysisRouter = Router();

// multipart: syllabus (1 PDF), slides (nhiều PDF), exams (nhiều PDF, tùy chọn)
analysisRouter.post(
  '/analyze',
  upload.fields([{ name: 'syllabus', maxCount: 1 }, { name: 'slides' }, { name: 'exams' }]),
  (_req, res) => {
    // TODO(A): gửi PDF vào OpenAI với Structured Outputs và trả về Analysis thật.
    // Model chỉ trích tín hiệu (signals); app tự tính điểm.
    const analysis: Analysis = sample;
    res.json(analysis);
  },
);
