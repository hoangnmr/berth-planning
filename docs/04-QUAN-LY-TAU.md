# 04 - Quản lý Tàu (Ship Management)

## 1. Tạo tàu mới

### 1.1 Workflow

```
User nhập thông tin → Click "Thêm vào tàu chờ" → Validate → Tạo ship object → Thêm vào waitingShips → Toast success
```

### 1.2 Form tạo tàu

| Field | Type | Bắt buộc | Ghi chú |
|-------|------|----------|---------|
| Tên tàu | text | ✅ | Không cho submit nếu rỗng |
| IMO | text | ❌ | Mã IMO tàu |
| DWT | number | ❌ | Default = 1000 nếu không nhập |
| LOA (m) | number | ❌ | Default = 100 nếu không nhập |
| BEAM (m) | number | ❌ | Default = 20 nếu không nhập |
| Loại hàng | select | ❌ | Options: Sắt thép, Container, Hàng khác |
| Số lượng | text | ❌ | Số lượng hàng hóa |

### 1.3 Logic tạo

1. Đọc giá trị từ DOM (querySelectorAll trên form-container)
2. Validate: tên tàu không rỗng
3. Tạo ship object:
   ```
   {
     id: 'W' + Date.now(),   // ID unique
     name, imo, dwt, loa, beam, cargoType, cargo
   }
   ```
4. Gọi `onAddWaitingShip(newShip)` → thêm vào state `waitingShips`
5. Reset form inputs
6. Hiển thị toast success

> **Lưu ý:** Tàu mới tạo **không có** ETA, ETD, berthName, start, end. Cần chỉnh sửa sau trong DetailPanel.

---

## 2. Danh sách tàu chờ (Waiting List)

### 2.1 Hiển thị

- Tiêu đề: "Tàu Đang Chờ Cầu ({count})"
- Sắp xếp theo ETA tăng dần (tàu chưa có ETA xuống cuối)
- Mỗi tàu = 1 WaitingShipCard

### 2.2 WaitingShipCard

**Bố cục card:**
```
┌─┬──────────────────────┬───┐
│█│ 1. TÊN TÀU           │🚢│
│ │ Loại hàng | Số lượng  │🗑│
│ │ Bến | Start - End     │   │
│ │ ETA → ETD             │   │
└─┴──────────────────────┴───┘
```

- Thanh màu bên trái (color-bar) theo loại hàng
- Background card nhạt theo loại hàng (card-fill)
- Nút Cập cầu (icon mỏ neo SVG) + Nút Xóa (icon thùng rác SVG)

### 2.3 Hành động trên Waiting List

| Hành động | Trigger | Logic |
|-----------|---------|-------|
| **Click card** | Click vào card | Gọi `onShipSelect(ship)` → Mở DetailPanel |
| **Drag card** | Drag (HTML5 DragStart) | `setData('application/json', JSON.stringify(ship))` |
| **Cập cầu** | Click nút 🚢 | Gọi `onDock(ship)` → Xem workflow §2.4 |
| **Xóa** | Click nút 🗑 | Gọi `onDelete(ship)` → Hiện ConfirmModal → Xóa khỏi waitingShips |

### 2.4 Workflow Cập cầu từ Waiting List (nút Cập cầu)

```
1. Kiểm tra đủ thông tin: ETA, ETD, berthName, LOA
   → Nếu thiếu: Toast error "Tàu ... chưa đủ thông tin"
   
2. Tính vị trí tuyệt đối:
   - refStart = BERTH_REFERENCES[berthName]
   - startRel = ship.start (hoặc 0 nếu chưa có)
   - endRel = ship.end (hoặc startRel + LOA)
   - absStart = refStart + startRel
   - absEnd = refStart + endRel
   
3. Tính style:
   - left = calc(absStart/1005*100%)
   - width = calc((absEnd-absStart)/1005*100%)
   - top = ((eta - startDate) / msPerSlot) * slotHeight
   - height = ((etd - eta) / msPerSlot) * slotHeight
   
4. Kiểm tra overlap với các tàu đang ở planner
   → Nếu overlap: Highlight 2 tàu 3s, Toast error, KHÔNG thêm
   
5. Kiểm tra gap warning (khoảng cách < 10% LOA max)
   → Nếu vi phạm: vẫn thêm nhưng Toast warning
   
6. Tạo newShip với style → Thêm vào berthedShips, xóa khỏi waitingShips
7. Toast success
```

---

## 3. Chỉnh sửa tàu (Detail Panel)

### 3.1 Khi nào hiển thị

- Click vào tàu trên Planning Grid → Hiển thị DetailPanel thay ControlPanel
- Click vào WaitingShipCard → Hiển thị DetailPanel thay ControlPanel
- Nút ✕ trên DetailPanel → Đóng, quay về ControlPanel

### 3.2 Form chỉnh sửa

| Field | Type | Logic tự động |
|-------|------|---------------|
| Tên tàu | text | - |
| DWT | number | - |
| LOA (m) | number | Thay đổi LOA → end = start + LOA mới |
| BEAM (m) | number | - |
| Loại hàng | select | Options: Container, Sắt thép, Hàng khác |
| Số lượng | text | - |
| Cầu bến | select | Options: K12C, K12A, K12, K12B, TT2. Khi chọn → tự gán start/end nếu chưa có |
| Mạn cập | select | Options: Mạn trái, Mạn phải |
| Vị trí BD (m) | number | Thay đổi start → end = start + LOA |
| Vị trí KT (m) | number | Thay đổi end → start = end - LOA |
| ETA | datetime-local | Ngày giờ cập cầu |
| ETD | datetime-local | Ngày giờ rời cầu |

### 3.3 Logic "Vị trí đầu bến" mặc định

Khi user chọn bến mới và tàu chưa có start/end, vị trí được gán tự động:

| Bến | start mặc định | Ý nghĩa |
|-----|----------------|---------|
| K12C | 0 | Đầu K12C |
| K12A | 0 | Đầu K12A |
| K12 | 130 | 130m từ đầu K12A (khoảng đầu K12) |
| K12B | 320 | 320m từ đầu K12A (khoảng đầu K12B) |
| TT2 | 0 | Đầu TT2 |

### 3.4 Workflow cập nhật

```
1. User chỉnh sửa form → Click "Cập Nhật Kế Hoạch"

2. Validate:
   - ETD phải > ETA (nếu cả 2 có giá trị)
   → Nếu vi phạm: Toast error "ETD phải lớn hơn ETA!"

3. Phân loại tàu:
   a. Tàu trong waitingShips → Cập nhật trực tiếp, không kiểm tra overlap
   b. Tàu trong berthedShips → Tiếp tục bước 4

4. Tính lại style từ form data:
   - left = calc((refStart + start)/1005*100%)
   - width = calc((end - start)/1005*100%)
   - top = ((eta - startDate) / msPerSlot) * slotHeight
   - height = ((etd - eta) / msPerSlot) * slotHeight

5. Kiểm tra overlap (loại trừ chính tàu đang sửa khỏi danh sách so sánh)
   → Nếu overlap: Highlight 2 tàu, Toast error, KHÔNG cập nhật
   
6. Kiểm tra gap warning
   → Nếu vi phạm: vẫn cập nhật, Toast warning

7. Cập nhật berthedShips state (tính lại start/end từ style)
8. Toast success
9. Đóng DetailPanel
```

---

## 4. Xóa tàu khỏi Planner

### 4.1 Nút "RỜI" (trên BerthedShip)

```
1. Click "RỜI" trên tàu → Hiển thị ConfirmModal
2. Confirm → Xóa tàu khỏi berthedShips
3. Reset selectedShip = null
4. Toast success
```

### 4.2 Nút "CHỜ" (trên BerthedShip)

```
1. Click "CHỜ" trên tàu
2. Xóa tàu khỏi berthedShips
3. Tạo cleaned ship (xóa style.left, style.top) → Thêm vào waitingShips
4. Reset selectedShip = null
5. Toast info
```

### 4.3 Xóa khỏi Waiting List

```
1. Click nút 🗑 trên WaitingShipCard → Hiển thị ConfirmModal
2. Confirm → Xóa khỏi waitingShips
3. Toast info
```

---

## 5. Tự động chuyển tàu khi thay đổi khung ngày

### 5.1 Workflow

Khi `startDate` hoặc `numDays` thay đổi:

```
1. Tính newEndDate = startDate + numDays
2. Duyệt qua tất cả berthedShips
3. Tàu nằm HOÀN TOÀN ngoài khung ngày:
   - ETD ≤ startDate HOẶC ETA ≥ newEndDate
   → Chuyển về waitingShips (reset ETA, ETD, berthName, mandra, style)
4. Toast thông báo số tàu đã chuyển
```

> **Lưu ý:** Logic này có 100ms delay để đảm bảo state đã ổn định. Có ref `isRestoringPlan` để ngăn chạy khi đang khôi phục kế hoạch.

---

## 6. Select / Highlight tàu

### 6.1 Khi click tàu

```
1. setSelectedShip(ship)
2. Highlight berth: setActiveBerth(ship.berthName)
3. Tính slot overlap:
   - Từ ETA/ETD → tính topPx, heightPx
   - Duyệt qua tất cả slot NGÀY/ĐÊM
   - Slot nào giao với ship → thêm vào activeDayIndex
4. setActiveDayIndex(overlapping slots)
```

### 6.2 Khi click vùng trống

```
1. setSelectedShip(null)
2. setActiveDayIndex(null)
3. setActiveBerth(null)
```
