// Client OpenAI dùng chung. VÙNG ĐÓNG BĂNG: báo cả nhóm trước khi sửa.
import OpenAI from 'openai';

let client: OpenAI | undefined;

// Tạo khi cần, để server vẫn chạy được với dữ liệu giả khi chưa có key
export function getOpenAI(): OpenAI {
  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export function getModel(): string {
  const model = process.env.OPENAI_MODEL;
  if (!model) throw new Error('Thiếu OPENAI_MODEL trong server/.env');
  return model;
}
