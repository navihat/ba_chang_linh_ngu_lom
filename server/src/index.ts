// Điểm vào của server. VÙNG ĐÓNG BĂNG: báo cả nhóm trước khi sửa.
import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import { analysisRouter } from './analysis/router';
import { quizRouter } from './quiz/router';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});
app.use(analysisRouter); // POST /analyze  (module A)
app.use(quizRouter); // POST /quiz  (module C)

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => console.log(`Server chạy ở cổng ${port}`));
