# Cấu hình Google login và triển khai

[English](SETUP.md) | **Tiếng Việt**

Chế độ khách chỉ cần Node.js 22.12+ và npm: chạy `npm ci`, sau đó `npm run dev`. Không cần tài khoản cloud.

## Firebase tùy chọn

Làm theo [hướng dẫn Firebase](FIREBASE.md): đăng ký Web app, bật Google Authentication, tạo Firestore, triển khai Security Rules và cấu hình `.env.local`. Mỗi bản fork/triển khai dùng project riêng. Không đưa thông tin quản trị vào ứng dụng client.

Các biến cần thiết: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`; thêm `VITE_FIREBASE_DATABASE_ID` nếu dùng database có tên riêng. Không commit `.env.local`.

## Vercel và iOS

Vercel dùng Vite, lệnh build `npm run build`, thư mục đầu ra `dist` và cấu hình SPA có sẵn. Thêm biến Firebase cho từng môi trường, build lại và cho phép hostname trong Firebase Authentication. Giữ cấu hình CSP cho Google helper và Firebase.

Với iOS, xem [hướng dẫn iOS](IOS.vi.md) và [Firebase native](FIREBASE.md#ios). Cung cấp `GoogleService-Info.plist` riêng, rồi chạy `npm run ios:sync`. Giữ URL scheme và cấu hình signing local.
