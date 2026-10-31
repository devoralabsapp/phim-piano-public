> **Cập nhật backend:** Firebase Auth và Firestore thay Supabase. Xem [FIREBASE.md](FIREBASE.md) cho cấu hình hiện tại. Hướng dẫn Supabase bên dưới chỉ còn để đối chiếu lịch sử.

[English](IOS.md) | **Tiếng Việt**

# Chạy Piano Sprout trên iPad/iPhone từ Xcode

Dự án: `ios/App/App.xcodeproj`. Bundle ID: `org.example.phimpiano`; iOS tối thiểu 15.0. Mã UI được đóng gói trong ứng dụng, không tải website Vercel để chạy. CoreMIDI là phần Swift native.

## Trên Mac

1. Cài Xcode phù hợp với phiên bản iOS trên iPad/iPhone của bạn và Node.js 22.12 trở lên.
2. Trong thư mục repo, chạy `npm ci`, cấu hình `.env.local` như `docs/SETUP.md`, rồi `npm run ios:sync`.
3. Chạy `npm run ios:open` hoặc mở `ios/App/App.xcodeproj`.
4. Xcode → App target → Signing & Capabilities: chọn Team Apple của bạn, bật Automatically manage signing. Thay Bundle Identifier mẫu `org.example.phimpiano` bằng ID riêng của bạn; cập nhật đồng thời `capacitor.config.ts` và target Xcode. URL scheme OAuth vẫn là `com.phim.piano` trừ khi đổi đồng thời trong mã auth và Supabase allowlist.
5. Cắm iPad/iPhone vào Mac, bật Developer Mode khi iOS yêu cầu, chọn thiết bị và Run. Tài khoản Apple cá nhân có giới hạn thời hạn signing; phát hành TestFlight cần Apple Developer Program.
6. Khi sửa web hoặc đổi biến môi trường, chạy `npm run ios:sync` trước khi build lại.

## Kết nối Yamaha YDP-163

- iPad Pro M2: USB-B (cổng USB TO HOST trên đàn) → USB-C, dây có truyền dữ liệu.
- iPhone 11 Pro Max: USB-B → USB-A và Apple Lightning to USB Camera Adapter/USB 3 Camera Adapter. Cấp nguồn cho adapter nếu thiết bị yêu cầu.
- Bật đàn, mở Piano Sprout → Phòng luyện tập/Tài khoản & kết nối → Kết nối đàn MIDI.
- Chọn bài học và chế độ “Đàn MIDI”; bấm Bắt đầu luyện. Đúng nốt/đúng quãng tám sẽ chuyển sang nhóm tiếp theo. Với hợp âm, nhấn mới và giữ đủ các nốt đồng thời, rồi nhả trước nhóm tiếp theo. Velocity 0 được xử lý như note-off; plugin hỗ trợ running status, packet phân mảnh và cắm/rút thiết bị.
- Chế độ **Chấm tiết tấu** có đếm vào nhịp và báo sớm/trễ, thiếu/dư nốt; thời gian giữ phím dùng note-off. Chưa chấm pedal, tư thế hoặc sắc thái.
- Micro là tùy chọn trong chế độ chấm tiết tấu, chỉ xin quyền khi bật; nhận từng nốt, xử lý tại thiết bị và không thu/tải âm thanh. Info.plist đã có mô tả quyền. Cần thử quyền/âm thanh trên iPad/iPhone thật; dùng tai nghe và MIDI khi chơi hợp âm.

## Kiểm tra trước khi sử dụng thật

- Build simulator: `xcodebuild -project ios/App/App.xcodeproj -scheme App -sdk iphonesimulator -configuration Debug -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build`.
- Kiểm tra Google OAuth quay lại app, tiến độ đồng bộ sau restart, note-on/off, nhả phím, chấm sớm/trễ và rút/cắm dây trên đàn thật. Kiểm tra quyền micro, nhận từng nốt, dừng micro ở nền và phát video hoạt họa.
- CI macOS đã build simulator thành công và chạy qua 4 test parser Swift. Ký IPA và thử USB MIDI vẫn cần Mac/tài khoản Apple và thiết bị thật.

Tài liệu: https://capacitorjs.com/docs/ios · https://capacitorjs.com/docs/ios/custom-code · https://developer.apple.com/documentation/coremidi

## Kiểm tra âm thanh native

Piano Sprout màn hình, Nghe mẫu và máy đếm nhịp trên iOS dùng AVAudioPlayer với các nốt PCM tổng hợp tại thiết bị. Không cần quyền micro để nghe âm thanh; chỉ bật chế độ ghi/phát khi bạn chủ động bật luyện micro. Web vẫn dùng Web Audio.

Sau khi `git pull --ff-only`, `npm ci`, `npm run ios:sync` và Run lại trong Xcode:

1. Mở **Tài khoản & kết nối → Kiểm tra âm thanh → Phát thử âm thanh**.
2. Xác nhận **Bộ phát: ios-native-v2**, xem **Âm lượng** và **Đầu ra**. Nếu không có mục này thì bản trên máy chưa chứa thay đổi mới.
3. Nghe ba nốt Đô–Mi–Sol, thử phím màn hình, Nghe mẫu, máy đếm nhịp, hợp âm và bật/tắt micro. Thử loa, tai nghe, im lặng và chuyển nền/quay lại app.
4. Nếu vẫn im tiếng, gửi nội dung Bộ phát/Âm lượng/Đầu ra và dòng lỗi nếu có. Build CI và kiểm thử PCM không thay thế việc nghe trên thiết bị thật.

Kiểm thử tổng hợp PCM: `swift test --package-path native/PianoAudio`.
