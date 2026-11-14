# Làm việc nhóm

Ba người, mỗi người nhận một vai A, B hoặc C và làm việc cùng agent trong đúng thư mục của mình. Hạn nộp: 16:00 hôm nay.

## Module

| Vai | Module | Thư mục được sửa | Việc cần làm |
|---|---|---|---|
| A | analysis | `src/modules/analysis/`, `server/src/analysis/`, `shared/sample/`, `samples/` | Prompt phân tích PDF thành `Analysis`, endpoint `/analyze` thật, màn hình tải tài liệu, lưu kết quả phân tích môn mẫu |
| B | heatmap, plan | `src/modules/heatmap/`, `src/modules/plan/` | Màn hình heatmap và tự đánh giá, màn hình lộ trình, chỉnh thuật toán lộ trình |
| C | study | `src/modules/study/`, `server/src/quiz/`, `docs/DEMO.md` | Prompt sinh câu hỏi theo mức Bloom, endpoint `/quiz` thật, màn hình chủ đề, kịch bản demo và pitch |

B và C làm việc với môn mẫu (nút "Dùng môn mẫu" ở màn hình đầu), không phải chờ A.

## Vùng đóng băng

Không ai sửa các phần này khi chưa báo cả nhóm:

- `shared/types.ts`
- `src/core/`
- `src/app/`
- `server/src/index.ts`, `server/src/openai.ts`
- `package.json`, `server/package.json`, `app.json`, `tsconfig.json`, `eas.json`

Khi cần sửa vùng đóng băng hoặc thêm thư viện:

1. Báo trong nhóm chat, nói rõ sửa gì.
2. Một người sửa trên nhánh của mình, merge vào `main` ngay và push.
3. Hai người còn lại lấy `main` về nhánh của mình.

## Quy trình git

Mỗi người một nhánh: `a-analysis`, `b-heatmap-plan`, `c-study`.

```bash
git checkout -b a-analysis        # tạo nhánh từ main, làm một lần

# đưa phần đã chạy được lên main
git add -A && git commit -m "mô tả ngắn"
git fetch origin && git merge origin/main
npx tsc --noEmit                  # và typecheck server nếu có sửa server
git checkout main && git pull && git merge a-analysis && git push
git checkout a-analysis
```

- Commit thường xuyên, merge vào `main` mỗi khi một phần chạy được và tại mỗi mốc bên dưới.
- Không commit `.env.local` và `server/.env`.

## Mốc thời gian

| Giờ | Mốc |
|---|---|
| 13:00 | Mỗi người nhận vai, tạo nhánh, chạy được app trên điện thoại. A thử prompt phân tích trên tài liệu thật và cả nhóm xem heatmap có hợp lý không |
| 14:00 | Merge lần 1. `/analyze` trả `Analysis` thật, heatmap và lộ trình hoàn chỉnh với môn mẫu, `/quiz` sinh câu hỏi thật. Build thử APK |
| 15:00 | Merge lần 2. Chạy trọn luồng với tài liệu thật trên điện thoại. Kết quả phân tích môn Cơ sở dữ liệu lưu vào `shared/sample/csdl.json`. Server có địa chỉ `https://` |
| 15:40 | Dừng viết tính năng. Chỉ sửa lỗi, build APK cuối, tập demo |
| 16:00 | Nộp bài |

## Tiêu chí xong của một phần việc

- Typecheck qua.
- Chạy được trên điện thoại thật qua Expo Go.
- Đã merge vào `main` và push.
