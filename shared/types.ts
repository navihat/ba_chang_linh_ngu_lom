// Hợp đồng dữ liệu giữa app và server. VÙNG ĐÓNG BĂNG: báo cả nhóm trước khi sửa.

export type Clo = {
  id: string; // "CLO2"
  text: string;
};

// Tín hiệu do model trích từ tài liệu. Model KHÔNG tự chấm điểm quan trọng.
export type TopicSignals = {
  hours: number; // số tiết trong đề cương
  cloIds: string[]; // CLO liên quan
  bloom: number; // 1–6, mức Bloom cao nhất của CLO liên quan
  pastExamHits: number; // số câu trong đề cũ
  slidePages: number[]; // trang slide liên quan
};

// Đoạn trích nguyên văn từ tài liệu, để người học tự đối chiếu
export type Quote = {
  source: string; // tên file
  page: number; // số trang, 0 nếu không rõ
  text: string;
};

export type Topic = {
  id: string;
  title: string;
  chapter: string;
  summary: string; // tóm tắt cô đọng, mỗi ý một dòng
  signals: TopicSignals;
  estMinutes: number; // thời gian ôn ước tính
  quotes?: Quote[]; // không bắt buộc: môn mẫu và kết quả cũ không có
};

// Kết quả POST /analyze
export type Analysis = {
  course: string;
  clos: Clo[];
  topics: Topic[];
};

export type Question = {
  id: string;
  topicId: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
};

// POST /quiz
export type QuizRequest = { topic: Topic; count?: number };
export type QuizResponse = { questions: Question[] };

export type Goal = {
  targetGrade: number; // thang 10
  hoursLeft: number;
};

// Topic sau khi app tính điểm (src/core/scoring.ts)
export type ScoredTopic = Topic & {
  importance: number; // 0–1
  mastery: number; // 0–1
  heat: number; // importance × (1 − mastery)
};
