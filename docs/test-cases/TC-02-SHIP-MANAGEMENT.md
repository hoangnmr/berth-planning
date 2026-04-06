# TC-02: QUẢN LÝ TÀU (Ship Management)

> **Module:** Ship Management (Tạo, Sửa, Xóa tàu)  
> **Tài liệu tham chiếu:** [04-QUAN-LY-TAU.md](../04-QUAN-LY-TAU.md)  
> **Tổng số test cases:** 30

---

## 1. Tạo tàu mới (Add Ship)

### TC-02-001: Tạo tàu mới với đầy đủ thông tin

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Đã đăng nhập, Control Panel hiển thị (không có tàu nào được chọn) |
| **Bước thực hiện** | 1. Nhập "VINALINES STAR" vào ô Tên tàu<br>2. Nhập "1234567" vào ô IMO<br>3. Nhập "22000" vào ô DWT<br>4. Nhập "180" vào ô LOA<br>5. Nhập "28" vào ô BEAM<br>6. Chọn "Container" trong dropdown Loại hàng<br>7. Nhập "1200" vào ô Số lượng<br>8. Click "Thêm vào tàu chờ" |
| **Kết quả mong đợi** | - Tàu mới xuất hiện trong danh sách Tàu Đang Chờ Cầu<br>- Card hiển thị đúng tên, loại hàng, số lượng<br>- Toast success hiển thị<br>- Form được reset (các ô trống)<br>- Số đếm tàu chờ tăng thêm 1 |
| **Dữ liệu test** | Tên: VINALINES STAR, IMO: 1234567, DWT: 22000, LOA: 180, BEAM: 28, Cargo: Container, Qty: 1200 |

---

### TC-02-002: Tạo tàu chỉ với tên (thông tin tối thiểu)

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Control Panel hiển thị |
| **Bước thực hiện** | 1. Nhập "TEST SHIP" vào ô Tên tàu<br>2. Để trống tất cả ô khác<br>3. Click "Thêm vào tàu chờ" |
| **Kết quả mong đợi** | - Tàu mới được tạo với giá trị mặc định: DWT=1000, LOA=100, BEAM=20<br>- Tàu xuất hiện trong waiting list<br>- Toast success |
| **Dữ liệu test** | Tên: TEST SHIP |

---

### TC-02-003: Tạo tàu không có tên (validation fail)

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Control Panel hiển thị |
| **Bước thực hiện** | 1. Để trống ô Tên tàu<br>2. Nhập thông tin khác (DWT, LOA...)<br>3. Click "Thêm vào tàu chờ" |
| **Kết quả mong đợi** | - Toast error hiển thị "Tên tàu không được để trống" (hoặc tương tự)<br>- KHÔNG tạo tàu mới<br>- Form giữ nguyên dữ liệu đã nhập |

---

### TC-02-004: ID tàu mới là duy nhất

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Không |
| **Bước thực hiện** | 1. Tạo liên tiếp 5 tàu với cùng tên "SHIP A"<br>2. Kiểm tra ID của từng tàu |
| **Kết quả mong đợi** | - Mỗi tàu có ID khác nhau (format: 'W' + timestamp)<br>- Không có 2 tàu trùng ID |

---

### TC-02-005: Tạo tàu với các loại hàng khác nhau

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Control Panel hiển thị |
| **Bước thực hiện** | 1. Tạo tàu với loại hàng "Sắt thép"<br>2. Tạo tàu với loại hàng "Container"<br>3. Tạo tàu với loại hàng "Hàng khác" |
| **Kết quả mong đợi** | - Mỗi tàu hiển thị đúng màu thanh bên trái trên card:<br>  • Container: Cam (#f97316)<br>  • Sắt thép: Xanh lá (#16a34a)<br>  • Hàng khác: Xanh dương (#2563eb) |

---

### TC-02-006: Tạo tàu - LOA âm hoặc bằng 0

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Control Panel hiển thị |
| **Bước thực hiện** | 1. Nhập tên tàu hợp lệ<br>2. Nhập "0" hoặc "-50" vào ô LOA<br>3. Click "Thêm vào tàu chờ" |
| **Kết quả mong đợi** | - Tàu được tạo với LOA mặc định (100m) HOẶC hiển thị lỗi validation<br>- Không tạo tàu với LOA ≤ 0 |

---

### TC-02-007: Form reset sau khi tạo tàu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Control Panel hiển thị |
| **Bước thực hiện** | 1. Nhập đầy đủ thông tin tàu<br>2. Click "Thêm vào tàu chờ"<br>3. Quan sát form |
| **Kết quả mong đợi** | - Tất cả input được reset về trống<br>- Dropdown loại hàng về giá trị mặc định<br>- Sẵn sàng cho lần nhập tiếp |

---

## 2. Chỉnh sửa tàu (Detail Panel)

### TC-02-008: Mở Detail Panel khi click tàu trên grid

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Có ít nhất 1 tàu trên Planning Grid |
| **Bước thực hiện** | 1. Click vào 1 tàu trên Planning Grid |
| **Kết quả mong đợi** | - Right Sidebar chuyển từ Control Panel sang Detail Panel<br>- Hiển thị đầy đủ thông tin tàu đã chọn<br>- Tàu trên grid có viền highlight (selected) |

---

### TC-02-009: Mở Detail Panel khi click tàu trong waiting list

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Có ít nhất 1 tàu trong waiting list |
| **Bước thực hiện** | 1. Click vào 1 WaitingShipCard trong danh sách chờ |
| **Kết quả mong đợi** | - Right Sidebar chuyển sang Detail Panel<br>- Hiển thị thông tin tàu chờ<br>- Các trường berthName, ETA, ETD có thể trống |

---

### TC-02-010: Đóng Detail Panel

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Detail Panel đang hiển thị |
| **Bước thực hiện** | 1. Click nút ✕ trên Detail Panel |
| **Kết quả mong đợi** | - Detail Panel đóng<br>- Control Panel hiển thị lại (form tạo tàu + waiting list)<br>- Tàu trên grid bỏ chọn (không còn highlight) |

---

### TC-02-011: Cập nhật tên tàu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Detail Panel đang hiển thị cho tàu "OLD NAME" |
| **Bước thực hiện** | 1. Xóa tên cũ, nhập "NEW NAME"<br>2. Click "Cập Nhật Kế Hoạch" |
| **Kết quả mong đợi** | - Tên tàu trên grid/card đổi thành "NEW NAME"<br>- Toast success hiển thị<br>- Detail Panel đóng |

---

### TC-02-012: Thay đổi LOA tự động cập nhật end

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Detail Panel cho tàu có start=50, end=230, LOA=180 |
| **Bước thực hiện** | 1. Thay đổi LOA từ 180 thành 200<br>2. Quan sát ô "Vị trí KT" |
| **Kết quả mong đợi** | - Ô "Vị trí KT" (end) tự động thay đổi thành 250 (= start + LOA mới = 50 + 200)<br>- Click "Cập Nhật" → chiều rộng tàu trên grid thay đổi |

---

### TC-02-013: Thay đổi start tự động cập nhật end

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Detail Panel cho tàu có start=0, LOA=180 |
| **Bước thực hiện** | 1. Thay đổi "Vị trí BD" từ 0 thành 20<br>2. Quan sát ô "Vị trí KT" |
| **Kết quả mong đợi** | - Ô "Vị trí KT" = 20 + 180 = 200 |

---

### TC-02-014: Thay đổi end tự động cập nhật start

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Detail Panel cho tàu có LOA=180 |
| **Bước thực hiện** | 1. Thay đổi "Vị trí KT" thành 250<br>2. Quan sát ô "Vị trí BD" |
| **Kết quả mong đợi** | - Ô "Vị trí BD" = 250 - 180 = 70 |

---

### TC-02-015: Chọn cầu bến mới tự gán vị trí mặc định

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Detail Panel cho tàu chưa có start/end |
| **Bước thực hiện** | 1. Chọn "K12" trong dropdown Cầu bến |
| **Kết quả mong đợi** | - Vị trí BD = 130 (đầu K12, tính từ đầu K12A)<br>- Vị trí KT = 130 + LOA |

---

### TC-02-016: Chọn từng cầu bến và kiểm tra vị trí mặc định

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Detail Panel cho tàu chưa có start/end |
| **Bước thực hiện** | Lần lượt chọn từng cầu bến và kiểm tra:<br>1. K12C → start=0<br>2. K12A → start=0<br>3. K12 → start=130<br>4. K12B → start=320<br>5. TT2 → start=0 |
| **Kết quả mong đợi** | - Mỗi cầu có start mặc định đúng như bảng<br>- End = start + LOA |

---

### TC-02-017: Validate ETD > ETA

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Detail Panel đang mở |
| **Bước thực hiện** | 1. Nhập ETA = "2025-06-10 08:00"<br>2. Nhập ETD = "2025-06-09 08:00" (trước ETA)<br>3. Click "Cập Nhật Kế Hoạch" |
| **Kết quả mong đợi** | - Toast error: "ETD phải lớn hơn ETA!"<br>- KHÔNG cập nhật, Detail Panel vẫn mở |

---

### TC-02-018: Cập nhật tàu trong waiting list

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Detail Panel cho tàu trong waiting list |
| **Bước thực hiện** | 1. Thay đổi LOA, DWT, loại hàng<br>2. Thêm ETA, ETD, chọn cầu bến<br>3. Click "Cập Nhật Kế Hoạch" |
| **Kết quả mong đợi** | - Thông tin tàu trong waiting list được cập nhật<br>- Không kiểm tra overlap (tàu chờ)<br>- WaitingShipCard hiển thị thông tin mới |

---

### TC-02-019: Cập nhật tàu trên grid - không overlap

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Detail Panel cho tàu trên grid, không có tàu khác gần |
| **Bước thực hiện** | 1. Thay đổi vị trí (start, end) hoặc thời gian (ETA, ETD)<br>2. Click "Cập Nhật Kế Hoạch" |
| **Kết quả mong đợi** | - Tàu trên grid di chuyển sang vị trí mới<br>- Style (left, width, top, height) được tính lại<br>- Toast success |

---

### TC-02-020: Cập nhật tàu trên grid - có overlap

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | 2 tàu trên grid cùng cầu bến, Detail Panel cho 1 tàu |
| **Bước thực hiện** | 1. Thay đổi vị trí tàu đang sửa để trùng với tàu khác (cùng vị trí & thời gian)<br>2. Click "Cập Nhật Kế Hoạch" |
| **Kết quả mong đợi** | - Toast error thông báo overlap<br>- 2 tàu bị highlight 3 giây<br>- KHÔNG cập nhật, tàu giữ nguyên vị trí cũ |

---

## 3. Xóa tàu

### TC-02-021: Xóa tàu khỏi planner (nút RỜI)

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Có tàu trên Planning Grid |
| **Bước thực hiện** | 1. Hover vào tàu trên grid<br>2. Click nút "RỜI" (hiện khi hover)<br>3. ConfirmModal hiển thị → Click "Xác nhận" |
| **Kết quả mong đợi** | - Tàu biến mất khỏi grid<br>- selectedShip = null<br>- Toast success<br>- Tàu KHÔNG xuất hiện trong waiting list |

---

### TC-02-022: Chuyển tàu về waiting list (nút CHỜ)

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Có tàu trên Planning Grid |
| **Bước thực hiện** | 1. Hover vào tàu trên grid<br>2. Click nút "CHỜ" |
| **Kết quả mong đợi** | - Tàu biến mất khỏi grid<br>- Tàu xuất hiện trong waiting list (WaitingShipCard)<br>- Thông tin tàu được giữ nguyên (tên, LOA, cargo...)<br>- Style (left, top) bị xóa<br>- Toast info |

---

### TC-02-023: Xóa tàu khỏi waiting list

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Có tàu trong waiting list |
| **Bước thực hiện** | 1. Click nút 🗑 trên WaitingShipCard<br>2. ConfirmModal hiển thị → Click "Xác nhận" |
| **Kết quả mong đợi** | - Tàu biến mất khỏi waiting list<br>- Số đếm tàu chờ giảm 1<br>- Toast info |

---

### TC-02-024: Hủy xóa tàu (Cancel confirm)

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | ConfirmModal xóa tàu đang hiển thị |
| **Bước thực hiện** | 1. Click nút "Hủy" trên ConfirmModal |
| **Kết quả mong đợi** | - Modal đóng<br>- Tàu vẫn tồn tại, không bị thay đổi |

---

## 4. Select / Deselect tàu

### TC-02-025: Chọn tàu trên grid - highlight berth & slots

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Có tàu trên grid |
| **Bước thực hiện** | 1. Click vào tàu "SHIP A" trên cầu K12 |
| **Kết quả mong đợi** | - Tàu có viền highlight (ship-selected)<br>- Cầu K12 trên BerthHeader highlight (berth-active)<br>- Các slot NGÀY/ĐÊM tương ứng ETA→ETD highlight (day-active) |

---

### TC-02-026: Bỏ chọn tàu - click vùng trống

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Đang chọn 1 tàu (Detail Panel hiển thị) |
| **Bước thực hiện** | 1. Click vào vùng nước trống trên Planning Grid |
| **Kết quả mong đợi** | - Tàu bỏ highlight<br>- Berth bỏ highlight<br>- Slot bỏ highlight<br>- Detail Panel đóng, Control Panel hiển thị |

---

## 5. Tự động chuyển tàu khi thay đổi khung ngày

### TC-02-027: Tàu ngoài khung ngày mới → chuyển về waiting list

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Tàu A: ETA=05/06, ETD=07/06 trên grid. startDate=01/06, numDays=10 |
| **Bước thực hiện** | 1. Thay đổi startDate thành 08/06 (sau ETD của tàu A) |
| **Kết quả mong đợi** | - Tàu A biến mất khỏi grid<br>- Tàu A xuất hiện trong waiting list<br>- ETA, ETD, berthName, mandra, style bị reset<br>- Toast thông báo "X tàu đã chuyển về danh sách chờ" |

---

### TC-02-028: Giảm numDays - tàu ngoài phạm vi bị chuyển

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Nhiều tàu trên grid với ETA/ETD trải dài 30 ngày |
| **Bước thực hiện** | 1. Thay đổi numDays từ 30 xuống 7 |
| **Kết quả mong đợi** | - Chỉ tàu nằm trong 7 ngày đầu còn trên grid<br>- Tàu nằm hoàn toàn ngoài → chuyển về waiting list<br>- Toast thông báo số tàu đã chuyển |

---

### TC-02-029: Tàu nằm một phần trong khung ngày → giữ nguyên

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Tàu có ETA=05/06, ETD=12/06 trên grid |
| **Bước thực hiện** | 1. Đặt startDate=08/06, numDays=7 (tàu nằm một phần) |
| **Kết quả mong đợi** | - Tàu VẪN ở trên grid (vì ETD=12/06 nằm trong khung 08/06-15/06)<br>- Không bị chuyển về waiting list |

---

### TC-02-030: Tàu nằm hoàn toàn trước startDate → chuyển đi

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Tàu có ETA=01/06, ETD=03/06 trên grid |
| **Bước thực hiện** | 1. Đặt startDate=05/06 |
| **Kết quả mong đợi** | - Tàu bị chuyển về waiting list (ETD ≤ startDate) |

---

## 6. Ma trận Test Coverage

| Tính năng | P1 | P2 | P3 | P4 | Tổng |
|-----------|----|----|----|----|------|
| Tạo tàu - happy path | 2 | 1 | 0 | 0 | 3 |
| Tạo tàu - validation | 1 | 1 | 2 | 0 | 4 |
| Detail Panel - mở/đóng | 2 | 1 | 0 | 0 | 3 |
| Chỉnh sửa - cập nhật field | 1 | 4 | 1 | 0 | 6 |
| Chỉnh sửa - overlap check | 2 | 1 | 0 | 0 | 3 |
| Xóa tàu | 3 | 1 | 0 | 0 | 4 |
| Select/Deselect | 0 | 2 | 0 | 0 | 2 |
| Auto chuyển khi đổi khung ngày | 1 | 3 | 0 | 0 | 4 |
| ETD/ETA validation | 1 | 0 | 0 | 0 | 1 |
| **Tổng** | **13** | **14** | **3** | **0** | **30** |
