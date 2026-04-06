# Workflow - Luồng Xử Lý Chức Năng

## Tổng Quan Các Workflow

| ID | Workflow | Mô tả |
|----|----------|-------|
| WF01 | Đăng nhập | Vào chương trình |
| WF02 | Thêm tàu chờ | Thêm tàu mới vào danh sách chờ |
| WF03 | Cập cầu tàu | Kéo thả từ waiting list vào grid |
| WF04 | Di chuyển tàu | Thay đổi vị trí tàu trên grid |
| WF05 | Chỉnh sửa thông tin | Sửa chi tiết tàu |
| WF06 | Chuyển về chờ | Từ grid về waiting list |
| WF07 | Xóa tàu | Xóa khỏi kế hoạch |
| WF08 | Import Excel | Nhập dữ liệu từ Excel |
| WF09 | Export | Xuất kế hoạch (JSON/PDF/Report) |
| WF10 | Lưu/Mở kế hoạch | Save/Load file JSON |

---

## WF01: Đăng Nhập

```mermaid
flowchart TD
    A[Mở ứng dụng] --> B{Kiểm tra localStorage}
    B -->|Có session| C[Hiển thị giao diện chính]
    B -->|Không có| D[Hiển thị Password Modal]
    D --> E[User nhập mật khẩu]
    E --> F{Kiểm tra password}
    F -->|Đúng| C
    F -->|Sai| G[Hiển thị lỗi]
    G --> E
```

**Chi tiết:**
1. App render → kiểm tra state trong localStorage
2. Nếu chưa đăng nhập → hiện Password Modal
3. User nhập password → so sánh với stored password (default: "HoangTT@2025")
4. Đúng → set state `showPasswordModal = false` → hiển thị main UI
5. Password được lưu/đọc từ localStorage với key `plannerPassword`

---

## WF02: Thêm Tàu Chờ (Tạo Tàu Mới)

```mermaid
flowchart TD
    A[User điền form Tạo Tàu] --> B[Click 'Thêm vào tàu chờ']
    B --> C{Validate form}
    C -->|Thiếu tên| D[Alert lỗi]
    C -->|OK| E[Tạo ship object với ID mới]
    E --> F[Thêm vào waitingShips array]
    F --> G[Reset form inputs]
    G --> H[Ship hiển thị trong waiting list]
```

**Fields bắt buộc:** Tên tàu

**Fields tùy chọn:** IMO, DWT, LOA, BEAM, Loại hàng, Số lượng

**Giá trị mặc định:**
- DWT: 1000
- LOA: 100m
- BEAM: 20m
- ID: `"W" + Date.now()`

---

## WF03: Cập Cầu Tàu (Drag & Drop từ Waiting List)

```mermaid
flowchart TD
    A[User drag Waiting Ship Card] --> B[onDragStart: set dataTransfer]
    B --> C[User di chuyển qua grid]
    C --> D[onDragOver: tính toán vị trí thả]
    D --> E[Hiển thị highlight slot]
    E --> F[User thả tàu]
    F --> G[onDrop: parse ship data]
    G --> H[Tính vị trí left, top]
    H --> I[Xác định berth từ tọa độ X]
    I --> J[Xác định thời gian từ tọa độ Y]
    J --> K{Kiểm tra overlap}
    K -->|Có overlap| L[Toast warning + highlight đỏ]
    K -->|OK| M[Cập nhật ship với berth, eta, etd, style]
    M --> N[Xóa khỏi waitingShips]
    N --> O[Thêm vào berthedShips]
    L --> O
```

**Logic tính vị trí:**
1. `left` được tính theo thước đo 1005m (tổng chiều dài)
2. `top` được tính: `(slotIndex) * 30px`
3. Snap to slot: làm tròn về đầu slot gần nhất

**Xác định berth từ X:**
- 0-199: K12C
- 229-361: K12A
- 361-549: K12
- 549-753: K12B
- 773-995: TT2
- Vị trí gap: không cho phép thả

---

## WF04: Di Chuyển Tàu Trên Grid

```mermaid
flowchart TD
    A[User mousedown trên BerthedShip] --> B[Lưu vị trí ban đầu]
    B --> C[isDragging = true]
    C --> D[User di chuyển chuột]
    D --> E[mousemove: tính offset]
    E --> F[Cập nhật position tạm thời]
    F --> G[Hiển thị ship theo chuột]
    G --> H[User mouseup]
    H --> I[Tính vị trí thả mới]
    I --> J[Snap to grid]
    J --> K{Kiểm tra overlap}
    K -->|Có overlap| L[Toast error + revert position]
    K -->|Gap < 10% LOA| M[Toast warning + cho phép]
    K -->|OK| N[Cập nhật ship position]
    L --> O[Kết thúc]
    M --> N
    N --> O
```

**Snap Logic:**
- Horizontal: Snap theo mốc mét (1m = 1 đơn vị)
- Vertical: Snap theo slot 30px (1 slot = 12 giờ)

---

## WF05: Chỉnh Sửa Thông Tin Tàu

```mermaid
flowchart TD
    A[User click vào BerthedShip/WaitingShipCard] --> B[setSelectedShip]
    B --> C[Sidebar chuyển sang DetailPanel]
    C --> D[Hiển thị form với data hiện tại]
    D --> E[User chỉnh sửa các field]
    E --> F[Click 'Cập Nhật Kế Hoạch']
    F --> G{Validate}
    G -->|ETD <= ETA| H[Toast error]
    G -->|OK| I[Tính toán style mới từ start/end]
    I --> J[Gọi onUpdate với ship mới]
    J --> K[Cập nhật state berthedShips/waitingShips]
    K --> L[Đóng DetailPanel]
```

**Tự động tính toán:**
- Thay đổi `start` → `end = start + LOA`
- Thay đổi `end` → `start = end - LOA`
- Thay đổi `LOA` → `end = start + LOA`
- Thay đổi `berthName` → reset `start` về vị trí đầu bến

---

## WF06: Chuyển Về Danh Sách Chờ

```mermaid
flowchart TD
    A[User hover vào BerthedShip] --> B[Hiển thị nút CHỜ]
    B --> C[User click CHỜ]
    C --> D[Hiển thị Confirm Modal]
    D --> E{User xác nhận?}
    E -->|Hủy| F[Đóng modal]
    E -->|Xác nhận| G[Xóa khỏi berthedShips]
    G --> H[Giữ lại thông tin cơ bản]
    H --> I[Thêm vào waitingShips]
    I --> J[Toast thành công]
```

**Thông tin giữ lại:** id, name, dwt, loa, beam, cargoType, cargo, eta, etd, berthName, start, end

---

## WF07: Xóa Tàu Khỏi Kế Hoạch

```mermaid
flowchart TD
    A[User click nút RỜI/🗑️] --> B[Hiển thị Confirm Modal]
    B --> C{User xác nhận?}
    C -->|Hủy| D[Đóng modal]
    C -->|Xác nhận| E{Tàu ở đâu?}
    E -->|berthedShips| F[Xóa khỏi berthedShips]
    E -->|waitingShips| G[Xóa khỏi waitingShips]
    F --> H[Toast thành công]
    G --> H
```

---

## WF08: Import Từ Excel

```mermaid
flowchart TD
    A[User click Import Excel] --> B[Hiển thị Confirm xóa plan cũ]
    B --> C{User xác nhận?}
    C -->|Hủy| D[Đóng]
    C -->|Xác nhận| E[Clear plan hiện tại]
    E --> F[Mở file dialog]
    F --> G[User chọn file .xlsx]
    G --> H[Đọc file bằng SheetJS]
    H --> I[Parse dữ liệu từ các sheet]
    I --> J[Validate từng row]
    J --> K[Hiển thị Preview Modal]
    K --> L[User chọn rows muốn import]
    L --> M{User confirm import?}
    M -->|Hủy| D
    M -->|OK| N[Xử lý rows được chọn]
    N --> O[Phân loại: có berth/không]
    O --> P[Có berth → berthedShips]
    O --> Q[Không berth → waitingShips]
    P --> R[Toast thành công]
    Q --> R
```

**Cột Excel mong đợi:**
- Tên tàu (name)
- DWT, LOA, BEAM
- Loại hàng (cargoType)
- Số lượng (cargo)
- Cầu bến (berthName)
- ETA, ETD
- Vị trí (start, end)

**Xử lý date:**
- Hỗ trợ nhiều format: ISO, DD/MM/YYYY, DD-MM-YYYY, Excel serial number

---

## WF09: Export

### WF09a: Export PDF

```mermaid
flowchart TD
    A[User click Xuất PDF] --> B[Toast: Đang chuẩn bị...]
    B --> C[Clone DOM planner + waiting list]
    C --> D[html2canvas chụp ảnh]
    D --> E[Toast: Đang tạo PDF...]
    E --> F[jsPDF tạo tài liệu]
    F --> G[Thêm ảnh vào PDF]
    G --> H{Ảnh cao hơn 1 trang?}
    H -->|Có| I[Chia thành nhiều trang]
    H -->|Không| J[Thêm footer copyright]
    I --> J
    J --> K[Trigger download PDF]
    K --> L[Toast: Xuất thành công]
```

### WF09b: Export Báo Cáo Chi Tiết

```mermaid
flowchart TD
    A[User click Xuất Báo cáo] --> B[Tính toán thống kê]
    B --> C[Đếm tàu theo loại hàng]
    C --> D[Tính utilization các bến]
    D --> E[Tạo HTML với Chart.js]
    E --> F[Mở tab mới với báo cáo]
    F --> G[Đồng thời tạo CSV]
    G --> H[Download CSV tự động]
```

**Nội dung báo cáo:**
- Bảng danh sách tàu chi tiết
- Biểu đồ tròn: Số tàu theo loại hàng
- Biểu đồ cột: Khối lượng hàng theo loại
- Biểu đồ utilization các bến

---

## WF10: Lưu/Mở Kế Hoạch JSON

### WF10a: Lưu

```mermaid
flowchart TD
    A[User click Lưu Kế hoạch] --> B[Thu thập state]
    B --> C[berthedShips, waitingShips, startDate, numDays, cranes]
    C --> D[JSON.stringify]
    D --> E[Tạo Blob]
    E --> F[Trigger download với tên file có timestamp]
    F --> G[Toast: Lưu thành công]
```

### WF10b: Mở

```mermaid
flowchart TD
    A[User click Mở Kế hoạch] --> B[Mở file dialog .json]
    B --> C[User chọn file]
    C --> D[Đọc file.text]
    D --> E{JSON.parse OK?}
    E -->|Lỗi| F[Toast: File không hợp lệ]
    E -->|OK| G[Validate structure]
    G --> H[Convert date strings to Date objects]
    H --> I[Set state: berthedShips, waitingShips...]
    I --> J[Lưu vào localStorage]
    J --> K[Toast: Mở thành công]
```

---

## State Persistence

Tất cả state quan trọng được lưu vào `localStorage` với key `berthPlannerState`:

```javascript
const savedState = {
  berthedShips: [...],
  waitingShips: [...],
  startDate: "2025-01-01T00:00:00",
  numDays: 7,
  cranePositions: [...],
  lastUpdated: "2025-01-01T12:00:00"
};
```

**Auto-save triggers:**
- Khi thay đổi berthedShips
- Khi thay đổi waitingShips
- Khi thay đổi startDate/numDays
- Khi di chuyển cẩu

---

*Tiếp theo: [03_DATA_MODEL.md](./03_DATA_MODEL.md)*
