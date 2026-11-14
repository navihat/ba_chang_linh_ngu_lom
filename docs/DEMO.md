# Demo

Người phụ trách: vai C.

## Kịch bản

1. **Vấn đề.** "Một đêm cho một học kỳ": sinh viên không biết phải học phần nào và bỏ được phần nào.
2. **Tải tài liệu.** Chọn đề cương, slide, đề thi cũ của môn Cơ sở dữ liệu. Nhập điểm mục tiêu và số giờ còn lại. Bấm phân tích, rồi chuyển sang môn mẫu đã lưu sẵn để không phải chờ.
3. **Heatmap.** Chỉ vào chủ đề nóng nhất và đọc lý do: số câu trong đề cũ, số tiết, CLO, mức Bloom.
4. **Tự đánh giá.** Bấm "Nắm chắc" cho một chủ đề, heatmap đổi màu ngay.
5. **Chủ đề.** Mở một chủ đề nóng, đọc tóm tắt, trả lời câu hỏi. Quay lại heatmap để thấy chủ đề nguội đi.
6. **Lộ trình.** Cho thấy thứ tự học, vạch hết quỹ thời gian và các chủ đề cần cho điểm mục tiêu. Đổi mục tiêu điểm hoặc số giờ để thấy lộ trình thay đổi.
7. **Hướng phát triển.** Xem mục cuối của [PRODUCT.md](PRODUCT.md).

## Checklist trước giờ trình bày

- [ ] `shared/sample/csdl.json` là kết quả phân tích thật của môn Cơ sở dữ liệu, không còn dữ liệu giả.
- [ ] Server đã deploy, có địa chỉ `https://`, và `GET /health` trả về `ok`.
- [ ] `EXPO_PUBLIC_API_URL` trỏ về server đã deploy trước khi build APK.
- [ ] APK đã cài trên điện thoại demo và chạy trọn kịch bản.
- [ ] Hotspot bật, điện thoại và máy tính cùng mạng, pin đủ.
- [ ] Phương án dự phòng: chạy bằng Expo Go, hoặc bản web bằng `npx expo start --web`.
- [ ] Đã chạy thử trọn kịch bản ít nhất hai lần.

## Build APK

```bash
npx eas-cli@latest build -p android --profile preview
```

Cần tài khoản Expo. Build chạy trên máy chủ của Expo và phải chờ, nên build thử từ mốc 14:00.
