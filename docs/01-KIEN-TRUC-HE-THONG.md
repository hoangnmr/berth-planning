# 01 - Kiến trúc Hệ thống & Công nghệ

## 1. Kiến trúc tổng thể

### 1.1 Mô hình

Ứng dụng là **Single Page Application (SPA)** chạy hoàn toàn trên client-side (trình duyệt), không có backend/server. Toàn bộ dữ liệu được lưu trên `localStorage` và import/export qua file.

```
┌─────────────────────────────────────────────┐
│                  Browser                     │
│  ┌─────────────────────────────────────────┐ │
│  │          React App (SPA)                │ │
│  │  ┌─────────┐ ┌─────────┐ ┌───────────┐ │ │
│  │  │  App.js  │ │Components│ │  Utils    │ │ │
│  │  │ (State   │ │(UI Layer)│ │(Business  │ │ │
│  │  │  Hub)    │ │          │ │ Logic)    │ │ │
│  │  └────┬─────┘ └─────────┘ └───────────┘ │ │
│  │       │                                   │ │
│  │  ┌────▼──────┐  ┌──────────┐             │ │
│  │  │ Services  │  │localStorage│            │ │
│  │  │(File I/O) │  │(Auto-save)│            │ │
│  │  └───────────┘  └──────────┘             │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  ┌──────────┐  ┌──────────┐  ┌─────────┐    │
│  │ .xlsx    │  │ .json    │  │ .pdf    │    │
│  │ (Import) │  │(Save/Open)│ │(Export) │    │
│  └──────────┘  └──────────┘  └─────────┘    │
└─────────────────────────────────────────────┘
```

### 1.2 State Management

- **Không sử dụng** state management library (Redux, Zustand, MobX)
- Toàn bộ state được quản lý tại **`App.js`** bằng React `useState` + `useEffect`
- State được truyền xuống component con qua **props** (prop drilling)
- Callback functions được truyền ngược lên qua props

**State chính trong App.js:**

| State | Kiểu | Mô tả |
|-------|------|-------|
| `berthedShips` | Array | Danh sách tàu đã cập cầu (hiển thị trên grid) |
| `waitingShips` | Array | Danh sách tàu đang chờ |
| `selectedShip` | Object/null | Tàu đang được chọn (hiển thị DetailPanel) |
| `startDate` | Date | Ngày bắt đầu hiển thị trên planning grid |
| `numDays` | Number | Số ngày hiển thị (1, 7, 10, 15, 30, 35, 40, 45, 60) |
| `activeBerth` | String/null | Cầu bến đang highlight (khi drag) |
| `activeDayIndex` | Array/null | Các slot thời gian đang highlight |
| `highlightedShips` | Array | ID các tàu đang được highlight (overlap warning) |
| `toast` | Object | Thông báo hiện tại {message, type} |
| `importModalVisible` | Boolean | Hiển thị Import Modal |
| `importRows` | Array | Dữ liệu preview khi import Excel |
| `confirmRemove` | Object | Modal xác nhận xóa tàu từ planner |
| `confirmDeleteWaiting` | Object | Modal xác nhận xóa tàu từ waiting list |
| `showPasswordModal` | Boolean | Hiển thị password modal |
| `passwordInput` | String | Giá trị nhập trong password input |
| `passwordError` | String | Lỗi khi nhập sai password |

### 1.3 Ref đặc biệt

| Ref | Mục đích |
|-----|----------|
| `cranePositionsRef` | Lưu vị trí các cẩu (không trigger re-render) |
| `isRestoringPlan` | Cờ ngăn useEffect lọc tàu khi đang khôi phục kế hoạch |

---

## 2. Cấu trúc thư mục

```
src/
├── App.js                    # Component gốc - chứa toàn bộ state & business logic
├── App.css                   # Import tất cả CSS modules
├── index.js                  # Entry point
│
├── components/
│   ├── common/               # Shared UI components
│   │   ├── ConfirmModal.js   # Modal xác nhận (có Cancel/Confirm)
│   │   ├── ConfirmModal.css
│   │   ├── Modal.js          # Modal tổng quát
│   │   ├── Toast.js          # Toast notification
│   │   └── Toast.css
│   │
│   ├── controls/             # Control components
│   │   └── WaitingShipCard.js # Card hiển thị tàu trong waiting list
│   │
│   ├── layout/               # Layout components
│   │   ├── Header.js         # Thanh header (ngày, số ngày, menu) + ChangePasswordModal
│   │   ├── ControlPanel.js   # Panel bên phải: tạo tàu + waiting list
│   │   ├── DetailPanel.js    # Panel bên phải: chi tiết tàu đã chọn
│   │   └── ImportModal.js    # Modal preview khi import Excel
│   │
│   └── planner/              # Planner components (Grid 2D)
│       ├── BerthPlanner.js   # Container cho planner area
│       ├── BerthHeader.js    # Trục X: tên cầu bến + cẩu
│       ├── PitchRuler.js     # Thước đo mét
│       ├── PlanningGrid.js   # Grid chính: vùng nước + tàu
│       ├── BerthedShip.js    # Component tàu trên grid (drag & drop)
│       └── Crane.js          # Component cẩu (draggable)
│
├── data/
│   └── mockData.js           # Dữ liệu cầu bến, pitch, tàu mẫu
│
├── services/
│   ├── fileService.js        # Import/Export file (JSON, PDF)
│   └── storageService.js     # localStorage operations
│
├── styles/
│   ├── global.css            # CSS variables, reset
│   ├── layout.css            # Layout chính (header, sidebar, grid)
│   ├── planner.css           # Planner-specific styles
│   └── components.css        # Component styles (ship, card, form)
│
└── utils/
    ├── constants.js          # Hằng số (berth definitions, colors, settings)
    ├── dateHelpers.js        # Helper xử lý ngày tháng
    ├── format.js             # Format số (dấu phân cách phần ngàn)
    ├── styleCalculators.js   # Tính style tàu, overlap, berth detection
    ├── berthUtilization.js   # Tính hệ số sử dụng cầu bến
    └── reportHelpers.js      # Helper cho báo cáo
```

---

## 3. Công nghệ sử dụng

### 3.1 Frontend Framework
- **React 18.3.1** - Functional components + Hooks (useState, useEffect, useRef)
- **Create React App 5.0.1** - Build toolchain, dev server, bundling

### 3.2 Libraries
| Library | Version | Mục đích |
|---------|---------|----------|
| `xlsx` (SheetJS) | 0.18.5 | Đọc file Excel (.xlsx/.xls) khi import |
| `jsPDF` | 3.0.3 | Tạo file PDF từ JavaScript |
| `html2canvas` | 1.4.1 | Chụp DOM element thành canvas (phục vụ PDF export) |

### 3.3 Styling
- **CSS thuần** - Không sử dụng CSS framework (Tailwind, Bootstrap)
- **CSS Variables** - Quản lý theme/colors qua CSS custom properties
- **Flexbox** là layout chính
- **CSS calc()** - Tính toán vị trí tàu theo tỷ lệ mét/tổng chiều dài

### 3.4 Storage
- **localStorage** - Lưu state (berthedShips, waitingShips, startDate, numDays, cranes)
- **File-based** - Import/Export qua JSON và Excel

### 3.5 Rendering
- **React `createPortal`** - Render tooltip tàu bên ngoài component tree (tránh bị clip bởi overflow)
- **`requestAnimationFrame`** - Update tooltip position mượt khi drag

---

## 4. Luồng dữ liệu (Data Flow)

### 4.1 Khởi động
```
1. App mount → loadFromLocalStorage()
2. Nếu có saved state → Khôi phục berthedShips, waitingShips, startDate, numDays, cranes
3. Nếu không → Sử dụng giá trị mặc định (startDate = hôm nay, numDays = 7)
4. Hiển thị Password Modal → Nhập đúng mật khẩu → Hiển thị giao diện chính
```

### 4.2 Auto-save
```
Bất kỳ thay đổi nào trên berthedShips, waitingShips, startDate, numDays
  → useEffect trigger
  → Serialize data (Date → ISO string)
  → Ghi vào localStorage key 'berthPlannerState'
```

### 4.3 Import Excel
```
1. User click "Import kế hoạch từ Excel"
2. Confirm xóa kế hoạch hiện tại
3. Chọn file .xlsx → SheetJS đọc file
4. Parse rows → Normalize headers (hỗ trợ tiếng Việt & tiếng Anh)
5. Validate từng row (tên, ngày, vị trí, overlap)
6. Hiển thị ImportModal (preview table)
7. User chọn rows → Click "Nhập mục đã chọn"
8. Tự động phân loại: có berthName hợp lệ → berthedShips, không → waitingShips
9. Tự động điều chỉnh startDate và numDays theo dữ liệu import
```

### 4.4 Ship Drag & Drop
```
Từ Waiting List → Grid:
1. User drag WaitingShipCard (HTML5 drag)
2. Thả vào PlanningGrid
3. Xác định berth từ tọa độ X (dựa trên blockDefs)
4. Tính vị trí relative-to-berth
5. Tính ETA/ETD từ tọa độ Y
6. Tạo ship object mới → thêm vào berthedShips, xóa khỏi waitingShips

Trong Grid (di chuyển tàu):
1. MouseDown trên BerthedShip → bắt đầu drag
2. MouseMove → Tính deltaX/deltaY → Cập nhật vị trí
3. Real-time overlap check → Visual feedback (đỏ nếu overlap)
4. MouseUp → Snap to nearest time slot
5. Nếu overlap → Rollback về vị trí ban đầu
6. Nếu OK → Cập nhật berthedShips state
```

---

## 5. Gợi ý khi triển khai lại

### 5.1 Cải tiến kiến trúc
- Sử dụng state management (Zustand hoặc Redux Toolkit) thay vì prop drilling
- Tách business logic ra khỏi App.js thành custom hooks hoặc services
- Sử dụng TypeScript cho type safety
- Component modular hơn, tránh file 2000+ dòng

### 5.2 Cải tiến công nghệ
- Next.js hoặc Vite thay CRA (đã deprecated)
- Tailwind CSS hoặc CSS Modules thay CSS thuần
- React DnD hoặc DnD Kit thay vì HTML5 drag API + manual mouse events
- Canvas (Konva.js) hoặc SVG cho planning grid thay vì DOM elements
- IndexedDB hoặc backend API thay localStorage cho data lớn

### 5.3 Cải tiến UX
- Undo/Redo
- Multi-select tàu
- Zoom in/out planning grid
- Keyboard shortcuts
- Responsive design cho tablet/mobile
