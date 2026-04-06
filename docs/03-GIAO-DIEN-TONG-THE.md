# 03 - Giao diện Tổng thể (GUI Specification)

## 1. Layout tổng thể

Giao diện chia thành 3 phần chính theo layout **column (dọc)**:

```
┌─────────────────────────────────────────────────────────────────┐
│                        HEADER (60px, fixed)                      │
│  [Tiêu đề]                    [Ngày BD] [Số ngày] [⚙ Menu]     │
├───────────────────────────────────────────┬──────────────────────┤
│              PLANNER AREA                 │   RIGHT SIDEBAR      │
│  ┌─── Berth Header (tên cầu) ──────────┐ │   (Control Panel     │
│  ├─── Crane Rail (vị trí cẩu) ─────────┤ │    hoặc              │
│  ├─── Pitch Ruler (thước mét) ─────────┤ │    Detail Panel)     │
│  ├─── Planning Grid ────────────────────┤ │                      │
│  │  ┌──────┐                            │ │                      │
│  │  │Timeline│  [Grid chứa tàu]        │ │                      │
│  │  │(Y axis)│                          │ │                      │
│  │  └──────┘                            │ │                      │
│  └──────────────────────────────────────┘ │                      │
├───────────────────────────────────────────┴──────────────────────┤
│                        FOOTER (copyright)                        │
└─────────────────────────────────────────────────────────────────┘
```

- **Full viewport height** (`height: 100vh`)
- Planner area chiếm phần lớn, scroll dọc khi nội dung dài (nhiều ngày)
- Right Sidebar có chiều rộng cố định

---

## 2. Header

### 2.1 Bố cục

```
┌──────────────────────────────────────────────────────────────────┐
│ HỆ THỐNG QUẢN LÝ CẦU BẾN (Berth Planning)                      │
│                                                                    │
│                    [Ngày bắt đầu: ◀ 01/01/2025 ▶]  [Hiển thị: 7 ngày]  [⚙] │
└──────────────────────────────────────────────────────────────────┘
```

### 2.2 Thành phần

| Element | Mô tả | Chi tiết |
|---------|-------|----------|
| **Tiêu đề** | Text cố định bên trái | "HỆ THỐNG QUẢN LÝ CẦU BẾN (Berth Planning)" |
| **Ngày bắt đầu** | Date picker + nút ◀/▶ | Input `type="date"`, nút ◀ giảm 1 ngày, ▶ tăng 1 ngày |
| **Số ngày** | Dropdown select | Options: 1, 7, 10, 15, 30, 35, 40, 45, 60 ngày |
| **Menu ⚙** | Nút bánh răng, click mở dropdown | Chứa các action chính |

### 2.3 Menu Dropdown (⚙)

Khi click nút bánh răng, dropdown hiển thị từ trên xuống, chia thành các nhóm:

```
┌─────────────────────────────┐
│ 📂 Mở Kế hoạch              │  ← Mở file .json
│ 💾 Lưu Kế hoạch             │  ← Save file .json
├─────────────────────────────┤
│ 📊 Import kế hoạch từ EXCEL │  ← Mở file .xlsx
├─────────────────────────────┤
│ 📄 Xuất PDF                 │  ← Export planning grid ra PDF
│ 📋 Xuất Báo cáo chi tiết   │  ← Mở tab mới với báo cáo HTML
├─────────────────────────────┤
│ � Đổi Mật khẩu            │  ← Mở ChangePasswordModal
├─────────────────────────────┤
│ �🗑️ Xóa Kế hoạch            │  ← Xóa toàn bộ (text màu đỏ)
└─────────────────────────────┘
```

- Menu tự đóng khi click ra ngoài
- "Import" yêu cầu confirm xóa kế hoạch hiện tại trước
- "Xóa" yêu cầu confirm

---

## 3. Planner Area

### 3.1 Berth Header (Trục X - Thanh cầu bến)

```
┌──────────────────────────────────────────────────────────────┐
│         │ gap │ K12C │gap30│ K12A │   K12  │  K12B  │gap20│  TT2  │gap│
│ (spacer)│ 10m │(189m)│     │(132m)│ (188m) │ (204m) │     │(222m) │10m│
│         │     │      │     │      │        │        │     │       │   │
│  (Cẩu)  │     │ GW1 GW2   │ GW3  GW4   GW5    GC1  GC2 │ LB1   LB40│
└──────────────────────────────────────────────────────────────┘
```

**Hàng 1 - Tên bến:**
- Hiển thị tên + chiều dài: "K12C (189m)", "K12A (132m)"...
- Chiều rộng tỷ lệ với chiều dài thực: `flex-basis: calc(189 / 1005 * 100%)`
- Gap (khoảng trống) hiển thị bằng div riêng, nền trắng, border dashed
- Cầu bến đang active (khi drag tàu) có highlight (class `berth-active`)

**Hàng 2 - Đường ray cẩu:**
- 2 block ray: GW-main (743m, chứa GW+GC) và TT2 (222m, chứa LB)
- Cẩu hiển thị dạng icon (tròn/vuông) có label tên ngắn
- Cẩu có thể kéo thả trên ray (constrained by minPercent/maxPercent)

### 3.2 Pitch Ruler (Thước đo mét)

Nằm ngay dưới Berth Header, hiển thị các mốc đo mét:

```
│ |  |  |  |  |  |  |  |     |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |     |  |  |  |  |  |  |  |  |  |  |  |  |  |
│ 0 24 53 79...              7 34 54 78 98...148 173 202...320 339 362...              0 12 30 45 61 79 97...
│         K12C                     K12A    K12       K12B                                      TT2
```

- Mỗi pitch: dấu chấm nhỏ + số ID + label mét
- Pitch B1 và B2 (màu đỏ) nằm ở các gap
- Pitch được chia vào 3 block tương ứng với cấu trúc cầu bến

### 3.3 Planning Grid (Vùng nước - Grid chính)

**Cấu trúc:**
```
┌────────────┬───────────────────────────────────────────┐
│  Timeline  │              Grid Main                     │
│  (trục Y)  │  [gap│K12C│gap│K12A│K12│K12B│gap│TT2│gap] │
│            │                                             │
│ T2 01/01   │  ┌─────────┐                               │
│  NGÀY      │  │  Tàu A   │     ┌──────┐                │
│  ĐÊM       │  └─────────┘     │ Tàu B │                │
│            │                   └──────┘                  │
│ T3 02/01   │                                             │
│  NGÀY      │        ┌──────────────┐                    │
│  ĐÊM       │        │   Tàu C      │                    │
│            │        └──────────────┘                    │
│ ...        │                                             │
└────────────┴───────────────────────────────────────────┘
```

**Timeline (trục Y - cột trái):**
- Mỗi ngày = 2 slot: NGÀY (12h) + ĐÊM (12h)
- Mỗi slot cao 30px → 1 ngày = 60px
- Hiển thị: thứ (T2, T3... CN), ngày (dd/mm), NGÀY/ĐÊM
- Slot active (khi tàu hover/drag) có highlight (class `day-active`)

**Grid Main (vùng nước):**
- Chia thành các cột (column) tương ứng với cầu bến + gap
- Mỗi cột chứa các div ngày/đêm để tạo đường kẻ ngang
- **Tàu (BerthedShip)** được render absolute trên grid, vị trí tính bằng `left`, `top`, `width`, `height`
- Grid hỗ trợ **drag & drop** từ waiting list (HTML5 Drag API)
- Click vào vùng trống → deselect tàu hiện tại

---

## 4. Tàu trên Grid (BerthedShip Component)

### 4.1 Cấu trúc visual

Tàu hiển thị dạng hình chữ nhật nằm ngang trong grid:

```
Mạn trái (left):                      Mạn phải (right):
┌───▶│ Tên | Hàng               │█│   │█│ Tên | Hàng             │◀───┐
│    │ dd/mm|hh:mm → dd/mm|hh:mm│ │   │ │ dd/mm|hh:mm→dd/mm|hh:mm│   │
│(0) │                    [CHỜ][RỜI]│(189)│(0)                 [CHỜ][RỜI]│(189)
└────┘                               └────┘
 Mũi(Bow)    Body(Details)    Cabin    Cabin   Body(Details)    Mũi(Bow)
```

- **Mũi tàu (Bow):** Hình tam giác/mũi tên, hướng theo mạn cập
- **Thân tàu (Details):** Hiển thị tên + hàng, thời gian ETA → ETD
- **Cabin (đuôi tàu):** Block nhỏ ở đầu kia
- **Vị trí (Position):** Số mét ở 2 đầu tàu (start/end)
- **Nút hành động:** CHỜ (chuyển về waiting list), RỜI (xóa khỏi planner) - chỉ hiện khi hover

### 4.2 Màu sắc theo loại hàng

| Loại hàng | Màu nền | Mô tả |
|-----------|---------|-------|
| Container | Cam nhạt (ship-fill-container) | Gradient cam |
| Sắt thép | Xanh lá nhạt (ship-fill-steel) | Gradient xanh |
| Hàng khác | Xanh dương nhạt (ship-fill-other) | Gradient xanh dương |

### 4.3 Trạng thái visual

| Trạng thái | Hiển thị |
|------------|----------|
| **Bình thường** | Màu nền theo loại hàng, cursor grab |
| **Đang được chọn** | Border nổi bật (ship-selected) |
| **Đang drag** | Cursor grabbing, vị trí thay đổi theo chuột |
| **Overlap (chồng lấn)** | Viền đỏ nhấp nháy (ship-overlap) |
| **Gap warning** | Viền vàng (ship-gap-warning) |
| **Highlighted** | Highlight đặc biệt (ship-highlighted) |

### 4.4 Tooltip

Khi hover vào tàu, tooltip hiển thị bên cạnh (portal, tránh bị clip):

```
┌───────────────────────────────┐
│ M/v TÊN TÀU                  │
│ DWT: 22000 | LOA: 180m       │
│ Container | 1.200 cont        │
│ ETA: 01/01 - 08:00           │
│ ETD: 02/01 - 20:00           │
│ Duration: 1 ngày 12 giờ      │
│ Bến: K12A | 0 - 180          │
└───────────────────────────────┘
```

- Tooltip tự động ẩn sau 5 giây không tương tác
- Tooltip theo tàu khi drag
- Tooltip của tàu khác bị ẩn khi đang drag 1 tàu

### 4.5 Font size tự động

Tàu nhỏ (LOA nhỏ) sẽ tự động giảm font size để vừa khung:

| LOA | Font size |
|-----|-----------|
| ≤ 60m | 10px |
| ≤ 90m | 12px |
| ≤ 120m | 13px |
| > 120m | 15px |

Nếu nội dung vẫn tràn, hệ thống tính toán `dynamicFontSize` bằng cách đo kích thước DOM thực tế và scale xuống (min 8px).

---

## 5. Right Sidebar

Sidebar bên phải hiển thị 1 trong 2 panel, tùy thuộc vào trạng thái:

### 5.1 Control Panel (khi KHÔNG có tàu được chọn)

```
┌─────────────────────────────┐
│ TẠO TÀU MỚI                │
│                             │
│ Tên tàu: [________]        │
│ IMO:     [________]        │
│ DWT: [___] LOA: [___]      │
│ BEAM: [___]                │
│ Loại hàng: [▼ Sắt thép]    │
│ Số lượng:  [________]      │
│ [Thêm vào tàu chờ]         │
├─────────────────────────────┤
│ TÀU ĐANG CHỜ CẦU (3)      │
│                             │
│ ┌───────────────────────┐  │
│ │█ 1. VINALINES STAR     │🚢│🗑│
│ │  Container | 1.200 TEUs│  │
│ │  K12A | 0 - 180        │  │
│ │  01/01|08:00 → 02/01|20│  │
│ └───────────────────────┘  │
│                             │
│ ┌───────────────────────┐  │
│ │█ 2. HAI PHONG 36      │🚢│🗑│
│ │  Sắt thép | 8.000 tấn │  │
│ │  N/A → N/A             │  │
│ └───────────────────────┘  │
│ ...                         │
└─────────────────────────────┘
```

**Form tạo tàu:**
- Các field: Tên tàu, IMO, DWT, LOA, BEAM, Loại hàng (select), Số lượng
- Nút "Thêm vào tàu chờ" → Tạo ship object mới, thêm vào waitingShips

**Waiting List:**
- Tiêu đề hiển thị số lượng: "Tàu Đang Chờ Cầu (3)"
- Danh sách card, sắp xếp theo ETA tăng dần
- Mỗi card (WaitingShipCard):
  - Thanh màu bên trái (theo loại hàng)
  - Số thứ tự, tên tàu
  - Loại hàng + khối lượng
  - Thông tin bến (nếu có)
  - ETA → ETD
  - Nút "Cập cầu" 🚢 (icon mỏ neo)
  - Nút "Xóa" 🗑
- Card có thể **drag** vào Planning Grid
- Click card → Mở DetailPanel

### 5.2 Detail Panel (khi CÓ tàu được chọn)

```
┌─────────────────────────────┐
│ THÔNG TIN CHI TIẾT TÀU  [✕]│
│                             │
│ Tên tàu: [VINALINES STAR]  │
│ DWT: [22000]  LOA: [180]   │
│ BEAM: [28]                  │
│ Loại hàng: [▼ Container]   │
│ Số lượng: [1200]            │
│ Cầu bến: [▼ K12A]          │
│ Mạn cập: [▼ Mạn trái]      │
│ Vị trí BD: [0] KT: [180]   │
│ ETA: [2025-01-01T08:00]    │
│ ETD: [2025-01-02T20:00]    │
│                             │
│ [Cập Nhật Kế Hoạch]         │
└─────────────────────────────┘
```

- Form chỉnh sửa toàn bộ thông tin tàu
- Khi thay đổi `start` → tự động tính `end = start + LOA`
- Khi thay đổi `end` → tự động tính `start = end - LOA`
- Khi thay đổi `LOA` → tự động tính `end = start + LOA mới`
- Khi chọn bến mới (chưa có start/end) → tự động gán vị trí đầu bến
- Nút "Cập Nhật Kế Hoạch" → Validate + Overlap check → Cập nhật state

---

## 6. Modal & Overlay

### 6.1 Password Modal
- Hiển thị khi khởi động app
- Backdrop blur + overlay
- Input password + nút "Vào chương trình"
- Hiển thị password hiện tại (italic, xám)
- Mật khẩu mặc định: "HoangTT", lưu trong localStorage

### 6.2 Confirm Modal
- Dùng cho: xóa tàu khỏi planner, xóa tàu khỏi waiting list, xóa kế hoạch
- Overlay + card trung tâm
- Tiêu đề + message + 2 nút (Hủy / Xác nhận)

### 6.3 Import Modal
- Hiển thị khi import Excel
- Table preview toàn bộ dữ liệu đã parse
- Các cột: checkbox, Tên tàu, Trạng thái, Bến, Start, End, ETA, ETD, Loại hàng, Xung đột, Kiểm tra
- Row lỗi: nền đỏ nhạt, checkbox disabled
- Row overlap: nền vàng, ghi chú "Sẽ chuyển vào danh sách chờ"
- Nút: "Bỏ chọn/Chọn tất cả", "Hủy", "Nhập mục đã chọn"

### 6.4 Toast Notification
- Hiển thị ở vị trí cố định (thường là trên cùng hoặc góc)
- 4 loại: success (xanh lá), error (đỏ), warning (vàng), info (xanh dương)
- Tự ẩn sau 2.5 giây

---

## 7. Highlight & Active State

### 7.1 Berth Active
- Khi drag tàu, cầu bến mà tàu đang nằm trên sẽ highlight
- CSS class: `berth-active`

### 7.2 Day/Slot Active
- Khi drag tàu hoặc hover, các slot NGÀY/ĐÊM tương ứng sẽ highlight
- Hỗ trợ multi-slot highlight (tàu dài nhiều ngày)
- CSS classes: `day-active`, `slot-day-active`, `slot-night-active`

### 7.3 Ship Highlighted
- Khi phát hiện overlap, cả 2 tàu xung đột sẽ highlight 3 giây
- CSS class: `ship-highlighted`

---

## 8. Responsive & Print

### 8.1 Responsive
- Header buttons tự wrap khi màn hình nhỏ
- Table ẩn cột từ cột thứ 8 trở đi khi < 900px
- Planning grid scroll cả 2 chiều

### 8.2 Print
- CSS `@media print` hỗ trợ in A4 landscape
- Ẩn controls khi in
- Đảm bảo table-wrap không bị chia trang

---

## 9. Footer

- Thanh nằm ngang dưới cùng màn hình
- Nội dung: `© Nguyen Hoang & Ban Khai thac | Trung tam DHKT KV TAN THUAN`
- Font nhỏ, màu xám, căn giữa

---

## 10. Responsive Behavior

- Grid tự scale theo container width
- Right Sidebar có width cố định (~300px)
- Planning Grid scroll ngang và dọc khi nội dung tràn
- Header buttons tự wrap khi màn hình nhỏ
- Waiting list scroll dọc khi nhiều tàu
- Import Modal table ẩn cột từ cột thứ 8 trở đi khi < 900px

---

## 11. Change Password Modal

Modal đổi mật khẩu nằm trong Header.js:

```
┌──────────────────────────────┐
│ ĐỔI MẬT KHẨU                  │
├──────────────────────────────┤
│ Mật khẩu cũ: [__________]     │
│ Mật khẩu mới: [__________]   │
│ Xác nhận:    [__________]     │
│                              │
│    [Hủy]    [Xác nhận]       │
└──────────────────────────────┘
```

**Workflow:**
1. User mở từ Menu ⚙ → "Đổi Mật khẩu"
2. Nhập mật khẩu cũ, mật khẩu mới, xác nhận mật khẩu mới
3. Validate: mật khẩu cũ đúng, mật khẩu mới khới trắng, xác nhận khớp
4. Lưu mật khẩu mới vào localStorage key `plannerPassword`
5. Toast thành công
