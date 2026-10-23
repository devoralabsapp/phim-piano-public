# Lộ trình 32 bài

Mỗi cấp độ có 8 bài. Có thể lọc cấp độ và mở bất kỳ bài nào; bài cũ và nhật ký luyện vẫn giữ nguyên ID. Nội dung có tiếng Việt và tiếng Anh.

| Cấp độ | Nội dung |
| --- | --- |
| Cơ bản | Phím đàn, tư thế, 5 ngón, nhịp, giai điệu đầu tiên, tay trái, hợp âm và ôn tập |
| Nền tảng | Gam Đô hai tay riêng, gam Sol/Fa/La thứ tự nhiên, nốt móc đơn và dấu lặng, articulation, hợp âm I–IV–V–I |
| Trung cấp | Gam hai quãng tám, arpeggio, đảo hợp âm, hai tay song song, Alberti bass, đệm waltz, đảo phách, ii–V–I |
| Nâng cao | La thứ hòa thanh, gam bán cung, arpeggio giảm, đảo hợp âm bảy, làm nổi bè giai điệu, 3 chống 2, át phụ và étude tổng hợp |

Bắt đầu ở tốc độ luyện chậm của bài. Tăng khoảng 5 BPM khi chơi đều và thoải mái; tốc độ đích là gợi ý, không phải điều kiện hoàn thành. Tập riêng từng tay trước khi ghép ở bài hai tay. Ngừng và điều chỉnh tư thế nếu thấy đau hoặc căng.

Nghe mẫu phát đủ các nốt của nhóm và thời lượng theo phách, gồm dấu lặng. Bàn phím màn hình mở rộng theo âm vực bài, có thể cuộn ngang; nhóm hợp âm có thể chạm từng nốt. Với MIDI, cần nhấn mới và giữ đủ các nốt của nhóm cùng lúc; nhả nhóm trước khi chuyển tiếp. Dấu lặng cần tự đếm rồi bấm tiếp tục.

Ngoài chế độ cao độ, nút **Chấm tiết tấu** mở lượt luyện theo đồng hồ: đếm vào một ô nhịp, chấm thời điểm nhấn, thiếu/dư nốt và thời gian giữ phím MIDI. Nốt sớm/trễ được xác định theo sai lệch lớn hơn min(120 ms, 18% một phách). Nốt được ghép với cao độ tương ứng gần nhất trong cửa sổ min(400 ms, 60% một phách); các nốt còn lại tính là dư/thiếu. Điểm tổng hợp kết hợp cao độ và nhịp, trừ điểm nốt dư. Không chấm pedal, tư thế hoặc chất lượng bè. Độ dài giữ phím được đo từ note-off, không phải độ ngân âm.

Khuông nhạc hỗ trợ khóa Sol/Fa, dấu thăng/giáng, độ dài nốt, dấu chấm dôi, dấu lặng và chỉ số nhóm ba. Đây là khuông luyện đơn giản, chưa phải bộ dàn trang bản nhạc nhiều bè với liên kết nốt/ties đầy đủ. Chọn tay và đoạn trước khi nghe mẫu hoặc luyện. Chạm nốt để bắt đầu lại từ vị trí đó; đánh dấu hoàn thành cần chơi trọn bài, không chỉ nốt cuối.

**Thư viện bài nhạc** có 10 bản luyện riêng với nguồn/tác giả; các bản giản lược do Phím biên soạn, không sao chép bản thu hay bản phối thương mại. Minuet in G ghi đúng tác giả Christian Petzold ([bản nhạc nguồn](https://imslp.org/wiki/Minuet_%28Pezold%2C_Christian%29)). Hai bản Waltz trong khu vườn và Khúc đêm là nhạc gốc.

**Phòng luyện tập** có video minh họa ngón, bài đọc nhạc mới bốn ô nhịp ở ba mức và đánh giá đầu vào. Gợi ý bài dựa trên kết quả gần đây; đánh giá này không tương đương cấp thi chứng chỉ hay đánh giá biểu diễn của giáo viên. Bài kỹ thuật cần người học tự nghe và điều chỉnh chất lượng chơi.

Micro nhận giai điệu một nốt mỗi lần C2–C7, xử lý trên thiết bị. Chỉ xin quyền khi bật; dừng và giải phóng micro khi đổi nguồn, đóng bài hoặc ứng dụng vào nền. Không thu/tải âm thanh. Hợp âm cần MIDI; tiếng click/âm nền có thể làm nhận sai, nên dùng tai nghe. Sai lệch nhịp micro chỉ tham khảo.

Database đã tạo trước bản mở rộng cần chạy `supabase/migrations/202610140002_extended_course.sql` và `supabase/migrations/202610140003_practice_assessments.sql` để lưu các ID bài mới. Không thay đổi chính sách Row Level Security.
