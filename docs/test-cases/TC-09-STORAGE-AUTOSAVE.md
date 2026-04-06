# TC-09: LOCALSTORAGE & AUTO-SAVE

> **Module:** localStorage, Auto-save, State Persistence  
> **Tài liệu tham chiếu:** [07-TINH-NANG-KHAC.md](../07-TINH-NANG-KHAC.md) - Mục 2  
> **Tổng số test cases:** 14

---

## 1. Auto-save

### TC-09-001: Tự động lưu khi thêm tàu vào grid

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Ứng dụng đã load, DevTools mở (tab Application → localStorage) |
| **Bước thực hiện** | 1. Kéo 1 tàu từ waiting list vào grid<br>2. Kiểm tra localStorage key `berthPlannerState` |
| **Kết quả mong đợi** | - Key `berthPlannerState` được cập nhật<br>- Value chứa tàu vừa thêm trong berthedShips<br>- Data được serialize (Date → ISO string) |

---

### TC-09-002: Tự động lưu khi di chuyển tàu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Tàu A trên grid |
| **Bước thực hiện** | 1. Drag tàu A sang vị trí mới<br>2. MouseUp<br>3. Kiểm tra localStorage |
| **Kết quả mong đợi** | - localStorage cập nhật vị trí mới của tàu A<br>- start, end, berthName, style đúng |

---

### TC-09-003: Tự động lưu khi thay đổi startDate

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | startDate = 05/06 |
| **Bước thực hiện** | 1. Click nút ▶ để tăng ngày<br>2. Kiểm tra localStorage |
| **Kết quả mong đợi** | - localStorage.startDate = "2025-06-06" (ISO string) |

---

### TC-09-004: Tự động lưu khi thay đổi numDays

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | numDays = 7 |
| **Bước thực hiện** | 1. Chọn numDays = 30 từ dropdown<br>2. Kiểm tra localStorage |
| **Kết quả mong đợi** | - localStorage.numDays = 30 |

---

### TC-09-005: Không lưu transient state

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Đang chọn 1 tàu (selectedShip != null), toast đang hiện |
| **Bước thực hiện** | 1. Kiểm tra localStorage |
| **Kết quả mong đợi** | - KHÔNG chứa: selectedShip, isDragging, toast, importModalVisible<br>- Chỉ chứa: berthedShips, waitingShips, startDate, numDays, cranes |

---

## 2. Load khi khởi động

### TC-09-006: Khôi phục state đầy đủ sau reload

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | 5 tàu trên grid, 3 tàu waiting, startDate=10/06, numDays=15 |
| **Bước thực hiện** | 1. Nhấn F5 (reload trang)<br>2. Nhập mật khẩu<br>3. Kiểm tra giao diện |
| **Kết quả mong đợi** | - 5 tàu trên grid đúng vị trí<br>- 3 tàu trong waiting list<br>- startDate = 10/06<br>- numDays = 15<br>- Tàu không bị mất thông tin |

---

### TC-09-007: Deserialize Date objects từ localStorage

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | localStorage có data với ETA/ETD là ISO string |
| **Bước thực hiện** | 1. Reload<br>2. Kiểm tra ETA/ETD trong Detail Panel |
| **Kết quả mong đợi** | - ISO string → Date object chuyển đổi đúng<br>- ETA/ETD hiển thị đúng trong datetime-local input |

---

### TC-09-008: Khôi phục vị trí cẩu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Đã di chuyển cẩu trước đó |
| **Bước thực hiện** | 1. Reload trang<br>2. Kiểm tra vị trí cẩu trên Berth Header |
| **Kết quả mong đợi** | - Cẩu ở vị trí đã lưu, không phải mặc định |

---

### TC-09-009: Khởi động với localStorage trống

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Xóa tất cả localStorage (DevTools → Clear site data) |
| **Bước thực hiện** | 1. Reload trang |
| **Kết quả mong đợi** | - App khởi động bình thường với default state<br>- startDate = hôm nay<br>- numDays = 7<br>- Grid trống, waiting list trống<br>- Cẩu ở vị trí mặc định |

---

### TC-09-010: Khởi động với localStorage corrupt

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Gán localStorage `berthPlannerState` = "invalid{json" |
| **Bước thực hiện** | 1. Reload trang |
| **Kết quả mong đợi** | - App không crash<br>- Fallback về default state<br>- Console có thể log warning |

---

## 3. Clear Storage

### TC-09-011: Xóa kế hoạch (Clear Plan)

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Có dữ liệu trên grid |
| **Bước thực hiện** | 1. Click ⚙ Menu<br>2. Click "🗑️ Xóa Kế hoạch"<br>3. Confirm |
| **Kết quả mong đợi** | - Grid trống<br>- Waiting list trống<br>- localStorage bị xóa hoặc reset<br>- startDate, numDays có thể giữ nguyên hoặc reset |

---

### TC-09-012: Hủy xóa kế hoạch

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | ConfirmModal xóa đang hiển thị |
| **Bước thực hiện** | 1. Click "Hủy" |
| **Kết quả mong đợi** | - Kế hoạch giữ nguyên<br>- localStorage không bị ảnh hưởng |

---

## 4. Dung lượng và hiệu suất

### TC-09-013: localStorage với nhiều tàu (50+)

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Performance / Manual |
| **Điều kiện tiên quyết** | Import hoặc tạo 50+ tàu |
| **Bước thực hiện** | 1. Thao tác bình thường (di chuyển tàu, thay đổi ngày)<br>2. Kiểm tra kích thước localStorage |
| **Kết quả mong đợi** | - Auto-save không lag hoặc freeze UI<br>- localStorage size < 5MB (giới hạn trình duyệt)<br>- Reload + restore hoạt động bình thường |

---

### TC-09-014: Ref isRestoringPlan ngăn useEffect lọc tàu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Mở file JSON có startDate khác ngày hiện tại |
| **Bước thực hiện** | 1. Mở file JSON<br>2. Kiểm tra tàu có bị chuyển về waiting list không |
| **Kết quả mong đợi** | - Tàu KHÔNG bị chuyển tự động khi đang restore<br>- isRestoringPlan = true → useEffect skip filter<br>- Sau khi restore xong → isRestoringPlan = false |

---

## 5. Ma trận Test Coverage

| Tính năng | P1 | P2 | P3 | P4 | Tổng |
|-----------|----|----|----|----|------|
| Auto-save triggers | 2 | 3 | 0 | 0 | 5 |
| Load khi khởi động | 2 | 3 | 0 | 0 | 5 |
| Clear storage | 1 | 1 | 0 | 0 | 2 |
| Performance / Edge cases | 0 | 1 | 1 | 0 | 2 |
| **Tổng** | **5** | **8** | **1** | **0** | **14** |
