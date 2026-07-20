🚗 VietDrivePro - Hệ thống Ôn thi Sát hạch Giấy phép Lái xe
📝 Giới thiệu dự án
VietDrivePro là dự án xây dựng ứng dụng hỗ trợ ôn luyện lý thuyết thi sát hạch giấy phép lái xe (hạng Ô tô và Mô tô A1). Hệ thống được thiết kế nhằm tối ưu hóa trải nghiệm học tập của người dùng thông qua các tính năng cốt lõi:

Quản lý & Luyện đề: Cung cấp hệ thống câu hỏi theo chuẩn quy định, hỗ trợ thi thử với cấu trúc đề mô phỏng thực tế.

Tạo đề ngẫu nhiên: Thuật toán tự động trộn và phân tách bộ đề giúp người học đánh giá chính xác năng lực.

Tra cứu thông minh: Tích hợp thư viện tra cứu hệ thống biển báo giao thông đường bộ trực quan, nhanh chóng.

Dự án được triển khai theo mô hình kiến trúc tách biệt (Decoupled Architecture), đảm bảo khả năng mở rộng và hiệu năng ổn định.

🛠 Kiến trúc & Công nghệ sử dụng
Hệ thống được tổ chức theo mô hình Client-Server với các công nghệ hiện đại được tích hợp đồng bộ:

Backend API: .NET (C#)

Xây dựng hệ thống RESTful API quản lý nghiệp vụ, xử lý logic chấm điểm và phân tách ngân hàng câu hỏi.

Frontend Web: React

Phát triển giao diện SPA (Single Page Application) mượt mà, tối ưu hóa trải nghiệm làm bài thi thời gian thực của người dùng.

Database Management: SQL Server

Thiết kế cấu trúc cơ sở dữ liệu quan hệ, tối ưu hóa truy vấn bộ đề và hệ thống biển báo.

DevOps & Deployment: Docker & Docker Compose

Đóng gói toàn bộ các dịch vụ (Frontend, Backend, Database) thành các Container riêng biệt, giúp dễ dàng cấu hình, khởi chạy và đồng bộ môi trường phát triển chỉ với một câu lệnh.

📂 Cấu trúc mã nguồn thư mục chính
/backend-api: Mã nguồn xử lý logic và cung cấp dịch vụ dữ liệu.

/frontend-web: Giao diện tương tác của người dùng.

/db-init: Kịch bản (Script) khởi tạo cấu trúc và dữ liệu ban đầu cho SQL Server.
