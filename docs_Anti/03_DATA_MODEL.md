# Cấu Trúc Dữ Liệu & State Management

## 1. State Chính (App.js)

### 1.1 Ship Data

#### berthedShips (Array)
Danh sách tàu đã cập cầu (đang hiển thị trên grid).

```javascript
berthedShips = [
  {
    // === ID & Tên ===
    id: "B1706xxxx",          // String - unique, "B" + timestamp
    name: "VINALINES STAR",    // String - tên tàu

    // === Thông số kỹ thuật ===
    dwt: 22000,               // Number - trọng tải toàn phần (tons)
    loa: 180,                 // Number - chiều dài tổng thể (meters)
    beam: 28,                 // Number - chiều rộng (meters)
    
    // === Hàng hóa ===
    cargoType: "Container",   // String - "Container" | "Sắt thép" | "Hàng khác"
    cargo: 1200,              // Number - số lượng (TEUs hoặc tấn)

    // === Vị trí cầu bến ===
    berthName: "K12A",        // String - "K12C" | "K12A" | "K12" | "K12B" | "TT2"
    mandra: "left",           // String - mạn cập cầu "left" | "right"
    start: 50,                // Number - vị trí bắt đầu (m) trong hệ quy chiếu berth
    end: 230,                 // Number - vị trí kết thúc (m)
    
    // === Thời gian ===
    eta: "2025-01-01T08:00:00",  // ISO String hoặc Date - thời gian cập bến
    etd: "2025-01-02T20:00:00",  // ISO String hoặc Date - thời gian rời bến

    // === Style (vị trí hiển thị) ===
    style: {
      left: "calc(279/1005*100%)",   // CSS calc - vị trí ngang
      width: "calc(180/1005*100%)",  // CSS calc - chiều rộng
      top: "0px",                    // String - vị trí dọc
      height: "90px"                 // String - chiều cao
    }
  }
]
```

#### waitingShips (Array)
Danh sách tàu đang chờ cầu.

```javascript
waitingShips = [
  {
    // Các field giống berthedShips, nhưng:
    // - berthName có thể rỗng ""
    // - start, end có thể null
    // - style không bắt buộc
    // - id bắt đầu bằng "W" + timestamp
    
    id: "W1706xxxx",
    name: "HAI PHONG 36",
    dwt: 18000,
    loa: 155,
    beam: 24,
    cargoType: "Sắt thép",
    cargo: 8000,
    berthName: "",           // Chưa xếp lịch
    mandra: "",
    start: null,
    end: null,
    eta: "2025-01-08T10:00:00",
    etd: "2025-01-09T18:00:00"
  }
]
```

### 1.2 Time Settings

```javascript
startDate = new Date("2025-01-01T00:00:00");  // Date - ngày bắt đầu hiển thị
numDays = 7;                                   // Number - số ngày hiển thị (1-60)
```

### 1.3 UI States

```javascript
selectedShip = null;                // Object | null - ship đang được chọn
highlightedShips = [];              // Array<string> - IDs của ships được highlight
showPasswordModal = true;           // Boolean - hiển thị modal đăng nhập
showImportModal = false;            // Boolean - hiển thị modal import
showConfirmModal = false;           // Boolean - hiển thị modal xác nhận
toasts = [];                        // Array<Toast> - danh sách thông báo
```

### 1.4 Toast Object

```javascript
{
  id: "t1706xxxx",
  message: "Đã cập nhật thành công",
  type: "success",  // "success" | "error" | "warning" | "info"
  duration: 3000    // ms
}
```

---

## 2. Berth Definitions (Constants)

### 2.1 BERTH_DEFINITIONS

```javascript
const BERTH_DEFINITIONS = [
  { id: 'K12C', name: 'K12C', start: 10, end: 199, refStart: 10 },
  { id: 'K12A', name: 'K12A', start: 229, end: 361, refStart: 229 },
  { id: 'K12',  name: 'K12',  start: 361, end: 549, refStart: 229 },  // Chung ref với K12A
  { id: 'K12B', name: 'K12B', start: 549, end: 753, refStart: 229 },  // Chung ref với K12A
  { id: 'TT2',  name: 'TT2',  start: 773, end: 995, refStart: 773 }
];
```

**Giải thích refStart:**
- K12A, K12, K12B có `refStart = 229` → dùng chung hệ quy chiếu
- Cho phép tàu dài nằm trải qua 2-3 bến trong cùng block
- K12C và TT2 có hệ quy chiếu riêng

### 2.2 BERTH_GROUPS

```javascript
const BERTH_GROUPS = {
  K12C: ['K12C'],
  K12A: ['K12A', 'K12', 'K12B'],
  K12:  ['K12A', 'K12', 'K12B'],
  K12B: ['K12A', 'K12', 'K12B'],
  TT2:  ['TT2']
};
```

→ Dùng để kiểm tra overlap giữa các bến cùng block

### 2.3 BERTH_REFERENCES

```javascript
const BERTH_REFERENCES = {
  K12C: 10,
  K12A: 229,
  K12: 229,
  K12B: 229,
  TT2: 773
};
```

→ Vị trí bắt đầu tuyệt đối trong hệ quy chiếu 1005m

---

## 3. Crane Data

### 3.1 Crane Positions

```javascript
const cranePositions = [
  // Gantry Wheel (GW) - di chuyển toàn bộ K12C→K12B block
  { id: 'GW1', shape: 'circle', colorClass: 'crane-color-gw', 
    left: 'calc(50/743*100%)', block: 'gw-main', minPercent: 0, maxPercent: 100 },
  { id: 'GW2', shape: 'circle', colorClass: 'crane-color-gw', 
    left: 'calc(130/743*100%)', block: 'gw-main', minPercent: 0, maxPercent: 100 },
  // ... GW3, GW4, GW5 tương tự
  
  // Gantry Container (GC) - chỉ trong K12B
  { id: 'GC1', shape: 'square', colorClass: 'crane-color-gc',
    left: 'calc(590/743*100%)', block: 'gw-main', minPercent: 72.5, maxPercent: 100 },
  { id: 'GC2', shape: 'square', colorClass: 'crane-color-gc',
    left: 'calc(680/743*100%)', block: 'gw-main', minPercent: 72.5, maxPercent: 100 },
  
  // Level Boom (LB) - chỉ trong TT2
  { id: 'LB1', shape: 'circle', colorClass: 'crane-color-lb',
    left: 'calc(57/222*100%)', block: 'tt2', minPercent: 0, maxPercent: 100 },
  { id: 'LB40', shape: 'circle', colorClass: 'crane-color-lb',
    left: 'calc(137/222*100%)', block: 'tt2', minPercent: 0, maxPercent: 100 }
];
```

---

## 4. Pitch Data (Mốc Đo Khoảng Cách)

```javascript
const pitches = [
  // K12C: pitch 1-8
  { id: 1, berth: 'K12C', m: 0, label: '0' },
  { id: 2, berth: 'K12C', m: 24, label: '24' },
  { id: 3, berth: 'K12C', m: 53, label: '53' },
  // ...
  
  // K12A: pitch 1-6 (label từ 7-125)
  { id: 1, berth: 'K12A', m: 7, label: '7' },
  // ...
  
  // K12: pitch 7-12 (label từ 148-291, đo từ đầu K12A)
  { id: 7, berth: 'K12', m: 16, label: '148' },
  // ...
  
  // K12B: pitch 13-21 (label từ 320-522, đo từ đầu K12A)
  { id: 13, berth: 'K12B', m: 0, label: '320' },
  // ...
  
  // TT2: pitch 0-13
  { id: 0, berth: 'TT2', m: 0, label: '0' },
  // ...
  
  // Pitch độc lập (màu đỏ)
  { id: 'B1', berth: null, m: 723, label: '-40', color: 'red', isIndependent: true },
  { id: 'B2', berth: null, m: 970, label: '245', color: 'red', isIndependent: true }
];
```

---

## 5. Cargo Colors

```javascript
const CARGO_COLORS = {
  Container: {
    fill: 'ship-fill-container',      // CSS class màu nền ship
    color: 'ship-color-container',    // CSS class màu chữ
    bar: 'color-bar-container',       // CSS class dải màu card
    cardFill: 'card-fill-container'   // CSS class nền card
  },
  'Sắt thép': {
    fill: 'ship-fill-steel',
    color: 'ship-color-steel',
    bar: 'color-bar-steel',
    cardFill: 'card-fill-steel'
  },
  'Hàng khác': {
    fill: 'ship-fill-other',
    color: 'ship-color-other',
    bar: 'color-bar-other',
    cardFill: 'card-fill-other'
  }
};
```

**Hàm normalize:**
```javascript
function normalizeCargoType(cargoType) {
  const normalized = String(cargoType).toLowerCase();
  if (normalized.includes('cont')) return 'Container';
  if (normalized.includes('sắt') || normalized.includes('thép')) return 'Sắt thép';
  return 'Hàng khác';
}
```

---

## 6. Constants

```javascript
const BERTH_TOTAL_METERS = 1005;     // Tổng chiều dài hệ thống
const SLOT_HEIGHT = 30;               // px - cao mỗi slot thời gian
const MS_PER_SLOT = 12 * 60 * 60 * 1000;  // 12 giờ = 1 slot
const MIN_SHIP_HEIGHT = 48;           // px - chiều cao tối thiểu khối tàu
const MIN_SHIP_GAP_RATIO = 0.1;       // 10% LOA - khoảng cách an toàn
const DEFAULT_NUM_DAYS = 7;

// Storage keys
const STORAGE_KEY = 'berthPlannerState';
const PASSWORD_KEY = 'plannerPassword';
const DEFAULT_PASSWORD = 'HoangTT';
```

---

## 7. localStorage Structure

```javascript
// Key: 'berthPlannerState'
{
  berthedShips: [...],
  waitingShips: [...],
  startDate: "2025-01-01T00:00:00.000Z",
  numDays: 7,
  cranePositions: [...],
  lastUpdated: "2025-01-15T08:30:00.000Z"
}

// Key: 'plannerPassword'
"CustomPassword123"  // String
```

---

## 8. Import Data Structure (Excel)

### Expected columns:

| Column | Field | Type | Required |
|--------|-------|------|----------|
| Tên tàu | name | String | ✓ |
| DWT | dwt | Number | |
| LOA | loa | Number | ✓ |
| BEAM | beam | Number | |
| Loại hàng | cargoType | String | |
| Số lượng | cargo | Number | |
| Cầu bến | berthName | String | |
| ETA | eta | Date/String | |
| ETD | etd | Date/String | |
| Vị trí BD | start | Number | |
| Vị trí KT | end | Number | |
| Mạn cập | mandra | String | |

### Date parsing:
- ISO format: "2025-01-01T08:00:00"
- DD/MM/YYYY HH:mm
- DD-MM-YYYY HH:mm
- DD/MM/YYYY (time defaults to 00:00)
- Excel serial number (days since 1900)

---

## 9. Export Structures

### JSON (Save Plan):
```javascript
{
  berthedShips: [...],
  waitingShips: [...],
  startDate: "2025-01-01T00:00:00.000Z",
  numDays: 7,
  cranes: [...]
}
```

### CSV (Report):
```csv
Tên tàu,DWT,LOA,Loại hàng,Số lượng,Đơn vị,ETA,ETD,Cầu bến,Vị trí
VINALINES STAR,22000,180,Container,1200,TEUs,01/01/2025 08:00,02/01/2025 20:00,K12A,50-230
```

---

*Tiếp theo: [04_COMPONENTS.md](./04_COMPONENTS.md)*
