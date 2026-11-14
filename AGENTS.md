# Hướng dẫn cho agent

Chú Tủng là app Expo (React Native) kèm một server Node nhỏ. App phân tích đề cương, slide và đề thi cũ của một môn học, rồi hiển thị heatmap chủ đề và lộ trình ôn thi theo mục tiêu điểm và số giờ còn lại của người học.

Đọc trước khi viết code:

- [docs/PRODUCT.md](docs/PRODUCT.md): phạm vi MVP, những gì không làm
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): cấu trúc thư mục, dữ liệu, công thức, API
- [docs/TEAM.md](docs/TEAM.md): module nào thuộc về ai

## Quy tắc bắt buộc

1. **Chỉ sửa trong module của người đang điều khiển bạn.** Hỏi họ nhận module nào (A, B hay C) nếu chưa biết. Bảng module và thư mục nằm trong docs/TEAM.md.
2. **Không sửa vùng đóng băng:** `shared/types.ts`, `src/core/`, `src/app/`, `server/src/index.ts`, `server/src/openai.ts`, các file cấu hình ở gốc. Nếu thấy cần sửa, dừng lại và báo cho người điều khiển.
3. **Không tự thêm thư viện.** Thêm thư viện làm đổi `package.json` và gây xung đột; báo cho người điều khiển trước.
4. **Không thêm:** database, đăng nhập, RAG, chat với tài liệu, gamification.
5. **Model chỉ trích tín hiệu, code tính điểm.** Mọi điểm số (độ quan trọng, mức nắm, độ nóng) tính trong `src/core/scoring.ts`. Không để model trả về điểm.
6. **API key chỉ nằm trong `server/.env`.** App không bao giờ gọi OpenAI trực tiếp.
7. **Chữ trên giao diện viết tiếng Việt.** Code, tên biến, tên file viết tiếng Anh.
8. **Giữ code tối giản.** Không thêm tính năng, lớp trừu tượng hay tùy chọn cấu hình ngoài yêu cầu.

## Quy ước code

- Module nằm trong `src/modules/<tên>/`. Module này không import từ module khác; chỉ import từ `@/core/*` và `@shared/*`.
- Màn hình đọc và ghi trạng thái qua `useStore` trong `src/core/store.ts`.
- Màu và khoảng cách lấy từ `src/core/theme.ts`, nút bấm dùng `Button` trong `src/core/ui.tsx`.
- Gọi server qua `postJson` hoặc `API_URL` trong `src/core/api.ts`.
- Phần server của module nằm trong `server/src/<tên>/`.

## Lệnh

```bash
npx expo start                   # chạy app
cd server && npm run dev         # chạy server
npx tsc --noEmit                 # typecheck app
cd server && npm run typecheck   # typecheck server
npx expo install <package>       # thêm thư viện cho app (không dùng npm install)
```

Chạy typecheck của phần mình sửa trước khi báo xong việc.

## Expo

Dự án dùng Expo SDK 58. API của Expo đổi theo từng bản SDK, nên trước khi dùng một API của Expo hay React Native, hãy đọc tài liệu đúng phiên bản tại `https://docs.expo.dev/versions/v58.0.0/` thay vì dựa vào trí nhớ. Mục lục cho agent: `https://docs.expo.dev/llms.txt`.

- Điều hướng dùng Expo Router; route nằm trong `src/app/`.
- Không tạo hay sửa thư mục `ios/` và `android/`.
- Chỉ dùng thư viện chạy được trong Expo Go.
