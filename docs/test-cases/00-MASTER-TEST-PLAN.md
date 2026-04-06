# MASTER TEST PLAN - HỆ THỐNG QUẢN LÝ CẦU BẾN (Berth Planning)

## 1. Giới thiệu

### 1.1 Mục đích
Tài liệu này mô tả kế hoạch kiểm thử tổng thể cho Hệ thống Quản lý Cầu Bến (Berth Planning) - ứng dụng lập kế hoạch và quản lý vị trí cập cầu tại cảng Tân Thuận.

### 1.2 Phạm vi kiểm thử
- **Loại ứng dụng:** Single Page Application (SPA) - React 18
- **Môi trường:** Client-side (trình duyệt), không có backend
- **Công nghệ chính:** React, SheetJS (xlsx), jsPDF, html2canvas, localStorage

### 1.3 Trình duyệt mục tiêu
| Trình duyệt | Version | Ưu tiên |
|-------------|---------|---------|
| Google Chrome | ≥ 100 | Cao |
| Microsoft Edge | ≥ 100 | Cao |
| Firefox | ≥ 100 | Trung bình |
| Safari | ≥ 15 | Thấp |

---

## 2. Danh sách tài liệu Test Case

| # | File | Module | Số TC |
|---|------|--------|-------|
| 1 | [TC-01-AUTHENTICATION.md](TC-01-AUTHENTICATION.md) | Xác thực & Đổi mật khẩu | 15 |
| 2 | [TC-02-SHIP-MANAGEMENT.md](TC-02-SHIP-MANAGEMENT.md) | Quản lý tàu (Tạo, Sửa, Xóa) | 30 |
| 3 | [TC-03-WAITING-LIST.md](TC-03-WAITING-LIST.md) | Danh sách tàu chờ & Cập cầu | 18 |
| 4 | [TC-04-PLANNING-GRID.md](TC-04-PLANNING-GRID.md) | Planning Grid & Drag-Drop | 25 |
| 5 | [TC-05-OVERLAP-DETECTION.md](TC-05-OVERLAP-DETECTION.md) | Kiểm tra chồng lấn & Cảnh báo | 20 |
| 6 | [TC-06-IMPORT-EXCEL.md](TC-06-IMPORT-EXCEL.md) | Import từ Excel | 22 |
| 7 | [TC-07-SAVE-OPEN-JSON.md](TC-07-SAVE-OPEN-JSON.md) | Lưu/Mở file JSON | 15 |
| 8 | [TC-08-EXPORT-PDF.md](TC-08-EXPORT-PDF.md) | Xuất PDF & Báo cáo | 12 |
| 9 | [TC-09-STORAGE-AUTOSAVE.md](TC-09-STORAGE-AUTOSAVE.md) | localStorage & Auto-save | 14 |
| 10 | [TC-10-UI-LAYOUT.md](TC-10-UI-LAYOUT.md) | Giao diện & Layout | 20 |
| 11 | [TC-11-CRANE-MANAGEMENT.md](TC-11-CRANE-MANAGEMENT.md) | Quản lý cẩu | 12 |
| 12 | [TC-12-BERTH-UTILIZATION.md](TC-12-BERTH-UTILIZATION.md) | Hệ số sử dụng cầu bến | 15 |

**Tổng cộng: ~218 test cases**

---

## 3. Phân loại Test Case

### 3.1 Theo mức độ ưu tiên

| Mức | Mô tả | Tỷ lệ |
|-----|-------|-------|
| **P1 - Critical** | Chức năng cốt lõi, block nếu fail | ~30% |
| **P2 - High** | Chức năng quan trọng, ảnh hưởng workflow chính | ~40% |
| **P3 - Medium** | Chức năng phụ, UX/UI | ~20% |
| **P4 - Low** | Edge cases, tối ưu hóa | ~10% |

### 3.2 Theo loại kiểm thử

| Loại | Mô tả | Tool/Framework |
|------|-------|---------------|
| **Unit Test** | Test từng hàm/utility riêng lẻ | Jest |
| **Component Test** | Test React component render & interaction | React Testing Library |
| **Integration Test** | Test luồng nghiệp vụ end-to-end | React Testing Library + Jest |
| **Manual Test** | Test UI/UX, visual, drag-drop phức tạp | Manual |

---

## 4. Quy ước viết Test Case

### 4.1 Format mỗi Test Case

```
| TC-XX-YYY | Tên test case |
|-----------|---------------|
| **Mức ưu tiên** | P1/P2/P3/P4 |
| **Loại test** | Unit / Component / Integration / Manual |
| **Điều kiện tiên quyết** | Mô tả trạng thái ban đầu |
| **Bước thực hiện** | 1. Bước 1<br>2. Bước 2<br>... |
| **Kết quả mong đợi** | Mô tả chi tiết kết quả đúng |
| **Dữ liệu test** | Input data cần chuẩn bị (nếu có) |
```

### 4.2 Quy tắc đặt ID

- `TC-XX-YYY` trong đó:
  - `XX` = mã module (01-12)
  - `YYY` = số thứ tự test case (001-999)
- Ví dụ: `TC-02-005` = Module 02 (Ship Management), test case số 005

---

## 5. Môi trường kiểm thử

### 5.1 Test tự động (Jest + React Testing Library)

```bash
# Chạy tất cả tests
npm test

# Chạy test cụ thể
npm test -- --testPathPattern="berthUtilization"

# Chạy với coverage
npm test -- --coverage
```

### 5.2 Test thủ công

1. Khởi động ứng dụng: `npm start`
2. Mở trình duyệt tại `http://localhost:3000`
3. Nhập mật khẩu mặc định: `HoangTT`
4. Thực hiện test theo từng tài liệu test case

### 5.3 Dữ liệu test

| File | Mô tả |
|------|-------|
| `data/mau.json` | Dữ liệu mẫu cầu bến |
| `data/berth_*.json` | File JSON mẫu để test Open |
| `scripts/create_sample_xlsx.js` | Script tạo file Excel mẫu |

---

## 6. Tiêu chí đạt/không đạt

### 6.1 Tiêu chí PASS cho mỗi module

- 100% test cases P1 (Critical) phải PASS
- ≥ 95% test cases P2 (High) phải PASS
- ≥ 85% test cases P3 (Medium) phải PASS
- P4 (Low) không bắt buộc nhưng khuyến khích

### 6.2 Tiêu chí PASS tổng thể

- Tất cả module đều đạt tiêu chí riêng
- Không có bug severity Critical hoặc Major chưa được sửa
- Tất cả luồng nghiệp vụ chính hoạt động đúng:
  1. Tạo tàu → Kéo vào grid → Di chuyển → Lưu file
  2. Import Excel → Preview → Import → Kiểm tra trên grid
  3. Auto-save → Reload → Khôi phục state

---

## 7. Rủi ro và giải pháp

| Rủi ro | Mức độ | Giải pháp |
|--------|--------|-----------|
| Drag-drop khó test tự động | Cao | Kết hợp manual test + fireEvent.mouseDown/Move/Up |
| localStorage giới hạn dung lượng | Trung bình | Test với dữ liệu lớn (50+ tàu) |
| html2canvas render khác trên các trình duyệt | Trung bình | Test PDF export trên Chrome + Edge |
| SheetJS parse date format khác nhau | Cao | Chuẩn bị nhiều file Excel mẫu với format khác nhau |
| CSS rendering khác nhau giữa trình duyệt | Thấp | Test visual trên trình duyệt chính (Chrome) |
