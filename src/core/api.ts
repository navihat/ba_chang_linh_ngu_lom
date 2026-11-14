// Địa chỉ server. VÙNG ĐÓNG BĂNG: báo cả nhóm trước khi sửa.
// Mỗi người đặt EXPO_PUBLIC_API_URL trong file .env.local của mình (không commit).
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} lỗi ${res.status}`);
  return res.json();
}
