# Chi Tiết Components

## Cấu Trúc Thư Mục Components

```
src/components/
├── common/             # Components dùng chung
│   ├── ConfirmModal.js
│   └── Toast.js
├── controls/           # Controls tương tác
│   └── WaitingShipCard.js
├── layout/             # Layout chính
│   ├── Header.js
│   ├── ControlPanel.js
│   └── DetailPanel.js
└── planner/            # Berth Planner
    ├── BerthPlanner.js
    ├── BerthHeader.js
    ├── Crane.js
    ├── PitchRuler.js
    ├── PlanningGrid.js
    └── BerthedShip.js
```

---

## 1. App.js (Root Component)

### Mô tả
Component gốc quản lý toàn bộ state và logic chính của ứng dụng.

### State

| State | Type | Mô tả |
|-------|------|-------|
| `berthedShips` | Array | Danh sách tàu đã cập cầu |
| `waitingShips` | Array | Danh sách tàu chờ |
| `selectedShip` | Object/null | Tàu đang được chọn |
| `highlightedShips` | Array | IDs tàu được highlight |
| `startDate` | Date | Ngày bắt đầu hiển thị |
| `numDays` | Number | Số ngày hiển thị |
| `showPasswordModal` | Boolean | Hiển thị modal đăng nhập |
| `showImportModal` | Boolean | Hiển thị modal import |
| `toasts` | Array | Danh sách toast notification |

### Props truyền xuống

```jsx
<Header
  numDays={numDays}
  onDayChange={handleDayChange}
  startDate={startDate}
  onStartDateChange={setStartDate}
  onSavePlan={handleSavePlan}
  onOpenPlan={handleOpenPlan}
  onClearPlan={handleClearPlan}
  onImportPlan={handleImportPlan}
  onExportPDF={handleExportPDF}
  onExportDetailedReport={handleExportDetailedReport}
/>

<BerthPlanner
  numDays={numDays}
  startDate={startDate}
  berthedShips={berthedShips}
  selectedShip={selectedShip}
  highlightedShips={highlightedShips}
  onShipClick={handleShipClick}
  onDropShip={handleDropFromWaiting}
  onShipPositionChange={handleShipPositionChange}
  onShipDragEnd={handleShipDragEnd}
  onRemoveShip={handleRemoveShip}
  onMoveToWaiting={handleMoveToWaiting}
/>

<ControlPanel
  waitingShips={waitingShips}
  highlightedShips={highlightedShips}
  onShipSelect={handleShipSelect}
  onAddWaitingShip={handleAddWaitingShip}
  onDockShip={handleDockShipFromWaiting}
  onDeleteWaitingShip={handleDeleteWaitingShip}
/>

<DetailPanel
  ship={selectedShip}
  onClose={() => setSelectedShip(null)}
  onUpdate={handleUpdateShipPlan}
  onToast={showToast}
/>
```

### Handlers chính

| Handler | Trigger | Mô tả |
|---------|---------|-------|
| `handleShipClick` | Click vào BerthedShip | Set selectedShip |
| `handleShipPositionChange` | Drag ship trong grid | Cập nhật vị trí tàu |
| `handleDockShipFromWaiting` | Click nút Dock hoặc drag-drop | Chuyển tàu từ waiting → berthed |
| `handleMoveToWaiting` | Click nút CHỜ | Chuyển tàu từ berthed → waiting |
| `handleRemoveShip` | Click nút RỜI | Xóa tàu khỏi kế hoạch |
| `handleUpdateShipPlan` | Submit form DetailPanel | Cập nhật thông tin tàu |
| `handleImportPlan` | Click Import Excel | Mở modal import |
| `handleExportPDF` | Click Xuất PDF | Trigger export PDF |
| `handleExportDetailedReport` | Click Xuất Báo cáo | Tạo báo cáo HTML + CSV |

---

## 2. Header.js

### Mô tả
Thanh header chứa các control chính và menu tùy chọn.

### Internal State

| State | Type | Mô tả |
|-------|------|-------|
| `isMenuOpen` | Boolean | Menu dropdown đang mở |
| `showImportConfirm` | Boolean | Confirm modal cho import |
| `showClearConfirm` | Boolean | Confirm modal cho clear |
| `showChangePassword` | Boolean | Modal đổi mật khẩu |
| `passwordFields` | Object | Form fields đổi password |

### Props nhận

| Prop | Type | Mô tả |
|------|------|-------|
| `numDays` | Number | Số ngày hiển thị |
| `onDayChange` | Function | Callback thay đổi số ngày |
| `startDate` | Date | Ngày bắt đầu |
| `onStartDateChange` | Function | Callback thay đổi ngày |
| `onSavePlan` | Function | Lưu kế hoạch |
| `onOpenPlan` | Function | Mở kế hoạch |
| `onClearPlan` | Function | Xóa kế hoạch |
| `onImportPlan` | Function | Import từ Excel |
| `onExportPDF` | Function | Xuất PDF |
| `onExportDetailedReport` | Function | Xuất báo cáo |

### Sub-components

- **ChangePasswordModal**: Modal đổi mật khẩu (inline)
- **ConfirmModal**: Import từ common/

---

## 3. BerthPlanner.js

### Mô tả
Container component cho toàn bộ khu vực berth planning.

### Cấu trúc

```jsx
<div className="berth-planner">
  <BerthHeader berths={...} cranes={...} activeBerth={...} />
  <PitchRuler />
  <PlanningGrid
    days={daysArray}
    startDate={startDate}
    berthedShips={berthedShips}
    onDropShip={onDropShip}
    ...
  />
</div>
```

### Helper Function

```javascript
// Tạo mảng ngày để render timeline
function generateDays(startDate, numDays) {
  const days = [];
  for (let i = 0; i < numDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    days.push({
      date: date,
      dayOfWeek: ['CN','T2','T3','T4','T5','T6','T7'][date.getDay()],
      dateStr: formatDate(date)
    });
  }
  return days;
}
```

---

## 4. BerthHeader.js

### Mô tả
Hàng header hiển thị tên các bến và đường ray cẩu.

### Internal State

```javascript
const [cranePositions, setCranePositions] = useState([
  { id: 'GW1', shape: 'circle', colorClass: 'crane-color-gw', 
    left: 'calc(50/743*100%)', block: 'gw-main', 
    minPercent: 0, maxPercent: 100 },
  // ... 8 cẩu khác
]);
```

### Props nhận

| Prop | Type | Mô tả |
|------|------|-------|
| `berths` | Array | Danh sách bến (không dùng, dữ liệu hardcode) |
| `cranes` | Array | Danh sách cẩu |
| `activeBerth` | String | Bến đang active (highlight) |
| `setCranePositionsRef` | Function | Callback cập nhật vị trí cẩu |

### Cấu trúc DOM

```
berth-header-container
├── timeline-spacer (ô trống góc trái)
└── berth-axis-row-wrapper
    ├── berth-container (hàng tên bến)
    │   ├── berth-gap-10
    │   ├── berth-block-k12c
    │   ├── berth-gap-30
    │   ├── berth-block-k12a
    │   ├── berth-block-k12
    │   ├── berth-block-k12b
    │   ├── berth-gap-20
    │   ├── berth-block-tt2
    │   └── berth-gap-10
    └── crane-rail-container (hàng cẩu)
        ├── crane-rail-gap-10
        ├── crane-rail-block-gw-main (GW1-5, GC1-2)
        ├── crane-rail-gap-20
        ├── crane-rail-block-tt2 (LB1, LB40)
        └── crane-rail-gap-10
```

---

## 5. PlanningGrid.js

### Mô tả
Grid chính hiển thị lưới thời gian và các tàu đã cập cầu.

### Props nhận

| Prop | Type | Mô tả |
|------|------|-------|
| `days` | Array | Mảng ngày để render |
| `startDate` | Date | Ngày bắt đầu |
| `berthedShips` | Array | Danh sách tàu |
| `selectedShip` | Object | Tàu đang chọn |
| `highlightedShips` | Array | IDs highlight |
| `onShipClick` | Function | Callback click ship |
| `onDropShip` | Function | Callback drop waiting ship |
| `onShipPositionChange` | Function | Callback di chuyển ship |
| `onShipDragEnd` | Function | Callback kết thúc drag |
| `onRemoveShip` | Function | Callback xóa ship |
| `onMoveToWaiting` | Function | Callback chuyển về waiting |

### Xử lý Events

**handleDragOver:**
- Tính vị trí drop dựa trên mouse position
- Xác định berth từ tọa độ X
- Highlight slot tương ứng

**handleDrop:**
- Parse ship data từ dataTransfer
- Tính eta, etd dựa trên vị trí Y
- Tính left, width dựa trên vị trí X và LOA
- Gọi onDropShip với ship đã có thông tin vị trí

### Tính toán Ship Style

```javascript
function calculateShipStyle(ship, startDate) {
  // Tính top từ eta
  const etaDate = new Date(ship.eta);
  const startMs = startDate.getTime();
  const etaMs = etaDate.getTime();
  const slotIndex = Math.floor((etaMs - startMs) / MS_PER_SLOT);
  const top = slotIndex * SLOT_HEIGHT;

  // Tính height từ etd - eta
  const etdDate = new Date(ship.etd);
  const durationMs = etdDate.getTime() - etaMs;
  const durationSlots = Math.ceil(durationMs / MS_PER_SLOT);
  const height = Math.max(MIN_SHIP_HEIGHT, durationSlots * SLOT_HEIGHT);

  // left và width lấy từ ship.style (đã tính sẵn)
  return {
    ...ship.style,
    top: `${top}px`,
    height: `${height}px`
  };
}
```

---

## 6. BerthedShip.js

### Mô tả
Component hiển thị một tàu đã cập cầu trên grid.

### Internal State

| State | Type | Mô tả |
|-------|------|-------|
| `isDragging` | Boolean | Đang được kéo |
| `dragStart` | Object | Vị trí bắt đầu drag |
| `showTooltip` | Boolean | Hiển thị tooltip |
| `tooltipPos` | Object | Vị trí tooltip |
| `tooltipTimer` | Ref | Timer cho tooltip delay |

### Props nhận

| Prop | Type | Mô tả |
|------|------|-------|
| `ship` | Object | Dữ liệu tàu |
| `style` | Object | CSS style (position) |
| `isSelected` | Boolean | Đang được chọn |
| `highlightedShips` | Array | IDs highlight |
| `allShips` | Array | Tất cả ships (cho overlap check) |
| `onShipClick` | Function | Callback click |
| `onShipPositionChange` | Function | Callback thay đổi vị trí |
| `onShipDragEnd` | Function | Callback kết thúc drag |
| `onRemoveShip` | Function | Callback xóa |
| `onMoveToWaiting` | Function | Callback về waiting |

### Tính vị trí (calculatePositions)

```javascript
const calculatePositions = () => {
  // Ưu tiên ship.start/end nếu có
  if (ship.start !== null && ship.end !== null) {
    return { start: ship.start, end: ship.end };
  }
  
  // Parse từ style.left và style.width
  const leftMatch = ship.style.left.match(/calc\((-?\d+)\/(\d+)\*100%\)/);
  const widthMatch = ship.style.width.match(/calc\((\d+)\/(\d+)\*100%\)/);
  
  if (leftMatch && widthMatch) {
    const absStart = parseInt(leftMatch[1]);
    const width = parseInt(widthMatch[1]);
    const absEnd = absStart + width;
    
    // Chuyển về hệ quy chiếu của berth
    const berthDef = BERTH_DEFINITIONS.find(b => b.id === ship.berthName);
    if (berthDef) {
      return {
        start: absStart - berthDef.refStart,
        end: absEnd - berthDef.refStart
      };
    }
  }
  return { start: 0, end: 0 };
};
```

### Drag & Drop Logic

```javascript
// MouseDown - bắt đầu drag
const handleMouseDown = (e) => {
  e.preventDefault();
  setIsDragging(true);
  setDragStart({ x: e.clientX, y: e.clientY, left: currentLeft, top: currentTop });
};

// MouseMove - di chuyển
const handleMouseMove = (e) => {
  if (!isDragging) return;
  const dx = e.clientX - dragStart.x;
  const dy = e.clientY - dragStart.y;
  // Cập nhật position tạm thời
  updateTempPosition(dragStart.left + dx, dragStart.top + dy);
};

// MouseUp - kết thúc và snap
const handleMouseUp = () => {
  setIsDragging(false);
  // Snap to grid
  const snappedTop = Math.round(currentTop / SLOT_HEIGHT) * SLOT_HEIGHT;
  // Kiểm tra overlap
  const hasOverlap = checkOverlap(newPosition, allShips);
  if (hasOverlap) {
    // Revert hoặc highlight warning
  } else {
    onShipPositionChange(ship.id, newPosition);
  }
};
```

### Cấu trúc DOM

```
.berthed-ship (mandra left)
├── .ship-bow (mũi tàu)
├── .ship-body (thân)
│   ├── .ship-header (tên + cargo)
│   └── .ship-footer (ETA → ETD)
├── .ship-cabin (đuôi tàu)
├── .ship-position-start (góc dưới trái)
├── .ship-position-end (góc dưới phải)
└── .ship-hover-buttons
    ├── button.btn-wait (CHỜ)
    └── button.btn-depart (RỜI)
```

---

## 7. ControlPanel.js

### Mô tả
Panel bên phải hiển thị form tạo tàu và danh sách tàu chờ.

### Props nhận

| Prop | Type | Mô tả |
|------|------|-------|
| `waitingShips` | Array | Danh sách tàu chờ |
| `highlightedShips` | Array | IDs highlight |
| `onShipSelect` | Function | Callback chọn ship |
| `onAddWaitingShip` | Function | Callback thêm ship mới |
| `onDockShip` | Function | Callback cập cầu |
| `onDeleteWaitingShip` | Function | Callback xóa |

### Cấu trúc

```jsx
<div className="panel control-panel">
  <section>
    <h2>Tạo Tàu Mới</h2>
    <div className="form-container">
      {/* Form inputs */}
      <button onClick={handleAddShip}>Thêm vào tàu chờ</button>
    </div>
  </section>
  
  <section>
    <h2>Tàu Đang Chờ Cầu ({waitingShips.length})</h2>
    <div className="waiting-list-container">
      {sortedShips.map(ship => (
        <WaitingShipCard key={ship.id} ship={ship} ... />
      ))}
    </div>
  </section>
</div>
```

### Sorting Logic

```javascript
// Sắp xếp theo ETA tăng dần
[...waitingShips].sort((a, b) => {
  const aEta = a.eta ? new Date(a.eta).getTime() : Infinity;
  const bEta = b.eta ? new Date(b.eta).getTime() : Infinity;
  return aEta - bEta;
})
```

---

## 8. DetailPanel.js

### Mô tả
Panel hiển thị và chỉnh sửa thông tin chi tiết của tàu đang chọn.

### Internal State

```javascript
const [form, setForm] = useState({
  name: ship.name || '',
  dwt: ship.dwt || '',
  loa: ship.loa || '',
  beam: ship.beam || '',
  cargoType: ship.cargoType || '',
  cargo: ship.cargo || '',
  berthName: ship.berthName || '',
  mandra: ship.mandra || '',
  start: calculatedStart,
  end: calculatedEnd,
  eta: formatDateTimeLocal(ship.eta),
  etd: formatDateTimeLocal(ship.etd)
});
```

### Props nhận

| Prop | Type | Mô tả |
|------|------|-------|
| `ship` | Object | Tàu đang chọn |
| `onClose` | Function | Đóng panel |
| `onUpdate` | Function | Cập nhật ship |
| `onToast` | Function | Hiển thị toast |

### Auto-calculation Logic

```javascript
// Khi chọn bến mới → auto set start position
useEffect(() => {
  if (form.berthName && FIRST_POS_BY_BERTH[form.berthName]) {
    const newStart = FIRST_POS_BY_BERTH[form.berthName];
    const loa = Number(form.loa) || 0;
    setForm(prev => ({
      ...prev,
      start: newStart,
      end: newStart + loa
    }));
  }
}, [form.berthName]);

// Thay đổi start → update end
if (name === 'start' && loa) {
  newForm.end = Number(value) + loa;
}

// Thay đổi end → update start
if (name === 'end' && loa) {
  newForm.start = Number(value) - loa;
}

// Thay đổi LOA → update end
if (name === 'loa') {
  newForm.end = Number(newForm.start) + Number(value);
}
```

### Submit Logic

```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  
  // Validate ETD > ETA
  if (new Date(form.etd) <= new Date(form.eta)) {
    onToast('ETD phải lớn hơn ETA!', 'error');
    return;
  }
  
  // Tính style mới
  const berthDef = BERTH_DEFINITIONS.find(b => b.id === form.berthName);
  if (berthDef) {
    const absStart = berthDef.refStart + Number(form.start);
    const absEnd = berthDef.refStart + Number(form.end);
    newStyle.left = `calc(${absStart}/1005*100%)`;
    newStyle.width = `calc(${absEnd - absStart}/1005*100%)`;
  }
  
  onUpdate({ ...ship, ...form, style: newStyle });
};
```

---

## 9. WaitingShipCard.js

### Mô tả
Card hiển thị một tàu trong danh sách chờ.

### Props nhận

| Prop | Type | Mô tả |
|------|------|-------|
| `ship` | Object | Dữ liệu tàu |
| `index` | Number | Thứ tự trong list |
| `highlightedShips` | Array | IDs highlight |
| `onShipSelect` | Function | Callback click |
| `onDock` | Function | Callback cập cầu |
| `onDelete` | Function | Callback xóa |

### Drag Support

```javascript
const handleDragStart = (e) => {
  e.dataTransfer.setData('application/json', JSON.stringify(ship));
  e.dataTransfer.effectAllowed = 'move';
};
```

### Cấu trúc DOM

```
.waiting-ship-card
├── .card-color-bar (dải màu theo cargoType)
├── .card-main-content
│   ├── .card-index (số thứ tự)
│   └── .card-content
│       ├── .card-header (tên tàu)
│       ├── .card-body (loại hàng + số lượng)
│       ├── .card-berth-info (bến + vị trí nếu có)
│       └── .card-footer (ETA → ETD)
└── .card-action-buttons
    ├── button.card-btn-dock (⚓)
    └── button.card-btn-delete (🗑)
```

---

## 10. Crane.js

### Mô tả
Component hiển thị một cẩu có thể drag trên rail.

### Props nhận

| Prop | Type | Mô tả |
|------|------|-------|
| `id` | String | ID cẩu (GW1, GC1, LB1...) |
| `shape` | String | "circle" hoặc "square" |
| `colorClass` | String | CSS class màu |
| `style` | Object | Style với `left` position |
| `block` | String | "gw-main" hoặc "tt2" |
| `minPercent` | Number | Giới hạn trái (%) |
| `maxPercent` | Number | Giới hạn phải (%) |
| `onPositionChange` | Function | Callback thay đổi vị trí |

### Drag Logic

```javascript
// Constrain position within minPercent - maxPercent
const handleMouseMove = (e) => {
  const newLeft = currentLeft + dx;
  const containerWidth = containerRef.current.offsetWidth;
  const minPx = (minPercent / 100) * containerWidth;
  const maxPx = (maxPercent / 100) * containerWidth;
  const constrainedLeft = Math.max(minPx, Math.min(maxPx, newLeft));
  // Update position
};
```

---

*Tiếp theo: [05_LOGIC.md](./05_LOGIC.md)*
