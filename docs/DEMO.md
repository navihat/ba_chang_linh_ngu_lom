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

## Lời pitch (khoảng 3 phút)

| Thời gian | Màn hình | Lời nói |
|---|---|---|
| 0:00–0:20 | Không cần màn hình | "Còn ba tiếng nữa thi Cơ sở dữ liệu, cả học kỳ chưa học. Bạn chỉ cần qua môn, 5 điểm. Câu hỏi không phải là học gì, mà là bỏ được gì. Chú Tủng trả lời câu đó." |
| 0:20–0:50 | Tải tài liệu | "Mình đưa vào đề cương, slide và đề thi cũ của môn. Đặt mục tiêu 5 điểm, còn 3 giờ." Bấm phân tích rồi chuyển sang môn mẫu. "Phân tích mất khoảng một phút, nên mình mở bản đã phân tích sẵn." |
| 0:50–1:30 | Heatmap | "Mỗi chủ đề được tô theo độ nóng: quan trọng mà chưa nắm thì đỏ." Chỉ vào chủ đề đỏ nhất, đọc lý do. "AI chỉ trích dữ kiện: mấy câu trong đề cũ, mấy tiết, CLO nào, mức Bloom nào. Điểm do công thức tính, nên lần nào chạy cũng ra một kết quả và bạn kiểm tra được." |
| 1:30–1:45 | Heatmap | Bấm "Nắm chắc" cho một chủ đề. "Phần nào bạn đã biết, nói cho Chú Tủng, nó nguội ngay." |
| 1:45–2:20 | Chủ đề | Mở chủ đề nóng nhất. "Tóm tắt vài dòng, và câu hỏi đúng mức tư duy mà CLO yêu cầu: CLO bắt vận dụng thì câu hỏi là bài vận dụng, không phải học thuộc định nghĩa." Trả lời một câu, quay lại heatmap cho thấy chủ đề nguội đi. |
| 2:20–2:45 | Lộ trình | "Đây là thứ tự nên học. Vạch này là hết 3 giờ: phần dưới vạch, bạn bỏ. Nhãn đỏ là phần bắt buộc để đạt 5 điểm." Đổi mục tiêu lên 8 điểm: "Muốn 8 điểm thì danh sách bắt buộc dài ra, và Chú Tủng nói thẳng 3 giờ là không đủ." |
| 2:45–3:00 | Không cần màn hình | "Bước tiếp: mức nắm giảm dần nếu không ôn, ôn nhanh 5 phút mỗi ngày để giữ heatmap nguội, và hỗ trợ các môn nhiều công thức. Chú Tủng: biết bỏ đúng chỗ để qua môn." |

## Câu hỏi giám khảo có thể hỏi

- **AI có bịa điểm không?** Không. Model chỉ trả về tín hiệu đếm được (số câu trong đề cũ, số tiết, CLO, mức Bloom). Độ quan trọng và độ nóng tính bằng công thức cố định trong code.
- **Sao biết câu hỏi hợp mức?** Câu hỏi sinh theo mức Bloom cao nhất của CLO liên quan đến chủ đề, chỉ từ phần tóm tắt của chủ đề. Đáp án được xáo trong code để vị trí đáp án đúng không đoán được.
- **Dữ liệu người dùng đi đâu?** Server không lưu gì. Trạng thái học nằm trên máy người dùng. API key chỉ ở server.
- **Khác gì hỏi thẳng ChatGPT?** ChatGPT trả lời một lần rồi thôi. Chú Tủng giữ mức nắm của từng chủ đề, cập nhật sau mỗi câu trả lời, và lộ trình đổi theo.

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
