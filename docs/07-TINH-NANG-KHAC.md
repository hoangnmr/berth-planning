# 07 - Tính năng khác (Auth, Storage, Toast, Utilization)

## 1. Xác thực Password

### 1.1 Workflow

```
1. Khi App load → showPasswordModal = true (luôn hiển)
2. Hiện modal với input password
3. User nhập password → so sánh với getCurrentPassword():
   - Đọc từ localStorage key 'plannerPassword'
   - Nếu không có → dùng DEFAULT_PASSWORD = "HoangTT"
4. Đúng → setShowPasswordModal(false), cho phép vào app
5. Sai → hiển thông báo lỗi, yêu cầu nhập lại
```

### 1.2 Chi tiết

- Password mặc định: **"HoangTT"** (hardcoded trong App.js)
- Password có thể được thay đổi và lưu vào localStorage key `plannerPassword`
- Kiểm tra mỗi lần mở app (showPasswordModal mặc định = true)
- Không có session persist (luôn yêu cầu nhập lại khi reload)

### 1.3 Đổi mật khẩu (ChangePasswordModal)

Tính năng đổi mật khẩu nằm trong Header.js (menu ⚙ → "Đổi Mật khẩu"):

```
Workflow:
1. User mở menu ⚙ → click "Đổi Mật khẩu"
2. Hiển ChangePasswordModal với 3 field:
   - Mật khẩu cũ
   - Mật khẩu mới
   - Xác nhận mật khẩu mới
3. Validate:
   - Mật khẩu cũ phải khớp với getCurrentPassword()
   - Mật khẩu mới không được trắng
   - Xác nhận phải khớp với mật khẩu mới
4. Lưu: localStorage.setItem('plannerPassword', newPassword)
5. Toast thành công, đóng modal
```

### 1.4 localStorage keys liên quan

| Key | Giá trị | Mô tả |
|-----|---------|-------|
| `plannerPassword` | String | Mật khẩu tùy chỉnh (nếu đã đổi) |

### 1.3 Lưu ý khi triển khai lại

- Đây là auth cơ bản, KHÔNG an toàn
- Nếu cần → thêm backend API + JWT/session
- Hoặc dùng environment variable cho password
- Cân nhắc: OAuth, SSO nếu dùng trong tổ chức

---

## 2. Auto-save với localStorage

### 2.1 Cơ chế

```
Save trigger: useEffect theo dõi thay đổi của:
- berthedShips
- waitingShips
- startDate
- numDays
- cranes (optional)

Khi bất kỳ state nào thay đổi:
1. Serialize data:
   - Date objects → ISO string
   - Bỏ qua transient state (selectedShip, isDragging, ...)
2. localStorage.setItem('berth_planner_data', JSON.stringify(data))
```

### 2.2 Load khi khởi động

```
1. App component mount
2. Đọc localStorage.getItem('berth_planner_data')
3. Nếu có data:
   a. JSON.parse
   b. Deserialize: ISO string → Date objects
   c. Validate: kiểm tra startDate hợp lệ, ships array
   d. setState cho tất cả: berthedShips, waitingShips, startDate, numDays
4. Nếu không có data hoặc lỗi:
   → Dùng default state (mockData hoặc empty)
```

### 2.3 Key localStorage

| Key | Nội dung |
|-----|---------|
| `berthPlannerState` | Toàn bộ state (ships, dates, settings, cranes) |
| `plannerPassword` | Mật khẩu tùy chỉnh (nếu đã đổi) |

### 2.4 Clear Storage

- Hàm `clearStorage()` trong storageService.js
- Xóa tất cả key liên quan
- Được gọi khi user chọn "Reset" hoặc "Xóa dữ liệu"

---

## 3. Toast Notifications

### 3.1 Cấu trúc

```
Toast component:
- Props: message, type, onClose
- Auto-dismiss sau 2500ms (setTimeout)
- Có nút X để đóng thủ công
- Animation: slide-in từ phải, fade-out khi đóng
```

### 3.2 Các loại Toast

| Type | Màu | Icon | Trường hợp sử dụng |
|------|------|------|---------------------|
| `success` | Xanh lá (#4caf50) | ✓ | Import thành công, lưu file xong |
| `error` | Đỏ (#f44336) | ✕ | Lỗi import, file không hợp lệ |
| `warning` | Vàng (#ff9800) | ⚠ | Overlap detected, gap warning |
| `info` | Xanh dương (#2196f3) | ℹ | Thông tin chung |

### 3.3 Stack behavior

- Nhiều toast có thể hiển thị cùng lúc
- Stack từ trên xuống (mỗi toast mới xuất hiện bên dưới)
- Position: fixed, top-right corner
- z-index cao (9999+)

### 3.4 Cách gọi từ App.js

```
// State
const [toasts, setToasts] = useState([]);

// Thêm toast
const addToast = (message, type = 'info') => {
  const id = Date.now();
  setToasts(prev => [...prev, { id, message, type }]);
};

// Xóa toast
const removeToast = (id) => {
  setToasts(prev => prev.filter(t => t.id !== id));
};
```

---

## 4. Confirm Modal

### 4.1 Cấu trúc

```
ConfirmModal component:
- Props: isOpen, title, message, onConfirm, onCancel
- Overlay: semi-transparent dark background
- Modal box: centered, white background
- Buttons: Xác nhận (primary) + Hủy (secondary)
```

### 4.2 Các trường hợp sử dụng

| Hành động | Title | Message |
|-----------|-------|---------|
| Xóa tàu | "Xác nhận xóa" | "Bạn có chắc muốn xóa tàu {tên}?" |
| Xóa tất cả | "Xóa tất cả" | "Bạn có chắc muốn xóa tất cả tàu?" |
| Reset dữ liệu | "Reset" | "Dữ liệu sẽ bị xóa hoàn toàn?" |
| Nhập password | "Xác thực" | "Nhập mật khẩu để truy cập" |

### 4.3 CSS

```
.modal-overlay:
  position: fixed
  inset: 0
  background: rgba(0, 0, 0, 0.5)
  z-index: 10000
  display: flex
  align-items: center
  justify-content: center

.modal-box:
  background: white
  border-radius: 8px
  padding: 24px
  min-width: 400px
  max-width: 500px
  box-shadow: 0 4px 20px rgba(0,0,0,0.15)
```

---

## 5. Berth Utilization (Tính hệ số sử dụng cầu bến)

### 5.1 Mục đích

Tính % sử dụng cầu bến trong khoảng thời gian hiển thị, được hiển thị tại header của mỗi cầu.

Hàm `computeBerthUtilization(ships, opts)` hỗ trợ **2 phương pháp tính**.

### 5.2 Phương pháp 1: Time-based (đơn giản)

```
Logic:
1. Xác định time window: [startDate, startDate + numDays]
2. Với mỗi berth, thu thập các intervals [eta - PREP_TIME, etd + PREP_TIME]
3. Clip intervals vào window
4. Merge overlapping intervals
5. Tính tổng occupiedMs = sum của merged intervals
6. Áp dụng xalan factor: occupiedMs = occupiedMs * (1 + XALAN_FACTOR)
7. Cap at totalWindowMs
8. pct = occupiedMs / totalWindowMs * 100%
```

### 5.3 Phương pháp 2: Mét×Thời gian (chi tiết hơn)

```
Logic:
1. Thu thập tất cả event boundaries (eta-prep, etd+prep) của ships cùng berth
2. Tạo time slices giữa các boundaries
3. Với mỗi time slice:
   a. Tìm ships active trong slice (đã cập cầu, có start/end hợp lệ)
   b. Thu thập meter ranges [start, end] của ships active
   c. Merge meter ranges (gồm cả gap < 10% LOA được coi là occupied)
   d. Tính totalMeters = sum của merged meter ranges
   e. occupiedMeterMs += totalMeters * sliceMs
4. totalMeterMs = berthLength * totalWindowMs
5. Áp dụng xalan factor: occupiedMeterMs = occupiedMeterMs * (1 + XALAN_FACTOR)
6. meterPct = occupiedMeterMs / totalMeterMs * 100%
```

> **Lưu ý:** Phương pháp 2 chính xác hơn vì tính cả vị trí mét của tàu, tránh đếm trùng khi nhiều tàu cùng thời gian.

### 5.4 Combined Utilization (TÂN THUẬN 1)

Đặc biệt, hệ thống tính **utilization tổng hợp** cho nhóm K12C + K12A + K12 + K12B:

```
Logic:
1. Gộp tất cả time intervals của 4 berths: K12C, K12A, K12, K12B
2. Merge overlapping intervals
3. Tính combinedOccupiedMs
4. combinedPct = combinedOccupiedMs / totalWindowMs * 100%
5. Trả về { name: 'TÂN THUẬN 1', occupiedMs, pct }
```

> Mặc định combinedBerths = ['K12C', 'K12A', 'K12', 'K12B'] (có thể cấu hình qua opts).

### 5.5 Các tham số

| Tham số | Giá trị mặc định | Mô tả | Có thể cấu hình |
|---------|---------|-------|----------|
| PREP_TIME | 2 giờ | Thời gian chuẩn bị trước/sau khi tàu cập/rời | ✅ qua opts.prepHours |
| XALAN_FACTOR | 0.3 (30%) | Hệ số không gian thực tế tàu chiếm | ✅ qua opts.xalanFactor |
| order | ['K12C','K12A','K12','K12B','TT2'] | Thứ tự berths | ✅ qua opts.order |
| combinedBerths | ['K12C','K12A','K12','K12B'] | Berths gộp cho TÂN THUẬN 1 | ✅ qua opts.combinedBerths |
| berthLengths | {K12C:189, K12A:132, K12:188, K12B:204, TT2:222} | Chiều dài mỗi berth (m) | ✅ qua opts.berthLengths |

### 5.6 Kết quả trả về

```
{
  start: Date,                    // Ngày bắt đầu window
  windowEnd: Date,                // Ngày kết thúc window
  totalWindowMs: Number,          // Tổng ms của window
  rows: [                         // Mỗi berth
    {
      berth: 'K12C',
      occupiedMs: Number,          // Time-based
      pct: Number,                 // Time-based %
      intervals: Array,            // Merged time intervals
      occupiedMeterMs: Number,     // Meter×Time
      meterPct: Number,            // Meter×Time %
      berthLength: Number          // Chiều dài berth (m)
    },
    // ... K12A, K12, K12B, TT2
  ],
  combined: {                     // TÂN THUẬN 1
    name: 'TÂN THUẬN 1',
    occupiedMs: Number,
    pct: Number,
    intervals: Array
  }
}
```

### 5.7 Hiển thị

- Hiện trong BerthHeader, dưới tên cầu
- Format: "XX.X%"
- Màu sắc theo ngưỡng (optional):
  - < 50%: Xanh lá (dư capacity)
  - 50-80%: Vàng (trung bình)
  - > 80%: Đỏ (gần đầy)

---

## 6. Crane Management (Quản lý cần cẩu)

### 6.1 Danh sách cần cẩu

| ID | Tên | Block | Shape | Min% | Max% |
|----|-----|-------|-------|------|------|
| GW1 | Giàn ngoài 1 | gw-main (743m) | Tròn | 0% | 100% |
| GW2 | Giàn ngoài 2 | gw-main (743m) | Tròn | 0% | 100% |
| GW3 | Giàn ngoài 3 | gw-main (743m) | Tròn | 0% | 100% |
| GW4 | Giàn ngoài 4 | gw-main (743m) | Tròn | 0% | 100% |
| GW5 | Giàn ngoài 5 | gw-main (743m) | Tròn | 0% | 100% |
| GC1 | Giàn container 1 | gw-main (743m) | Vuông | 72.5% | 100% (chỉ K12B) |
| GC2 | Giàn container 2 | gw-main (743m) | Vuông | 72.5% | 100% (chỉ K12B) |
| LB1 | Cẩu bờ 1 | tt2 (222m) | Tròn | 0% | 100% |
| LB40 | Cẩu bờ 40T | tt2 (222m) | Tròn | 0% | 100% |

> **Block gw-main** = K12C + gap30 + K12A + K12 + K12B = 743m. GW1-5 di chuyển toàn bộ block, GC1-2 bị giới hạn chỉ trong 27.5% cuối (tương ứng vùng K12B).

### 6.2 Drag cẩu

```
1. Crane component render trên rail (hàng ngang phía trên grid)
2. Mỗi cẩu = icon/box có thể kéo ngang (chỉ trục X)
3. Drag bị giới hạn bởi minPercent/maxPercent của block
4. Position lưu dạng % trong block
5. State lưu tại BerthHeader, có thể serialize vào file JSON
```

### 6.3 Render trên BerthHeader

```
BerthHeader layout:
┌──────────────────────────────────────────────┐
│ K12C (XX.X%) │ K12A │  K12  │ K12B │TT2(XX%)│  ← Berth names + utilization
├──────────────────────────────────────────────┤
│ [GW1] [GW2]  │    [GW3] [GW4] [GW5]│[GC1][GC2] ← Crane rail (draggable)
└──────────────────────────────────────────────┘
```

---

## 7. Các hành vi UI khác

### 7.1 Auto Font Size cho Ship

Nội dung text trong BerthedShip tự động co nhỏ nếu chiều cao tàu < ngưỡng:
- `height >= 60px`: font-size 12px (normal)
- `height >= 48px`: font-size 10px
- `height < 48px`: font-size 9px, ẩn bớt thông tin phụ

### 7.2 Tooltip khi hover/drag Ship

```
- Render bằng React createPortal → document.body
- Vị trí: theo con trỏ chuột (offset 15px phải, 15px dưới)
- Nội dung: Tên tàu, LOA, ETA/ETD, Cargo, BerthName, Agent
- Khi drag: tooltip follow mouse realtime (requestAnimationFrame)
- Auto-reposition: nếu sát cạnh viewport → flip sang trái/trên
```

### 7.3 Ship Selection

```
- Click tàu → setSelectedShip(ship)
- Tàu được chọn: viền highlight (border đậm hơn)
- Detail Panel bên phải hiện thông tin chi tiết, cho phép edit
- Click vùng trống trên grid → deselect (setSelectedShip(null))
```

### 7.4 Keyboard Support

- Hiện tại không có keyboard shortcuts
- Lưu ý khi triển khai lại: nên thêm Escape để deselect, Delete để xóa tàu đang chọn

---

## 8. Tổng kết file tài liệu

Bộ tài liệu đầy đủ gồm 8 file:

| File | Nội dung |
|------|---------|
| [00-TONG-QUAN.md](00-TONG-QUAN.md) | Tổng quan dự án, workflow, công nghệ |
| [01-KIEN-TRUC-HE-THONG.md](01-KIEN-TRUC-HE-THONG.md) | Kiến trúc, cấu trúc thư mục, data flow |
| [02-DU-LIEU-CAU-BEN.md](02-DU-LIEU-CAU-BEN.md) | Mô hình dữ liệu cầu bến, pitch, cẩu |
| [03-GIAO-DIEN-TONG-THE.md](03-GIAO-DIEN-TONG-THE.md) | Đặc tả giao diện chi tiết |
| [04-QUAN-LY-TAU.md](04-QUAN-LY-TAU.md) | Quản lý tàu: tạo, chờ, cập cầu, sửa, xóa |
| [05-PLANNER-GRID.md](05-PLANNER-GRID.md) | Planning grid, drag & drop, overlap detection |
| [06-IMPORT-EXPORT.md](06-IMPORT-EXPORT.md) | Import Excel, lưu/mở JSON, export PDF |
| [07-TINH-NANG-KHAC.md](07-TINH-NANG-KHAC.md) | Auth, localStorage, toast, utilization, crane |

Tài liệu này đủ chi tiết để một developer có thể triển khai lại toàn bộ chương trình với cùng workflow và giao diện, sử dụng công nghệ hiện đại hơn.
