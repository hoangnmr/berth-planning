# TC-07: LƯU / MỞ FILE JSON

> **Module:** Save/Open JSON Plan  
> **Tài liệu tham chiếu:** [06-IMPORT-EXPORT.md](../06-IMPORT-EXPORT.md) - Mục 2  
> **Tổng số test cases:** 15

---

## 1. Lưu file JSON (Save)

### TC-07-001: Lưu file JSON thành công

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Có dữ liệu trên grid (berthedShips, waitingShips) |
| **Bước thực hiện** | 1. Click ⚙ Menu<br>2. Click "💾 Lưu Kế hoạch" |
| **Kết quả mong đợi** | - File .json được download<br>- Tên file: "berth_DD_MM_YY-HH_MM_SS.json"<br>- File chứa đầy đủ: version, savedAt, startDate, numDays, berthedShips, waitingShips, cranes |

---

### TC-07-002: Cấu trúc file JSON đúng format

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Unit / Integration |
| **Điều kiện tiên quyết** | File JSON vừa lưu |
| **Bước thực hiện** | 1. Mở file JSON bằng text editor<br>2. Kiểm tra cấu trúc |
| **Kết quả mong đợi** | - JSON hợp lệ (parse được)<br>- Có field: version, savedAt, startDate, numDays<br>- berthedShips: array, mỗi ship có id, name, loa, berthName, start, end, eta (ISO string), etd, style<br>- waitingShips: array<br>- cranes: object {GW1: %, GW2: %, ...} |

---

### TC-07-003: Date được serialize thành ISO string

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | File JSON vừa lưu |
| **Bước thực hiện** | 1. Kiểm tra field eta, etd, startDate trong file |
| **Kết quả mong đợi** | - eta: "2025-06-05T07:00:00.000Z" (ISO format)<br>- etd: ISO format<br>- startDate: "2025-06-05" (date only) |

---

### TC-07-004: Lưu khi không có dữ liệu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Grid trống, waiting list trống |
| **Bước thực hiện** | 1. Click "💾 Lưu Kế hoạch" |
| **Kết quả mong đợi** | - File vẫn được lưu<br>- berthedShips: [], waitingShips: []<br>- startDate và numDays có giá trị mặc định |

---

### TC-07-005: Tên file theo format đúng

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Không |
| **Bước thực hiện** | 1. Lưu file JSON<br>2. Kiểm tra tên file download |
| **Kết quả mong đợi** | - Format: "berth_DD_MM_YY-HH_MM_SS.json"<br>- Ví dụ: "berth_05_06_25-14_30_00.json"<br>- Timestamp khớp với thời điểm lưu |

---

## 2. Mở file JSON (Open)

### TC-07-006: Mở file JSON hợp lệ

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Có file JSON đã lưu trước đó |
| **Bước thực hiện** | 1. Click ⚙ Menu<br>2. Click "📂 Mở Kế hoạch"<br>3. Chọn file .json |
| **Kết quả mong đợi** | - Dữ liệu hiện tại bị thay thế hoàn toàn<br>- berthedShips xuất hiện trên grid đúng vị trí<br>- waitingShips xuất hiện trong danh sách chờ<br>- startDate, numDays khôi phục đúng<br>- Toast: "Đã mở file thành công" |

---

### TC-07-007: Date ISO string được deserialize thành Date object

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Mở file JSON chứa tàu có ETA/ETD |
| **Bước thực hiện** | 1. Mở file JSON<br>2. Click vào tàu để xem Detail Panel |
| **Kết quả mong đợi** | - ETA/ETD hiển thị đúng dạng datetime-local<br>- Tàu render đúng vị trí dọc (top/height tính từ Date object) |

---

### TC-07-008: Khôi phục vị trí cẩu từ file JSON

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | File JSON có field cranes: {GW1: 25, GW2: 80, ...} |
| **Bước thực hiện** | 1. Di chuyển cẩu trước khi lưu<br>2. Lưu file JSON<br>3. Mở lại file JSON |
| **Kết quả mong đợi** | - Cẩu GW1 ở vị trí 25%, GW2 ở 80%...<br>- Vị trí cẩu khớp với lúc lưu |

---

### TC-07-009: Mở file JSON không hợp lệ (không phải JSON)

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | File text bình thường (.txt hoặc .json có nội dung không hợp lệ) |
| **Bước thực hiện** | 1. Click "📂 Mở Kế hoạch"<br>2. Chọn file không phải JSON hoặc JSON sai format |
| **Kết quả mong đợi** | - Toast error: "File không hợp lệ" hoặc tương tự<br>- Kế hoạch hiện tại KHÔNG bị thay đổi |

---

### TC-07-010: Mở file JSON thiếu berthedShips

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | File JSON chỉ có version, savedAt (thiếu berthedShips) |
| **Bước thực hiện** | 1. Mở file |
| **Kết quả mong đợi** | - Validation fail → Toast error<br>- Hoặc: load với berthedShips = [] (fallback) |

---

## 3. Round-trip (Lưu rồi Mở lại)

### TC-07-011: Round-trip - dữ liệu khớp 100%

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | 5 tàu trên grid, 3 tàu waiting, cẩu đã di chuyển |
| **Bước thực hiện** | 1. Ghi nhớ state hiện tại (tên, vị trí, thời gian tất cả tàu)<br>2. Lưu file JSON<br>3. Xóa kế hoạch hoặc reload<br>4. Mở file JSON vừa lưu |
| **Kết quả mong đợi** | - Tất cả tàu khôi phục đúng vị trí, tên, thời gian<br>- Waiting list đúng<br>- startDate, numDays khớp<br>- Cẩu đúng vị trí<br>- Không mất dữ liệu nào |

---

### TC-07-012: Round-trip - tàu có đầy đủ field mở rộng

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Tàu có: imo, nationalID, draftIn, draftOut, ton, agent, notes |
| **Bước thực hiện** | 1. Lưu → Mở lại → Kiểm tra Detail Panel |
| **Kết quả mong đợi** | - Tất cả field mở rộng được giữ nguyên<br>- Không bị mất thông tin phụ |

---

## 4. Backward Compatibility

### TC-07-013: Mở file JSON phiên bản cũ

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | File JSON không có field "version" hoặc version="1.0" |
| **Bước thực hiện** | 1. Mở file JSON cũ |
| **Kết quả mong đợi** | - File vẫn mở được<br>- Các field thiếu có giá trị mặc định |

---

### TC-07-014: Mở file JSON có thêm field không xác định

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P4 - Low |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | File JSON có thêm field lạ (customField: "value") |
| **Bước thực hiện** | 1. Mở file |
| **Kết quả mong đợi** | - Mở thành công, field lạ bị bỏ qua<br>- Không crash |

---

### TC-07-015: Mở file JSON từ thư mục data/ mẫu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Có file mẫu: data/berth_05_11_25-19_50_48.json |
| **Bước thực hiện** | 1. Mở file mẫu từ thư mục data/ |
| **Kết quả mong đợi** | - File load thành công<br>- Dữ liệu mẫu hiển thị đúng trên grid<br>- Không có lỗi parse |

---

## 5. Ma trận Test Coverage

| Tính năng | P1 | P2 | P3 | P4 | Tổng |
|-----------|----|----|----|----|------|
| Lưu file JSON | 2 | 1 | 2 | 0 | 5 |
| Mở file JSON | 2 | 2 | 1 | 0 | 5 |
| Round-trip | 1 | 1 | 0 | 0 | 2 |
| Backward compatibility | 0 | 1 | 1 | 1 | 3 |
| **Tổng** | **5** | **5** | **4** | **1** | **15** |
