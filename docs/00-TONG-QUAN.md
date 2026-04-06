# BERTH PLANNING - TÂN THUẬN

## Tổng quan hệ thống

**Tên hệ thống:** HỆ THỐNG QUẢN LÝ CẦU BẾN (Berth Planning)  
**Mục đích:** Lập kế hoạch và quản lý vị trí cập cầu của các tàu tại cảng Tân Thuận (Trung tâm Điều hành Khai thác Khu vực Tân Thuận).  
**Phạm vi:** Quản lý 5 cầu bến (K12C, K12A, K12, K12B, TT2), hệ thống cẩu, danh sách tàu chờ và tàu đã cập cầu.

---

## Mục lục tài liệu

| # | File | Nội dung |
|---|------|----------|
| 1 | [01-KIEN-TRUC-HE-THONG.md](01-KIEN-TRUC-HE-THONG.md) | Kiến trúc, công nghệ, cấu trúc thư mục |
| 2 | [02-DU-LIEU-CAU-BEN.md](02-DU-LIEU-CAU-BEN.md) | Mô hình dữ liệu cầu bến, pitch, cẩu |
| 3 | [03-GIAO-DIEN-TONG-THE.md](03-GIAO-DIEN-TONG-THE.md) | Mô tả chi tiết giao diện tổng thể |
| 4 | [04-QUAN-LY-TAU.md](04-QUAN-LY-TAU.md) | Tạo tàu, chỉnh sửa, xóa, waiting list |
| 5 | [05-PLANNER-GRID.md](05-PLANNER-GRID.md) | Planning Grid - Kéo thả, cập cầu, overlap |
| 6 | [06-IMPORT-EXPORT.md](06-IMPORT-EXPORT.md) | Import Excel, Save/Open JSON, Export PDF |
| 7 | [07-TINH-NANG-KHAC.md](07-TINH-NANG-KHAC.md) | Authentication, localStorage, toast, modal |

---

## Cách sử dụng tài liệu

1. Đọc **00-TONG-QUAN.md** (file này) để nắm bức tranh tổng quan
2. Đọc **01-KIEN-TRUC-HE-THONG.md** để hiểu kiến trúc, công nghệ, cấu trúc thư mục
3. Đọc **02-DU-LIEU-CAU-BEN.md** để hiểu data model (cầu bến, tàu, cẩu, pitch)
4. Đọc **03-GIAO-DIEN-TONG-THE.md** để hiểu chi tiết layout và thành phần UI
5. Đọc **04-QUAN-LY-TAU.md** để nắm luồng quản lý tàu (tạo, sửa, xóa, cập cầu)
6. Đọc **05-PLANNER-GRID.md** để hiểu Planning Grid, drag & drop, overlap detection
7. Đọc **06-IMPORT-EXPORT.md** cho phần import Excel, save/open JSON, export PDF
8. Đọc **07-TINH-NANG-KHAC.md** cho các tính năng phụ (auth, storage, toast, utilization)

---

## Chức năng chính

### 1. Quản lý Cầu bến (Berth Management)
- Hiển thị 5 cầu bến theo tỷ lệ thực (tổng 1005m): K12C (189m), K12A (132m), K12 (188m), K12B (204m), TT2 (222m)
- Các gap (khoảng trống) giữa các cầu: 10m đầu, 30m (K12C-K12A), 20m (K12B-TT2), 10m cuối
- Hiển thị pitch ruler (thước đo mét) theo từng cầu bến
- Quản lý và hiển thị vị trí cẩu (GW1-GW5, GC1-GC2, LB1, LB40) có thể kéo thả

### 2. Quản lý Tàu (Ship Management)
- Tạo tàu mới (tên, DWT, LOA, BEAM, loại hàng, số lượng)
- Danh sách tàu chờ cầu (Waiting List) - sắp xếp theo ETA
- Chi tiết tàu (Detail Panel) - chỉnh sửa toàn bộ thông tin
- Xóa tàu, chuyển tàu giữa waiting list và planner

### 3. Lập kế hoạch cập cầu (Berth Planning)
- **Planning Grid 2 chiều:** Trục X = vị trí mét trên cầu, Trục Y = thời gian (NGÀY/ĐÊM mỗi slot 12 giờ)
- **Drag & Drop:** Kéo thả tàu từ waiting list vào grid, hoặc di chuyển tàu trong grid
- **Kiểm tra chồng lấn (Overlap Detection):** Tự động phát hiện xung đột vị trí/thời gian
- **Cảnh báo khoảng cách:** Cảnh báo khi khoảng cách giữa 2 tàu < 10% LOA tàu lớn hơn
- **Snap to slot:** Tự động snap vào mốc thời gian khi kết thúc drag

### 4. Import / Export
- Import kế hoạch từ file Excel (.xlsx) với preview và validation
- Mở/Lưu kế hoạch dạng JSON
- Xuất PDF từ planning grid
- Xuất báo cáo chi tiết HTML (biểu đồ, thống kê)

### 5. Lưu trữ tự động
- Auto-save state vào localStorage
- Khôi phục state khi reload trang

---

## Workflow tổng quan

```
[Khởi động] → [Nhập mật khẩu] → [Tải state từ localStorage]
     ↓
[Giao diện chính]
  ├── [Header]: Chọn ngày bắt đầu, số ngày hiển thị, menu tùy chọn
  ├── [Planner Area]:
  │   ├── [Berth Header]: Tên cầu bến + vị trí cẩu
  │   ├── [Pitch Ruler]: Thước đo mét
  │   └── [Planning Grid]: Grid 2D (Thời gian × Vị trí)
  │       ├── Tàu đã cập cầu (drag & drop)
  │       └── Highlight overlap/gap warning
  └── [Right Sidebar]:
      ├── [Control Panel]: Tạo tàu + Waiting List (khi không chọn tàu)
      └── [Detail Panel]: Chỉnh sửa chi tiết tàu (khi chọn tàu)
  [Footer]: © Copyright
```

**Lưu ý:** Header Menu (⚙) còn có chức năng **Đổi mật khẩu** (ChangePasswordModal).

---

## Loại hàng hóa

| Loại hàng | Mã màu CSS | Đơn vị |
|-----------|-----------|--------|
| Container | Orange (#f97316) | TEUs / Cont |
| Sắt thép | Green (#16a34a) | Tấn |
| Hàng khác | Blue (#2563eb) | Tấn |

---

## Nhóm cầu bến (Berth Groups)

Các cầu bến được nhóm theo khả năng chồng lấn (overlap):

| Nhóm | Các cầu | Ghi chú |
|------|---------|---------|
| Nhóm 1 | K12C | Độc lập, hệ quy chiếu riêng (refStart=10) |
| Nhóm 2 | K12A, K12, K12B | Chung hệ quy chiếu (refStart=229), có thể overlap lẫn nhau |
| Nhóm 3 | TT2 | Độc lập, hệ quy chiếu riêng (refStart=773) |

---

## Công nghệ sử dụng (phiên bản hiện tại)

| Công nghệ | Version | Mục đích |
|-----------|---------|----------|
| React | 18.3.1 | UI Framework |
| Create React App | 5.0.1 | Build toolchain |
| SheetJS (xlsx) | 0.18.5 | Đọc/ghi file Excel |
| jsPDF | 3.0.3 | Xuất PDF |
| html2canvas | 1.4.1 | Capture DOM thành canvas cho PDF |
| CSS thuần | - | Styling (không dùng UI library) |
| localStorage | - | Lưu trữ client-side |
| Jest + React Testing Library | - | Unit testing (có sẵn tests cho position-mapping, berthUtilization, BerthedShip drag) |

> **Lưu ý:** Không sử dụng state management library (Redux/Zustand), không có backend/API, toàn bộ logic client-side.

---

## Bản quyền

© Nguyen Hoang & Ban Khai thac | Trung tam DHKT KV TAN THUAN
