# Chú Tủng

App di động giúp sinh viên ôn thi cấp tốc: tải lên đề cương, slide và đề thi cũ, nhận về heatmap các chủ đề cần học và lộ trình ôn vừa với mục tiêu điểm và số giờ còn lại.

Nhóm: ba_chang_linh_ngu_lom.

## Tài liệu

- [docs/PRODUCT.md](docs/PRODUCT.md): sản phẩm làm gì, phạm vi MVP
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): cấu trúc code, dữ liệu, công thức, API
- [docs/TEAM.md](docs/TEAM.md): chia module, quy trình git, mốc thời gian
- [docs/DEMO.md](docs/DEMO.md): kịch bản demo và checklist
- [AGENTS.md](AGENTS.md): quy tắc cho agent viết code

## Cài đặt

Cần Node 20 trở lên và app Expo Go trên điện thoại.

```bash
npm install
cd server && npm install && cd ..
cp .env.example .env.local
cp server/.env.example server/.env
```

Điền `OPENAI_API_KEY` và `OPENAI_MODEL` vào `server/.env`. Khi chưa điền, server vẫn chạy và trả dữ liệu giả.

## Chạy

Mở hai terminal:

```bash
cd server && npm run dev     # server ở cổng 3001
npx expo start               # app, hiện mã QR
```

Quét mã QR bằng Expo Go (Android) hoặc Camera (iOS).

## Chạy trên điện thoại qua hotspot

1. Máy tính và điện thoại cùng nối vào một hotspot.
2. Lấy IP của máy tính: `hostname -I` (Linux), `ipconfig getifaddr en0` (macOS), `ipconfig` (Windows).
3. Sửa `.env.local`: `EXPO_PUBLIC_API_URL=http://<IP máy tính>:3001`.
4. Chạy lại `npx expo start`. Mỗi lần đổi `.env.local` phải chạy lại lệnh này.

Nếu điện thoại không kết nối được, chạy `npx expo start --tunnel`.

## Kiểm tra trước khi merge

```bash
npx tsc --noEmit                 # app
cd server && npm run typecheck   # server
```
