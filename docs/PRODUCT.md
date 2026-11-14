# Sản phẩm

## Vấn đề

Nhiều sinh viên ôn thi kiểu "một đêm cho một học kỳ". Họ không đặt mục tiêu điểm cao cho mọi môn, và thứ họ thiếu là câu trả lời cho câu hỏi: với mục tiêu này và chừng này thời gian, phải học phần nào và bỏ được phần nào.

## Người dùng

Sinh viên đại học sắp thi một học phần, có sẵn đề cương, slide và đề thi cũ của môn đó.

## Giá trị cốt lõi

Chú Tủng chỉ ra phần nào phải học và phần nào bỏ được, dựa trên chuẩn đầu ra (CLO) của môn, mục tiêu điểm và số giờ còn lại của người học. Mỗi gợi ý đều kèm lý do để người học kiểm tra được.

## Luồng sử dụng

1. **Tải tài liệu và đặt mục tiêu.** Người dùng chọn file PDF đề cương, slide, đề thi cũ (tùy chọn), nhập điểm mục tiêu và số giờ còn lại. Có nút dùng môn mẫu đã phân tích sẵn.
2. **Heatmap.** Danh sách chủ đề tô màu theo độ nóng, kèm lý do (số câu trong đề cũ, số tiết, CLO, mức Bloom). Người dùng tự đánh giá từng chủ đề: chưa biết, lơ mơ, nắm chắc.
3. **Chủ đề.** Tóm tắt cô đọng và vài câu hỏi trắc nghiệm theo mức Bloom của chủ đề. Trả lời xong, mức nắm và heatmap cập nhật.
4. **Lộ trình.** Các chủ đề xếp theo thứ tự nên học, có vạch hết quỹ thời gian và nhãn chủ đề nào cần cho điểm mục tiêu.

Độ nóng = độ quan trọng × (1 − mức đã nắm). Chủ đề quan trọng mà người học chưa nắm thì nóng nhất.

## Trong phạm vi MVP

- Đầu vào là file PDF: đề cương có CLO, slide, đề thi cũ.
- Môn demo chính: Cơ sở dữ liệu.
- Bốn màn hình ở trên.
- Trạng thái lưu trên máy người dùng.

## Ngoài phạm vi MVP

- Gamification, streak, nhắc học hằng ngày.
- Chat hỏi đáp với tài liệu (RAG).
- Đăng nhập, tài khoản, đồng bộ giữa các máy.
- Giáo trình dài, file scan, file không phải PDF.
- Mức nắm giảm dần theo thời gian.
- Hiển thị công thức toán.

## Hướng phát triển sau MVP

- Mức nắm giảm theo thời gian không ôn, kèm ôn nhanh 5 phút mỗi ngày để giữ heatmap nguội.
- Gamification gắn với việc làm nguội heatmap.
- Chat hỏi đáp trên tài liệu đã tải lên.
- Hỗ trợ giáo trình và các môn nhiều công thức như Đại số.
- Theo dõi nhiều môn, nhiều kỳ thi trong một học kỳ.
