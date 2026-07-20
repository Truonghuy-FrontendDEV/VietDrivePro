# 🚗 VietDrivePro - Ôn Thi GPLX Thông Minh

Ứng dụng web hỗ trợ **ôn thi giấy phép lái xe (GPLX)** Việt Nam hiện đại, đầy đủ tính năng cho cả **học viên** và **quản trị viên**.

---

## ✨ Tính năng nổi bật

### 👨‍🎓 Dành cho Học viên
- Học **600 câu hỏi** theo bộ đề GPLX mới nhất
- **Thi thử** các hạng GPLX (B1, B2, C, D, E...)
- Học **biển báo giao thông** và Luật Giao thông đường bộ
- Hệ thống **ôn lại câu sai** thông minh (tự động lưu và gợi ý)
- Theo dõi tiến độ học tập theo thời gian thực
- Xem lịch sử thi thử chi tiết

### 👨‍💼 Trang Admin (Quản trị)
- Quản lý toàn bộ câu hỏi, biển báo, đề thi
- Quản lý học viên và kết quả thi
- Thống kê, báo cáo tiến độ học tập
- Công cụ thêm/sửa/xóa câu hỏi dễ dàng
- Quản lý hệ thống đầy đủ

---

## 🛠 Công nghệ sử dụng

- **Frontend**: ReactJS
- **Backend**: ASP.NET Core Web API
- **Database**: SQL Server
- **Containerization**: Docker + Docker Compose
- **IDE**: Visual Studio (`.sln`)

---

## 📸 Hình ảnh dự án

*(Sẽ được cập nhật sau khi deploy)*

---

## 🚀 Cách cài đặt và chạy dự án

### Yêu cầu
- Docker Desktop (khuyến nghị)
- Hoặc: Visual Studio 2022 + SQL Server + Node.js

### Chạy bằng Docker (Khuyến nghị)

```bash
# Clone dự án
git clone https://github.com/tenuser/VietDrivePro.git
cd VietDrivePro

# Khởi chạy toàn bộ hệ thống
docker-compose up -d