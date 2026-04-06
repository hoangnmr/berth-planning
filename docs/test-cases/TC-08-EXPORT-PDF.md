# TC-08: XUẤT PDF & BÁO CÁO

> **Module:** Export PDF, HTML Report  
> **Tài liệu tham chiếu:** [06-IMPORT-EXPORT.md](../06-IMPORT-EXPORT.md) - Mục 3, 4  
> **Tổng số test cases:** 12

---

## 1. Export PDF

### TC-08-001: Xuất PDF thành công

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Có dữ liệu trên grid (nhiều tàu) |
| **Bước thực hiện** | 1. Click ⚙ Menu<br>2. Click "📄 Xuất PDF"<br>3. Chờ quá trình xuất hoàn tất |
| **Kết quả mong đợi** | - Toast "Đang chuẩn bị..." → "Đang tạo PDF..." → "Xuất thành công"<br>- File PDF được download<br>- File PDF mở được, hiển thị planning grid |

---

### TC-08-002: PDF chứa đúng nội dung planning grid

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | File PDF vừa xuất |
| **Bước thực hiện** | 1. Mở file PDF<br>2. Kiểm tra nội dung |
| **Kết quả mong đợi** | - Berth Header (tên cầu) hiển thị<br>- Pitch Ruler hiển thị<br>- Tàu trên grid hiển thị đúng vị trí, màu sắc<br>- Timeline (ngày/đêm) hiển thị<br>- Waiting list hiển thị |

---

### TC-08-003: PDF landscape A4

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | File PDF vừa xuất |
| **Bước thực hiện** | 1. Kiểm tra orientation và kích thước PDF |
| **Kết quả mong đợi** | - Trang nằm ngang (landscape)<br>- Kích thước xấp xỉ A4 landscape<br>- Nội dung không bị cắt ngang |

---

### TC-08-004: PDF chia trang khi nội dung dài

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Grid hiển thị 30+ ngày (nội dung rất dài) |
| **Bước thực hiện** | 1. Xuất PDF |
| **Kết quả mong đợi** | - PDF có nhiều trang<br>- Nội dung liền mạch giữa các trang<br>- Không mất dữ liệu khi chia trang |

---

### TC-08-005: Footer copyright trên mỗi trang

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | File PDF nhiều trang |
| **Bước thực hiện** | 1. Kiểm tra footer mỗi trang PDF |
| **Kết quả mong đợi** | - Mỗi trang có footer: "© Nguyen Hoang & Ban Khai thac \| Trung tam DHKT KV TAN THUAN"<br>- Font size 10, màu #555555, căn giữa |

---

### TC-08-006: Xuất PDF khi grid trống

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Grid không có tàu nào |
| **Bước thực hiện** | 1. Xuất PDF |
| **Kết quả mong đợi** | - PDF vẫn được tạo thành công<br>- Hiển thị grid trống với header và timeline<br>- Không crash |

---

### TC-08-007: Xử lý lỗi khi xuất PDF

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Giả lập lỗi (html2canvas fail hoặc DOM bất thường) |
| **Bước thực hiện** | 1. Trigger export PDF trong điều kiện bất thường |
| **Kết quả mong đợi** | - Toast error: "Lỗi khi xuất PDF!"<br>- Cleanup temporary elements (hidden container bị xóa)<br>- App không bị crash hoặc freeze |

---

### TC-08-008: Tên file PDF đúng format

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P4 - Low |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Không |
| **Bước thực hiện** | 1. Xuất PDF, kiểm tra tên file |
| **Kết quả mong đợi** | - Format: "berth_DD_MM_YY-HH_MM_SS.pdf"<br>- Timestamp khớp thời điểm xuất |

---

## 2. HTML Report (Báo cáo chi tiết)

### TC-08-009: Mở báo cáo HTML trong tab mới

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Có dữ liệu trên grid |
| **Bước thực hiện** | 1. Click ⚙ Menu<br>2. Click "📋 Xuất Báo cáo chi tiết" |
| **Kết quả mong đợi** | - Tab mới mở với báo cáo HTML<br>- Báo cáo chứa: thống kê tổng hợp, bảng chi tiết tàu<br>- CSV tự động download (encoding UTF-8 với BOM) |

---

### TC-08-010: Báo cáo HTML - bảng chi tiết tàu sortable

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Tab báo cáo HTML đang mở |
| **Bước thực hiện** | 1. Click header cột để sort<br>2. Sort theo tên, ETA, bến |
| **Kết quả mong đợi** | - Bảng sort đúng theo cột được click<br>- Toggle ascending/descending |

---

### TC-08-011: Báo cáo HTML - biểu đồ thống kê

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Tab báo cáo HTML đang mở |
| **Bước thực hiện** | 1. Kiểm tra phần biểu đồ |
| **Kết quả mong đợi** | - Biểu đồ Chart.js hiển thị<br>- Thống kê loại hàng (Container, Sắt thép, Hàng khác)<br>- Số liệu khớp với dữ liệu trên grid |

---

### TC-08-012: CSV download encoding UTF-8

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | File CSV vừa download từ báo cáo |
| **Bước thực hiện** | 1. Mở file CSV bằng Excel<br>2. Kiểm tra encoding |
| **Kết quả mong đợi** | - Tiếng Việt hiển thị đúng (có BOM \ufeff)<br>- Tên file: "berth_report_YYYYMMDD_HHmmss.csv"<br>- Dữ liệu đầy đủ, đúng format CSV |

---

## 3. Ma trận Test Coverage

| Tính năng | P1 | P2 | P3 | P4 | Tổng |
|-----------|----|----|----|----|------|
| Export PDF - basic | 2 | 2 | 1 | 0 | 5 |
| Export PDF - pagination | 0 | 1 | 1 | 1 | 3 |
| HTML Report | 0 | 1 | 2 | 0 | 3 |
| CSV download | 0 | 0 | 1 | 0 | 1 |
| **Tổng** | **2** | **4** | **5** | **1** | **12** |
