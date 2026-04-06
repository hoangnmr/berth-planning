# Giao Diện Chương Trình - Chi Tiết

## Layout Tổng Quan

Giao diện chia thành **3 phần chính** theo chiều ngang:

```
┌─────────────────────────────────────────────────────────────────────┐
│                           HEADER                                     │
│  [Ngày BD: ◀ [2025-01-01] ▶]  [Hiển thị: 7 ngày ▼]  [⚙️ Options]    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────┐  ┌──────────────┐  │
│  │                                             │  │              │  │
│  │            BERTH PLANNER                    │  │  RIGHT       │  │
│  │         (Lưới kế hoạch)                     │  │  SIDEBAR     │  │
│  │                                             │  │              │  │
│  │  Timeline │      Grid (5 cầu bến)           │  │  - Tạo tàu   │  │
│  │           │                                 │  │  - Tàu chờ   │  │
│  │           │                                 │  │  hoặc        │  │
│  │           │                                 │  │  - Chi tiết  │  │
│  │           │                                 │  │    tàu       │  │
│  │                                             │  │              │  │
│  └─────────────────────────────────────────────┘  └──────────────┘  │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                           FOOTER                                     │
│            © Nguyen Hoang & Ban Khai thac | TT ĐHKT TÂN THUẬN       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 1. Header

### Vị trí
Thanh ngang phía trên cùng, chiều cao cố định.

### Thành phần

| Thành phần | Mô tả | Tương tác |
|------------|-------|-----------|
| **Logo/Tiêu đề** | "HỆ THỐNG QUẢN LÝ CẦU BẾN (Berth Planning)" | - |
| **Date Selector** | Bộ chọn ngày bắt đầu với nút ◀ ▶ | Click ◀/▶ để +/- 1 ngày, click vào input để mở date picker |
| **Day Dropdown** | Dropdown chọn số ngày hiển thị | Options: 1, 7, 10, 15, 30, 35, 40, 45, 60 ngày |
| **Options Menu** | Nút bánh răng ⚙️ mở dropdown | Click để mở menu |

### Options Menu (Dropdown)

```
┌─────────────────────────────────┐
│ 📂 Mở Kế hoạch                  │
│ 💾 Lưu Kế hoạch                 │
├─────────────────────────────────┤
│ 📥 Import kế hoạch từ EXCEL     │
├─────────────────────────────────┤
│ 📄 Xuất PDF                     │
│ 📊 Xuất Báo cáo chi tiết        │
├─────────────────────────────────┤
│ 🗑️ Xóa Kế hoạch (màu đỏ)        │
└─────────────────────────────────┘
```

---

## 2. Berth Planner (Vùng Chính)

### 2.1 Berth Header - Hàng Tên Cầu

Hiển thị tên và chiều dài các cầu bến:

```
[Gap 10m] │ K12C (189m) │ [Gap 30m] │ K12A (132m) │ K12 (188m) │ K12B (204m) │ [Gap 20m] │ TT2 (222m) │ [Gap 10m]
```

- **Highlight**: Khi drag tàu, bến tương ứng được highlight
- **Màu nền**: Gap có màu xám nhạt

### 2.2 Đường Ray Cẩu (Crane Rail)

Hiển thị trực quan các cẩu có thể di chuyển:

| Cẩu | Loại | Vùng hoạt động | Hình dạng |
|-----|------|----------------|-----------|
| GW1-GW5 | Gantry Wheel | K12C + K12A + K12 + K12B | ⬤ (tròn) |
| GC1, GC2 | Gantry Container | Chỉ K12B | ⬛ (vuông) |
| LB1, LB40 | Level Boom | Chỉ TT2 | ⬤ (tròn) |

### 2.3 Pitch Ruler - Thước Đo

Thước ngang hiển thị các mốc khoảng cách (pitch):
- Mỗi bến có các mốc riêng (vd: 0, 24, 53, 79... cho K12C)
- Hiển thị nhãn bằng số mét

### 2.4 Timeline (Trục Y - Thời Gian)

Cột bên trái hiển thị thời gian:

```
┌────────────────┐
│ T2    01/01    │
│ ├─ NGÀY ───────│
│ └─ ĐÊM ────────│
│ T3    02/01    │
│ ├─ NGÀY ───────│
│ └─ ĐÊM ────────│
│ ...            │
└────────────────┘
```

- Mỗi ngày chia 2 slot: **NGÀY** (6h-18h) và **ĐÊM** (18h-6h)
- Slot height = 30px (1 slot = 12 giờ)

### 2.5 Planning Grid - Lưới Kế Hoạch

Vùng chính hiển thị tàu đã cập cầu:

**Cấu trúc cột:**
```
[Gap 10m] │ K12C │ [Gap 30m] │ K12A │ K12 │ K12B │ [Gap 20m] │ TT2 │ [Gap 10m]
```

**Mỗi ô lưới:**
- Chiều cao: 30px/slot
- Màu nền: Trắng, xen kẽ nhạt
- Highlight khi có tàu đang được drag qua

---

## 3. Berthed Ship (Khối Tàu)

### Hình Dạng

```
┌─────────────────────────────────────────────────────────────┐
│   \                                                    │     │
│    \   [Tên Tàu] | [Số lượng hàng]                     │ [ ] │
│    /   [ETA] → [ETD]                                   │     │
│   /                                                    │     │
├───┴───────────────────────────────────────────────────────┬─┤
│  [Vị trí BD]                                  [Vị trí KT]   │
└─────────────────────────────────────────────────────────────┘
```

### Các Thành Phần

| Thành phần | Mô tả |
|------------|-------|
| **Mũi tàu (Bow)** | Hình tam giác hướng mạn cập |
| **Cabin** | Phần đuôi tàu |
| **Thông tin chính** | Tên tàu, số lượng hàng |
| **Thời gian** | ETA → ETD |
| **Vị trí** | Góc dưới: vị trí bắt đầu/kết thúc (m) |

### Màu Sắc theo Loại Hàng

| Loại hàng | Màu nền | CSS Class |
|-----------|---------|-----------|
| **Container** | Cam (#f97316) | ship-fill-container |
| **Sắt thép** | Xanh lá (#16a34a) | ship-fill-steel |
| **Hàng khác** | Xanh dương (#2563eb) | ship-fill-other |

### Trạng Thái Hiển Thị

| Trạng thái | Hiển thị |
|------------|----------|
| Bình thường | Màu theo loại hàng |
| Selected | Viền đậm, glow effect |
| Overlap (chồng lấn) | Viền đỏ, nhấp nháy |
| Gap Warning | Viền vàng |
| Highlighted | Glow mạnh |

### Hover Buttons

Khi hover vào tàu, hiện 2 nút:
- **[CHỜ]**: Chuyển tàu về danh sách chờ
- **[RỜI]**: Xóa tàu khỏi kế hoạch

### Tooltip

Hiển thị khi hover:
```
┌───────────────────────────────┐
│ M/v [Tên tàu]                 │
│ DWT: 22,000 | LOA: 180m       │
│ Container | 1,200 cont        │
│ ETA: 01/01 - 08:00            │
│ ETD: 02/01 - 20:00            │
│ Duration: 1 ngày 12 giờ       │
│ Bến: K12A | 50 - 230          │
└───────────────────────────────┘
```

---

## 4. Right Sidebar

### 4.1 Control Panel (Khi không chọn tàu)

```
┌─────────────────────────────────┐
│        TẠO TÀU MỚI              │
├─────────────────────────────────┤
│ Tên tàu: [______________]       │
│ IMO:     [______________]       │
│ DWT:     [____] LOA: [____]     │
│ BEAM:    [____]                 │
│ Loại hàng: [Sắt thép ▼]         │
│ Số lượng:  [__________]         │
│                                 │
│ [   Thêm vào tàu chờ   ]        │
├─────────────────────────────────┤
│  TÀU ĐANG CHỜ CẦU (5)           │
├─────────────────────────────────┤
│ ┌─ Card 1 ───────────────────┐  │
│ │ 1. VINALINES STAR          │  │
│ │    Container | 1,200 TEUs  │  │
│ │    K12A | 50-230           │  │
│ │    01/01 08:00 → 02/01 20:00│  │
│ │                     [⚓][🗑]│  │
│ └────────────────────────────┘  │
│ ┌─ Card 2 ───────────────────┐  │
│ │ 2. HAI PHONG 36            │  │
│ │ ...                        │  │
│ └────────────────────────────┘  │
└─────────────────────────────────┘
```

### 4.2 Detail Panel (Khi chọn tàu)

```
┌─────────────────────────────────┐
│  THÔNG TIN CHI TIẾT TÀU    [X]  │
├─────────────────────────────────┤
│ Tên tàu: [VINALINES STAR    ]   │
│                                 │
│ DWT: [22000] LOA: [180] BEAM: [28]│
│                                 │
│ Loại hàng: [Container ▼]        │
│ Số lượng:  [1200        ]       │
│                                 │
│ Cầu bến:   [K12A ▼]             │
│ Mạn cập:   [Mạn trái ▼]         │
│                                 │
│ Vị trí BD (m): [50  ]           │
│ Vị trí KT (m): [230 ]           │
│                                 │
│ Ngày cập (ETA): [2025-01-01 08:00]│
│ Ngày rời (ETD): [2025-01-02 20:00]│
│                                 │
│ [    CẬP NHẬT KẾ HOẠCH    ]     │
└─────────────────────────────────┘
```

---

## 5. Waiting Ship Card

Card hiển thị tàu trong danh sách chờ:

```
┌─────────────────────────────────────────┐
│║│ 1. VINALINES STAR                [⚓][🗑]│
│║│    Container | 1,200 TEUs              │
│║│    K12A | 50 - 230                     │
│║│    01/01 08:00 → 02/01 20:00           │
└─────────────────────────────────────────┘
 ▲
 Dải màu theo loại hàng
```

- **Draggable**: Có thể kéo thả vào grid
- **Click**: Chọn để xem/sửa chi tiết
- **Nút ⚓**: Cập cầu tự động
- **Nút 🗑**: Xóa khỏi danh sách

---

## 6. Modal Dialogs

### Password Modal (Đăng nhập)
- Hiển thị khi mở ứng dụng
- Input password + nút "Vào chương trình"
- Blur background

### Confirm Modal (Xác nhận)
- Dùng cho xác nhận xóa tàu, xóa kế hoạch
- 2 nút: "Xác nhận" và "Hủy"

### Import Modal (Preview import)
- Hiển thị bảng preview dữ liệu từ Excel
- Cột: Tên, Bến, ETA, ETD, Lỗi, Cảnh báo
- Checkbox chọn dòng import
- Highlight dòng có lỗi (đỏ), cảnh báo (vàng)

---

## 7. Toast Notifications

Thông báo xuất hiện góc phải:

| Type | Màu | Ví dụ |
|------|-----|-------|
| success | Xanh lá | "Đã cập nhật kế hoạch thành công" |
| error | Đỏ | "Lỗi: Tàu bị chồng lấn" |
| warning | Vàng | "Cảnh báo: Khoảng cách < 10% LOA" |
| info | Xanh dương | "Đang xuất PDF..." |

---

## 8. Responsive Behavior

- Grid tự scale theo container width
- Sidebar có width cố định
- Scroll ngang nếu quá nhiều ngày
- Scroll dọc trong waiting list

---

*Tiếp theo: [02_WORKFLOW.md](./02_WORKFLOW.md)*
