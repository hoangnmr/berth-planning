# TC-10: GIAO DIỆN & LAYOUT

> **Module:** UI Layout, Responsive, Header, Footer, Modals, Toast  
> **Tài liệu tham chiếu:** [03-GIAO-DIEN-TONG-THE.md](../03-GIAO-DIEN-TONG-THE.md)  
> **Tổng số test cases:** 20

---

## 1. Layout tổng thể

### TC-10-001: Layout 3 phần chính hiển thị đúng

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Đã đăng nhập thành công |
| **Bước thực hiện** | 1. Quan sát giao diện chính |
| **Kết quả mong đợi** | - **Header** (60px, fixed) phía trên<br>- **Planner Area** + **Right Sidebar** ở giữa<br>- **Footer** phía dưới<br>- Full viewport height (100vh) |

---

### TC-10-002: Right Sidebar chiều rộng cố định

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Ứng dụng đã load |
| **Bước thực hiện** | 1. Quan sát Sidebar bên phải<br>2. Resize cửa sổ trình duyệt |
| **Kết quả mong đợi** | - Sidebar có chiều rộng cố định (~300px)<br>- Planner Area co giãn theo browser width<br>- Sidebar không bị ẩn khi resize |

---

### TC-10-003: Grid scroll cả 2 chiều

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | numDays = 30 (grid dài), cửa sổ nhỏ |
| **Bước thực hiện** | 1. Scroll dọc trong Planner Area<br>2. Thu nhỏ cửa sổ → scroll ngang |
| **Kết quả mong đợi** | - Scroll dọc hoạt động mượt<br>- Scroll ngang xuất hiện khi cần<br>- Timeline (trục Y) scroll cùng với grid |

---

## 2. Header

### TC-10-004: Header hiển thị đầy đủ thành phần

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Ứng dụng đã load |
| **Bước thực hiện** | 1. Quan sát Header |
| **Kết quả mong đợi** | - Tiêu đề: "HỆ THỐNG QUẢN LÝ CẦU BẾN (Berth Planning)"<br>- Date picker với nút ◀/▶<br>- Dropdown số ngày<br>- Nút ⚙ Menu |

---

### TC-10-005: Menu dropdown mở và đóng đúng

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Ứng dụng đã load |
| **Bước thực hiện** | 1. Click nút ⚙<br>2. Menu dropdown hiện<br>3. Click ra ngoài menu |
| **Kết quả mong đợi** | - Click ⚙ → Menu mở<br>- Menu chứa: Mở, Lưu, Import, Xuất PDF, Xuất Báo cáo, Đổi Mật khẩu, Xóa<br>- Click ra ngoài → Menu tự đóng<br>- "Xóa Kế hoạch" hiển thị text màu đỏ |

---

### TC-10-006: Date picker hoạt động đúng

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Ứng dụng đã load |
| **Bước thực hiện** | 1. Click vào date input<br>2. Chọn ngày mới<br>3. Click nút ◀ (giảm ngày)<br>4. Click nút ▶ (tăng ngày) |
| **Kết quả mong đợi** | - Date input type="date" hiển thị đúng<br>- Chọn ngày → grid cập nhật<br>- ◀ giảm 1 ngày, ▶ tăng 1 ngày |

---

## 3. Footer

### TC-10-007: Footer hiển thị copyright

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Ứng dụng đã load |
| **Bước thực hiện** | 1. Scroll xuống cuối trang |
| **Kết quả mong đợi** | - Footer: "© Nguyen Hoang & Ban Khai thac \| Trung tam DHKT KV TAN THUAN"<br>- Font nhỏ, màu xám, căn giữa |

---

## 4. Toast Notifications

### TC-10-008: Toast success hiển thị đúng

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Thực hiện action thành công (tạo tàu, lưu file) |
| **Bước thực hiện** | 1. Tạo tàu mới thành công |
| **Kết quả mong đợi** | - Toast hiển thị góc trên bên phải<br>- Nền xanh lá (#4caf50), icon ✓<br>- Message phù hợp |

---

### TC-10-009: Toast tự ẩn sau 2.5 giây

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Toast đang hiển thị |
| **Bước thực hiện** | 1. Đợi 2.5 giây |
| **Kết quả mong đợi** | - Toast tự ẩn với animation fade-out<br>- Không cần user tương tác |

---

### TC-10-010: Toast đóng bằng nút X

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Toast đang hiển thị |
| **Bước thực hiện** | 1. Click nút X trên toast |
| **Kết quả mong đợi** | - Toast đóng ngay lập tức |

---

### TC-10-011: Nhiều toast stack từ trên xuống

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Trigger nhiều action liên tiếp |
| **Bước thực hiện** | 1. Tạo nhanh 3 tàu liên tiếp |
| **Kết quả mong đợi** | - 3 toast hiển thị cùng lúc<br>- Stack từ trên xuống<br>- Mỗi toast tự ẩn sau 2.5s |

---

### TC-10-012: Toast 4 loại khác nhau

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Không |
| **Bước thực hiện** | 1. Trigger success (tạo tàu)<br>2. Trigger error (overlap)<br>3. Trigger warning (gap warning)<br>4. Trigger info (chuyển tàu về waiting) |
| **Kết quả mong đợi** | - Success: xanh lá, icon ✓<br>- Error: đỏ, icon ✕<br>- Warning: vàng, icon ⚠<br>- Info: xanh dương, icon ℹ |

---

## 5. Confirm Modal

### TC-10-013: Confirm Modal hiển thị đúng

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Click xóa tàu → ConfirmModal hiển thị |
| **Bước thực hiện** | 1. Quan sát ConfirmModal |
| **Kết quả mong đợi** | - Overlay semi-transparent dark<br>- Modal box centered, white, rounded<br>- Tiêu đề + message + 2 nút (Hủy / Xác nhận)<br>- z-index cao (10000) |

---

### TC-10-014: Confirm Modal - nút Hủy và Xác nhận

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | ConfirmModal đang hiển thị |
| **Bước thực hiện** | 1. Click "Hủy" → kiểm tra<br>2. Mở lại → Click "Xác nhận" → kiểm tra |
| **Kết quả mong đợi** | - Hủy: Modal đóng, không thực hiện action<br>- Xác nhận: Modal đóng, action được thực hiện |

---

## 6. Password Modal

### TC-10-015: Password Modal UI

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Mở ứng dụng |
| **Bước thực hiện** | 1. Quan sát Password Modal |
| **Kết quả mong đợi** | - Backdrop blur + overlay<br>- Input password<br>- Nút "Vào chương trình"<br>- Hiển thị mật khẩu hiện tại (italic, xám) |

---

## 7. Responsive Behavior

### TC-10-016: Header wrap khi màn hình nhỏ

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Resize browser nhỏ |
| **Bước thực hiện** | 1. Thu nhỏ cửa sổ trình duyệt < 900px |
| **Kết quả mong đợi** | - Header buttons tự wrap xuống dòng<br>- Vẫn truy cập được tất cả nút |

---

### TC-10-017: Import Modal ẩn cột khi < 900px

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P4 - Low |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Import Modal mở, browser < 900px |
| **Bước thực hiện** | 1. Resize browser nhỏ<br>2. Mở Import Modal |
| **Kết quả mong đợi** | - Cột từ cột thứ 8 trở đi bị ẩn<br>- Table vẫn hiển thị thông tin chính |

---

## 8. Print Support

### TC-10-018: CSS @media print

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P4 - Low |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Ứng dụng đã load với dữ liệu |
| **Bước thực hiện** | 1. Ctrl+P (Print dialog)<br>2. Kiểm tra preview |
| **Kết quả mong đợi** | - A4 landscape<br>- Controls ẩn khi in<br>- Grid hiển thị đúng<br>- Table không bị chia trang giữa chừng |

---

## 9. Sidebar Toggle

### TC-10-019: Sidebar chuyển đổi Control Panel ↔ Detail Panel

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Ứng dụng có tàu |
| **Bước thực hiện** | 1. Không chọn tàu → quan sát Sidebar<br>2. Click tàu → quan sát Sidebar<br>3. Click ✕ trên Detail Panel |
| **Kết quả mong đợi** | - Bước 1: Control Panel (form + waiting list)<br>- Bước 2: Detail Panel thay thế<br>- Bước 3: Quay về Control Panel |

---

### TC-10-020: Gap border dashed giữa các cầu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P4 - Low |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Ứng dụng đã load |
| **Bước thực hiện** | 1. Quan sát khoảng trống giữa các cầu trên Berth Header và Grid |
| **Kết quả mong đợi** | - Gap 10m đầu, 30m (K12C-K12A), 20m (K12B-TT2), 10m cuối<br>- Nền trắng, border dashed<br>- Chiều rộng tỷ lệ với mét thực |

---

## 10. Ma trận Test Coverage

| Tính năng | P1 | P2 | P3 | P4 | Tổng |
|-----------|----|----|----|----|------|
| Layout tổng thể | 1 | 2 | 0 | 0 | 3 |
| Header | 1 | 2 | 0 | 0 | 3 |
| Footer | 0 | 0 | 1 | 0 | 1 |
| Toast | 0 | 2 | 3 | 0 | 5 |
| Confirm Modal | 0 | 2 | 0 | 0 | 2 |
| Password Modal | 0 | 1 | 0 | 0 | 1 |
| Responsive | 0 | 0 | 1 | 1 | 2 |
| Print | 0 | 0 | 0 | 1 | 1 |
| Sidebar toggle | 1 | 0 | 0 | 0 | 1 |
| Visual elements | 0 | 0 | 0 | 1 | 1 |
| **Tổng** | **3** | **9** | **5** | **3** | **20** |
