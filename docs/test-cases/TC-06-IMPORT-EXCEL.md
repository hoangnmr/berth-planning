# TC-06: IMPORT TỪ EXCEL

> **Module:** Import Excel (.xlsx/.xls)  
> **Tài liệu tham chiếu:** [06-IMPORT-EXPORT.md](../06-IMPORT-EXPORT.md) - Mục 1  
> **Tổng số test cases:** 22

---

## 1. Khởi tạo Import

### TC-06-001: Mở dialog Import Excel từ menu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Đã đăng nhập, có dữ liệu trên grid |
| **Bước thực hiện** | 1. Click ⚙ Menu<br>2. Click "📊 Import kế hoạch từ EXCEL" |
| **Kết quả mong đợi** | - ConfirmModal hiển thị: "Bạn có chắc muốn xóa kế hoạch hiện tại trước khi import?"<br>- Nút "Hủy" và "Xóa và Import" |

---

### TC-06-002: Hủy Import - giữ nguyên kế hoạch

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | ConfirmModal import đang hiển thị |
| **Bước thực hiện** | 1. Click "Hủy" |
| **Kết quả mong đợi** | - Modal đóng<br>- Kế hoạch hiện tại không bị xóa<br>- Không mở file dialog |

---

### TC-06-003: Xác nhận Import - xóa kế hoạch cũ và mở file dialog

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | ConfirmModal import đang hiển thị, có 5 tàu trên grid |
| **Bước thực hiện** | 1. Click "Xóa và Import" |
| **Kết quả mong đợi** | - Kế hoạch hiện tại bị xóa (clearPlan)<br>- File dialog mở, chấp nhận .xlsx/.xls |

---

## 2. Đọc và Parse file Excel

### TC-06-004: Import file Excel hợp lệ - header tiếng Việt

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | File Excel với header: "Tên tàu", "LOA", "Loại hàng", "ETA", "ETD", "Cầu" |
| **Bước thực hiện** | 1. Chọn file Excel<br>2. Chờ parse hoàn tất |
| **Kết quả mong đợi** | - ImportModal mở với preview table<br>- Mỗi row được parse thành ship object<br>- Header được mapping đúng (Tên tàu → shipName, LOA → loa, ...) |
| **Dữ liệu test** | File .xlsx có 10 dòng với header tiếng Việt |

---

### TC-06-005: Import file Excel - header tiếng Anh

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | File Excel với header: "Ship Name", "LOA", "Cargo Type", "ETA", "ETD", "Berth" |
| **Bước thực hiện** | 1. Chọn file Excel tiếng Anh |
| **Kết quả mong đợi** | - ImportModal mở, parse đúng tất cả cột<br>- Header tiếng Anh được mapping tương đương tiếng Việt |

---

### TC-06-006: Import file Excel - ưu tiên sheet "Ships"

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | File Excel có nhiều sheet, 1 sheet tên "Ships" |
| **Bước thực hiện** | 1. Chọn file Excel |
| **Kết quả mong đợi** | - Dữ liệu lấy từ sheet "Ships"<br>- Nếu không có sheet "Ships" → lấy sheet đầu tiên |

---

## 3. Parse Date/Time

### TC-06-007: Parse date format DD/MM/YYYY HH:mm

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Không |
| **Bước thực hiện** | 1. Parse "15/06/2025 08:30" |
| **Kết quả mong đợi** | - Date: 15/06/2025 08:30<br>- year=2025, month=6, day=15, hour=8, minute=30 |

---

### TC-06-008: Parse date format ISO string

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Không |
| **Bước thực hiện** | 1. Parse "2025-06-15T08:00:00" |
| **Kết quả mong đợi** | - Date: 15/06/2025 08:00 |

---

### TC-06-009: Parse date format Excel serial number

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Không |
| **Bước thực hiện** | 1. Parse 45823.5 (Excel serial) |
| **Kết quả mong đợi** | - Date được chuyển đổi đúng từ serial number<br>- Tính: (45823.5 - 25569) * 86400000 ms + UTC offset |

---

### TC-06-010: Parse date format DD/MM/YYYY (không có giờ)

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Không |
| **Bước thực hiện** | 1. Parse "15/06/2025" |
| **Kết quả mong đợi** | - Date: 15/06/2025 07:00 (mặc định 07:00 sáng) |

---

### TC-06-011: Parse date không hợp lệ

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Không |
| **Bước thực hiện** | 1. Parse "invalid-date"<br>2. Parse ""<br>3. Parse null |
| **Kết quả mong đợi** | - Return null<br>- Row bị đánh dấu error trong preview |

---

## 4. Validation

### TC-06-012: Row hợp lệ - đầy đủ thông tin

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Row: tên="SHIP A", LOA=180, ETA=05/06, ETD=07/06, berth=K12 |
| **Bước thực hiện** | 1. Import file chứa row này |
| **Kết quả mong đợi** | - Row hiển thị nền xanh lá (valid)<br>- Checkbox có thể check<br>- Trạng thái: hợp lệ |

---

### TC-06-013: Row lỗi - thiếu tên tàu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Row: tên rỗng, LOA=180 |
| **Bước thực hiện** | 1. Import file chứa row này |
| **Kết quả mong đợi** | - Row hiển thị nền đỏ nhạt (error)<br>- Checkbox disabled, không import được<br>- Cột "Kiểm tra" hiện "Thiếu tên tàu" |

---

### TC-06-014: Row lỗi - LOA không phải số

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Row: tên="SHIP", LOA="abc" |
| **Bước thực hiện** | 1. Import file chứa row này |
| **Kết quả mong đợi** | - Row bị đánh dấu error hoặc LOA được mặc định |

---

### TC-06-015: Row warning - không có berth

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Row: tên="SHIP", LOA=180, ETA, ETD nhưng KHÔNG có berth |
| **Bước thực hiện** | 1. Import file chứa row này |
| **Kết quả mong đợi** | - Row hiển thị nền vàng (warning)<br>- Ghi chú: "Sẽ chuyển vào danh sách chờ"<br>- Vẫn có thể check để import |

---

### TC-06-016: Row warning - ETD trước ETA

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Row: ETA=10/06, ETD=08/06 |
| **Bước thực hiện** | 1. Import file chứa row này |
| **Kết quả mong đợi** | - Row bị đánh dấu error<br>- Thông báo "ETD trước ETA" |

---

### TC-06-017: Row conflict - overlap với tàu trên grid

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Grid đã có tàu. Import row trùng vị trí & thời gian |
| **Bước thực hiện** | 1. Import file chứa tàu conflict |
| **Kết quả mong đợi** | - Row hiển thị nền cam (conflict)<br>- Cột "Xung đột" hiển thị tên tàu bị overlap<br>- User vẫn có thể chọn import (tự chịu trách nhiệm) |

---

## 5. Import Modal Preview

### TC-06-018: Import Modal hiển thị đúng thống kê

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Import file có 15 rows: 12 valid, 3 error |
| **Bước thực hiện** | 1. Quan sát Import Modal |
| **Kết quả mong đợi** | - Header: "Tổng: 15 tàu \| Hợp lệ: 12 \| Lỗi: 3"<br>- 12 row có checkbox, 3 row disabled<br>- Nút import hiển thị số: "Import (12)" |

---

### TC-06-019: Chọn/bỏ chọn tất cả

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Import Modal đang mở |
| **Bước thực hiện** | 1. Click "Bỏ chọn tất cả"<br>2. Kiểm tra → tất cả unchecked<br>3. Click "Chọn tất cả"<br>4. Kiểm tra |
| **Kết quả mong đợi** | - "Bỏ chọn": tất cả valid rows unchecked, nút "Import (0)"<br>- "Chọn tất cả": tất cả valid rows checked lại<br>- Error rows vẫn disabled |

---

## 6. Xử lý sau Import

### TC-06-020: Import tàu có berth → vào berthedShips

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Import Modal, chọn tàu có berth = "K12" |
| **Bước thực hiện** | 1. Chọn tàu hợp lệ<br>2. Click "Nhập mục đã chọn" |
| **Kết quả mong đợi** | - Tàu xuất hiện trên Planning Grid tại vị trí K12<br>- Style (left, width, top, height) được tính đúng<br>- Modal đóng<br>- Toast: "Đã import X tàu, Y vào cầu, Z vào danh sách chờ" |

---

### TC-06-021: Import tàu không có berth → vào waitingShips

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Import Modal, chọn tàu không có berthName |
| **Bước thực hiện** | 1. Chọn tàu không có berth<br>2. Click "Nhập mục đã chọn" |
| **Kết quả mong đợi** | - Tàu xuất hiện trong waiting list (không trên grid)<br>- WaitingShipCard hiển thị thông tin đã import |

---

### TC-06-022: Import tự động điều chỉnh startDate và numDays

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | startDate hiện tại = 01/06, numDays = 7. Import tàu ETA=15/06, ETD=20/06 |
| **Bước thực hiện** | 1. Import tàu có ETA ngoài khung ngày hiện tại |
| **Kết quả mong đợi** | - startDate tự động điều chỉnh để bao phủ dữ liệu import<br>- numDays tự động tăng nếu cần<br>- Tàu import nằm trong khung ngày mới |

---

## 7. Ma trận Test Coverage

| Tính năng | P1 | P2 | P3 | P4 | Tổng |
|-----------|----|----|----|----|------|
| Khởi tạo Import | 2 | 1 | 0 | 0 | 3 |
| Parse file & headers | 1 | 1 | 1 | 0 | 3 |
| Parse date | 1 | 4 | 0 | 0 | 5 |
| Validation | 2 | 4 | 0 | 0 | 6 |
| Import Modal UI | 0 | 1 | 1 | 0 | 2 |
| Xử lý sau import | 2 | 1 | 0 | 0 | 3 |
| **Tổng** | **8** | **12** | **2** | **0** | **22** |
