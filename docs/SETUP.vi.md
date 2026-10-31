> **Cập nhật backend:** Firebase Auth và Firestore thay Supabase. Xem [FIREBASE.md](FIREBASE.md) cho cấu hình hiện tại. Hướng dẫn Supabase bên dưới chỉ còn để đối chiếu lịch sử.

[English](SETUP.md) | **Tiếng Việt**

# Cấu hình tài khoản Google và triển khai

Mỗi người tự tạo tài khoản, project Supabase và hosting của mình. Không có backend production hoặc tài khoản dùng chung đi kèm mã nguồn. Chế độ khách không cần dịch vụ cloud.

## Supabase

1. Tạo project Supabase trong tài khoản của bạn.
2. Chạy lần lượt `supabase/migrations/202610140001_practice_sessions.sql`, `supabase/migrations/202610140002_extended_course.sql` `supabase/migrations/202610140003_practice_assessments.sql` và `supabase/migrations/202610140004_session_privileges.sql` qua SQL Editor hoặc Supabase CLI. Nếu đã có database, chạy các migration chưa áp dụng theo thứ tự: migration thứ hai cho 24 bài mới, migration thứ ba cho thư viện, đọc nhạc, đánh giá đầu vào và kết quả tiết tấu; migration thứ tư chỉ giữ quyền SELECT/INSERT/UPDATE/DELETE cho tài khoản. Với project mới có thể chạy một lần `supabase/setup/new-project.sql` thay cho các migration riêng. Bảng bật Row Level Security; mỗi người chỉ đọc/ghi buổi luyện của chính mình.
3. Lấy Project URL và publishable/anon key. Sao chép `.env.example` thành `.env.local` và điền `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Đây là key công khai cho client, không dùng service-role key.
4. Authentication → URL Configuration: đặt Site URL bằng URL Vercel production; thêm redirect `https://YOUR-DOMAIN/auth/callback`, `http://localhost:5173/auth/callback`, `com.phim.piano://auth/callback`. Chỉ cho phép các preview URL bạn thực sự dùng, không mở wildcard cho mọi dự án Vercel.

## Google Cloud

1. Tạo/chọn project Google Cloud. Trong Google Auth Platform, thiết lập Branding/Audience. Khi còn Testing, thêm email của bạn và người thử vào Test users.
2. Tạo OAuth Client ID loại **Web application**.
3. Authorized redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback` (lấy giá trị chính xác từ trang provider Google trong Supabase).
4. Nhập Client ID và Client Secret vào Supabase → Authentication → Sign In / Providers → Google rồi bật provider. Secret chỉ lưu ở Supabase, không commit Git hay thêm vào biến VITE_.
5. Kiểm tra đăng nhập, đăng xuất và đăng nhập tài khoản khác. PKCE được dùng trên web và iOS; trên iOS, Browser mở màn hình OAuth ngoài WKWebView rồi quay về qua URL scheme.

## GitHub và Vercel

1. Fork repository này hoặc tạo repository riêng của bạn. Không push `.env.local` hoặc token.
2. Vercel → Add New Project → chọn repo. Framework Vite; build `npm run build`; output `dist`; Node 22.
3. Thêm hai biến `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` cho Production/Preview theo nhu cầu rồi deploy. Đây là biến build-time; đổi cấu hình cần redeploy.
4. Thêm URL Vercel chính xác vào allowlist redirect của Supabase.
5. Google login phải được thử bằng tài khoản thật. Build thành công không xác nhận OAuth đã hoạt động.

Tài liệu: https://supabase.com/docs/guides/auth/social-login/auth-google · https://supabase.com/docs/guides/auth/native-mobile-deep-linking · https://vercel.com/docs/frameworks/frontend/vite

`supabase/config.toml` chỉ chứa ví dụ callback local. Khi deploy, thêm domain của chính bạn vào Site URL/redirect allowlist. Không áp dụng cấu hình này vào project của người khác.
