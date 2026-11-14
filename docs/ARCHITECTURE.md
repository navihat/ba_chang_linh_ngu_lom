# Kiến trúc

## Stack

- **App:** Expo SDK 58 (React Native, TypeScript), Expo Router, Zustand lưu trạng thái vào AsyncStorage.
- **Server:** Node, Express, TypeScript chạy bằng tsx. Giữ API key và gọi OpenAI.
- **AI:** OpenAI API, gửi PDF trực tiếp vào model, nhận JSON bằng Structured Outputs.
- Không có database, không đăng nhập, không RAG. Server không lưu trạng thái.

## Cấu trúc thư mục

```
src/
  app/                  routes, mỗi file chỉ re-export màn hình của một module
  core/                 phần dùng chung của app
    store.ts            trạng thái: analysis, goal, mastery, questions
    scoring.ts          công thức tính điểm
    theme.ts            màu, khoảng cách, thang màu heatmap
    ui.tsx              Button
    api.ts              địa chỉ server, postJson
  modules/
    analysis/           màn hình tải tài liệu và đặt mục tiêu
    heatmap/            màn hình heatmap và tự đánh giá
    plan/               màn hình lộ trình và thuật toán xếp lộ trình
    study/              màn hình chủ đề và câu hỏi
shared/
  types.ts              kiểu dữ liệu chung của app và server
  sample/csdl.json      kết quả phân tích lưu sẵn của môn mẫu
server/src/
  index.ts              điểm vào, gắn các router
  openai.ts             client OpenAI
  analysis/             POST /analyze
  quiz/                 POST /quiz
samples/csdl/           PDF mẫu để thử
docs/                   tài liệu
```

Module không import lẫn nhau. Module chỉ import từ `@/core/*` (tức `src/core`) và `@shared/*` (tức `shared`).

## Luồng dữ liệu

1. App gửi PDF lên `POST /analyze`.
2. Server gửi PDF vào model và nhận về `Analysis`: tên môn, danh sách CLO, danh sách chủ đề kèm tín hiệu.
3. App lưu `Analysis` vào store. `scoreTopics` tính độ quan trọng, mức nắm, độ nóng mỗi khi cần hiển thị.
4. Người dùng tự đánh giá hoặc trả lời câu hỏi, store cập nhật `mastery`, heatmap và lộ trình đổi theo.
5. Khi mở một chủ đề lần đầu, app gọi `POST /quiz` và lưu câu hỏi vào store để lần sau không gọi lại.

## Dữ liệu

Định nghĩa đầy đủ nằm trong [shared/types.ts](../shared/types.ts). Các kiểu chính:

- `Topic`: một chủ đề, gồm tóm tắt, thời gian ôn ước tính và `signals`.
- `TopicSignals`: số tiết, CLO liên quan, mức Bloom, số câu trong đề cũ, trang slide.
- `Analysis`: kết quả phân tích một môn.
- `Question`: câu hỏi trắc nghiệm của một chủ đề.
- `Goal`: điểm mục tiêu (thang 10) và số giờ còn lại.
- `ScoredTopic`: `Topic` kèm `importance`, `mastery`, `heat`.

Model chỉ trả về tín hiệu. Điểm số do code tính, nên kết quả ổn định giữa các lần chạy và giải thích được.

## Công thức

Cài đặt trong [src/core/scoring.ts](../src/core/scoring.ts) và [src/modules/plan/plan.ts](../src/modules/plan/plan.ts).

**Độ quan trọng** (0–1), mỗi thành phần chia cho giá trị lớn nhất trong môn:

```
0.4 × số câu trong đề cũ + 0.3 × số tiết + 0.2 × (mức Bloom ÷ 6) + 0.1 × số CLO
```

**Mức nắm** (0–1):

- Tự đánh giá đặt giá trị: chưa biết 0, lơ mơ 0.4, nắm chắc 0.8.
- Sau mỗi câu hỏi: `mức mới = 0.7 × mức cũ + 0.3 × (đúng ? 1 : 0)`.

**Độ nóng** = độ quan trọng × (1 − mức nắm).

**Lộ trình:**

- Xếp chủ đề theo `độ nóng ÷ số phút ước tính`, từ cao xuống thấp.
- Cộng dồn số phút; chủ đề vượt quá `số giờ còn lại × 60` nằm sau vạch hết quỹ thời gian.
- Một chủ đề được gắn nhãn "cần cho mục tiêu" khi phần kiến thức đã nắm (tính theo độ quan trọng) còn thấp hơn `điểm mục tiêu ÷ 10 + 0.1`.

Các trọng số và phần dư 0.1 là ước lượng ban đầu, chỉnh sau khi thử trên tài liệu thật.

## API của server

| Endpoint | Đầu vào | Đầu ra |
|---|---|---|
| `GET /health` | không | `{ ok: true }` |
| `POST /analyze` | multipart: `syllabus` (1 PDF), `slides` (nhiều PDF), `exams` (nhiều PDF, tùy chọn) | `Analysis` |
| `POST /quiz` | JSON `QuizRequest`: `{ topic, count? }` | `QuizResponse`: `{ questions }` |

`/quiz` sinh câu hỏi từ `topic.summary` và mức Bloom của chủ đề, nên `summary` phải đủ ý để đặt câu hỏi.

## Giới hạn cần biết

- OpenAI giới hạn số trang và dung lượng PDF mỗi request. Slide vượt giới hạn thì chia theo chương.
- Bản APK phát hành của Android mặc định chặn kết nối `http://`. Khi build APK, server phải có địa chỉ `https://`.
- Biến `EXPO_PUBLIC_API_URL` được đóng vào app lúc build hoặc lúc chạy `expo start`.
