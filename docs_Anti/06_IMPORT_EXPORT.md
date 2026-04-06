# Import/Export - Chi Tiết

## Tổng Quan Các Chức Năng

| Chức năng | Input | Output | Format |
|-----------|-------|--------|--------|
| Lưu Kế hoạch | State | File | JSON |
| Mở Kế hoạch | File | State | JSON |
| Import Excel | File | Ships | XLSX |
| Xuất PDF | DOM | File | PDF |
| Xuất Báo cáo | State | Tab + File | HTML + CSV |

---

## 1. Lưu Kế Hoạch (Save Plan)

### 1.1 Flow

```
User click "Lưu Kế hoạch" 
  → Thu thập state 
  → JSON.stringify 
  → Blob 
  → Download
```

### 1.2 Dữ Liệu Lưu

```javascript
{
  "berthedShips": [
    {
      "id": "B1706883200000",
      "name": "VINALINES STAR",
      "dwt": 22000,
      "loa": 180,
      "beam": 28,
      "cargoType": "Container",
      "cargo": 1200,
      "berthName": "K12A",
      "mandra": "left",
      "start": 50,
      "end": 230,
      "eta": "2025-01-01T08:00:00.000Z",
      "etd": "2025-01-02T20:00:00.000Z",
      "style": {
        "left": "calc(279/1005*100%)",
        "width": "calc(180/1005*100%)",
        "top": "0px",
        "height": "90px"
      }
    }
    // ... more ships
  ],
  "waitingShips": [
    // ... similar structure, may have null start/end
  ],
  "startDate": "2025-01-01T00:00:00.000Z",
  "numDays": 7,
  "cranes": [
    {
      "id": "GW1",
      "left": "calc(50/743*100%)",
      "block": "gw-main"
    }
    // ... more cranes
  ]
}
```

### 1.3 Tên File

```javascript
// Format: berth_YYYYMMDD_HHmmss.json
const generateFileName = (prefix, extension) => {
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '_')
    .slice(0, 15);
  return `${prefix}_${timestamp}${extension}`;
};
// Ví dụ: berth_20250115_083045.json
```

---

## 2. Mở Kế Hoạch (Open Plan)

### 2.1 Flow

```
User click "Mở Kế hoạch"
  → File dialog (.json)
  → User chọn file
  → Read file.text()
  → JSON.parse()
  → Validate structure
  → Convert dates
  → Set state
```

### 2.2 Validation

```javascript
// Required fields
if (!data || typeof data !== 'object') {
  throw new Error('File không đúng định dạng');
}

// Optional but should be arrays
data.berthedShips = data.berthedShips || [];
data.waitingShips = data.waitingShips || [];
data.numDays = data.numDays || 7;
data.cranes = data.cranes || [];
```

### 2.3 Date Conversion

```javascript
// String → Date object
const processShip = (ship) => ({
  ...ship,
  eta: toValidDate(ship.eta),  // ISO string → Date
  etd: toValidDate(ship.etd)
});

const toValidDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};
```

---

## 3. Import từ Excel

### 3.1 Flow Chi Tiết

```
1. User click "Import từ Excel"
2. Confirm modal: "Xóa kế hoạch hiện tại?"
3. Nếu confirm:
   a. Clear berthedShips, waitingShips
   b. Mở file dialog (.xlsx)
4. User chọn file Excel
5. Đọc file bằng SheetJS (xlsx)
6. Parse data từ sheet đầu tiên
7. Map columns → ship fields
8. Validate từng row
9. Hiển thị Preview Modal
10. User chọn rows muốn import
11. Confirm import
12. Phân loại ships:
    - Có berthName → berthedShips
    - Không có → waitingShips
13. Set state
```

### 3.2 Column Mapping

| Excel Column | Ship Field | Type | Notes |
|--------------|------------|------|-------|
| Tên tàu / Ship Name / TEN TAU | name | String | Required |
| DWT | dwt | Number | |
| LOA | loa | Number | Required for position calc |
| BEAM | beam | Number | |
| Loại hàng / Cargo Type | cargoType | String | Normalized |
| Số lượng / Quantity | cargo | Number | |
| Cầu bến / Berth | berthName | String | K12C/K12A/K12/K12B/TT2 |
| ETA / Ngày cập | eta | Date | Multiple formats |
| ETD / Ngày rời | etd | Date | Multiple formats |
| Vị trí BD / Start | start | Number | Meters |
| Vị trí KT / End | end | Number | Meters |
| Mạn cập / Side | mandra | String | left/right |

### 3.3 Date Parsing từ Excel

```javascript
function parseImportedDate(value) {
  if (!value) return null;
  
  // Đã là Date
  if (value instanceof Date) return value;
  
  // Excel serial number (số ngày từ 1900)
  if (typeof value === 'number') {
    // Excel epoch: 1899-12-30
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + value * 86400000);
    return date;
  }
  
  // String formats
  const str = String(value).trim();
  
  // Try ISO first
  const isoDate = new Date(str);
  if (!isNaN(isoDate.getTime())) return isoDate;
  
  // DD/MM/YYYY HH:mm or DD-MM-YYYY HH:mm
  const patterns = [
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s*(\d{1,2})?[:\.]?(\d{2})?$/,
    /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\s*(\d{1,2})?[:\.]?(\d{2})?$/
  ];
  
  for (const pattern of patterns) {
    const match = str.match(pattern);
    if (match) {
      // Parse và construct Date
      // ...
    }
  }
  
  return null;
}
```

### 3.4 Validation Rules

| Rule | Error/Warning | Message |
|------|---------------|---------|
| Thiếu tên tàu | Error | "Thiếu tên tàu" |
| ETA không hợp lệ | Warning | "ETA không đúng định dạng" |
| ETD < ETA | Warning | "ETD phải sau ETA" |
| Bến không tồn tại | Warning | "Bến không hợp lệ, sẽ đưa vào danh sách chờ" |
| Thiếu LOA | Warning | "Thiếu LOA, sử dụng mặc định 100m" |

### 3.5 Preview Modal UI

```
┌─────────────────────────────────────────────────────────────────────┐
│  PREVIEW DỮ LIỆU IMPORT                                      [X]   │
├─────────────────────────────────────────────────────────────────────┤
│ [✓] Chọn tất cả                                                     │
│                                                                     │
│ ┌───┬─────────────────┬──────┬───────────────┬───────────────┬────┐ │
│ │ ☐ │ Tên tàu         │ Bến  │ ETA           │ ETD           │ ⚠  │ │
│ ├───┼─────────────────┼──────┼───────────────┼───────────────┼────┤ │
│ │ ☑ │ VINALINES STAR  │ K12A │ 01/01 08:00   │ 02/01 20:00   │    │ │
│ │ ☑ │ HAI PHONG 36    │ K12C │ 03/01 10:00   │ 04/01 18:00   │    │ │
│ │ ☐ │ MISSING ETA     │ TT2  │ ❌            │ 05/01 12:00   │ ⚠  │ │◄── Row có lỗi
│ │ ☑ │ VIETSHIP 01     │      │ 06/01 06:00   │ 07/01 14:00   │    │ │◄── Không có bến → waiting
│ └───┴─────────────────┴──────┴───────────────┴───────────────┴────┘ │
│                                                                     │
│ Tổng: 4 tàu | Errors: 1 | Warnings: 0                              │
│                                                                     │
│                              [Hủy]  [Import (3 tàu đã chọn)]       │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.6 Post-Import Processing

```javascript
// Phân loại ships
const importedShips = selectedRows.map(row => parseShipFromRow(row));

const newBerthed = [];
const newWaiting = [];

for (const ship of importedShips) {
  if (ship.berthName && VALID_BERTHS.includes(ship.berthName)) {
    // Tính style nếu có đủ thông tin
    if (ship.start != null && ship.end != null && ship.eta && ship.etd) {
      ship.style = calculateShipStyle(ship, startDate);
    }
    newBerthed.push(ship);
  } else {
    newWaiting.push(ship);
  }
}

setBerthedShips(prev => [...prev, ...newBerthed]);
setWaitingShips(prev => [...prev, ...newWaiting]);
```

---

## 4. Xuất PDF

### 4.1 Flow

```
1. Toast: "Đang chuẩn bị..."
2. Clone .berth-planner và .waiting-list
3. Tạo hidden container với fixed width
4. html2canvas capture với scale 1.5
5. Toast: "Đang tạo PDF..."
6. jsPDF tạo document
7. Thêm image, chia trang nếu cần
8. Thêm footer copyright
9. pdf.save() → download
10. Toast: "Xuất thành công"
```

### 4.2 Cấu Hình PDF

```javascript
// Layout
const pdfWidth = 1600;        // px
const pageHeight = 1123;      // px (A4 landscape)
const canvasScale = 1.5;

// jsPDF options
const pdf = new jsPDF({
  orientation: 'landscape',
  unit: 'px',
  format: [pdfWidth, pageHeight]
});
```

### 4.3 Pagination

```javascript
let position = 0;
let heightLeft = pdfHeight;

// First page
pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
heightLeft -= pageHeight;

// Additional pages
while (heightLeft > 0) {
  position = heightLeft - pdfHeight;  // Negative offset
  pdf.addPage();
  pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
  heightLeft -= pageHeight;
}
```

### 4.4 Footer

```javascript
const copyrightText = '© Nguyen Hoang & Ban Khai thac | Trung tam DHKT KV TAN THUAN';

for (let i = 1; i <= pdf.internal.getNumberOfPages(); i++) {
  pdf.setPage(i);
  pdf.setFontSize(10);
  pdf.setTextColor(85, 85, 85);
  const textWidth = pdf.getTextWidth(copyrightText);
  pdf.text(copyrightText, (pdfWidth - textWidth) / 2, pageHeight - 15);
}
```

---

## 5. Xuất Báo Cáo Chi Tiết

### 5.1 HTML Report

**Nội dung:**
1. Header với title và thời gian
2. Bảng danh sách tàu chi tiết
3. Biểu đồ tròn: Số tàu theo loại hàng
4. Biểu đồ cột: Khối lượng hàng theo loại
5. Biểu đồ cột ngang: Utilization các bến
6. Insights (phân tích)

**Cấu trúc:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Báo cáo chi tiết - Berth Planner</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>/* ... */</style>
</head>
<body>
  <h1>BÁO CÁO CHI TIẾT KẾ HOẠCH CẦU BẾN</h1>
  <p>Từ: [startDate] đến: [endDate] ([numDays] ngày)</p>
  
  <h2>1. DANH SÁCH TÀU</h2>
  <table>...</table>
  
  <h2>2. THỐNG KÊ THEO LOẠI HÀNG</h2>
  <div class="charts">
    <canvas id="shipTypeChart"></canvas>
    <canvas id="cargoChart"></canvas>
  </div>
  
  <h2>3. HỆ SỐ SỬ DỤNG CẦU BẾN</h2>
  <canvas id="utilizationChart"></canvas>
  <table>... utilization data ...</table>
  
  <h2>4. NHẬN XÉT</h2>
  <ul>
    <li>Bến K12B có hệ số sử dụng cao nhất (85%)</li>
    <li>Container chiếm 60% khối lượng hàng</li>
    ...
  </ul>
  
  <script>
    // Chart.js render scripts
  </script>
</body>
</html>
```

### 5.2 CSV Export

**Format:**
```csv
Tên tàu,DWT,LOA,BEAM,Loại hàng,Số lượng,Đơn vị,ETA,ETD,Cầu bến,Vị trí BD,Vị trí KT,Mạn cập
VINALINES STAR,22000,180,28,Container,1200,TEUs,01/01/2025 08:00,02/01/2025 20:00,K12A,50,230,left
HAI PHONG 36,18000,155,24,Sắt thép,8000,tấn,03/01/2025 10:00,04/01/2025 18:00,K12C,20,175,right
```

**Code:**
```javascript
const csvRows = [
  ['Tên tàu', 'DWT', 'LOA', 'BEAM', 'Loại hàng', 'Số lượng', 'Đơn vị', 
   'ETA', 'ETD', 'Cầu bến', 'Vị trí BD', 'Vị trí KT', 'Mạn cập']
];

for (const ship of berthedShips) {
  const unit = ship.cargoType === 'Container' ? 'TEUs' : 'tấn';
  csvRows.push([
    ship.name,
    ship.dwt,
    ship.loa,
    ship.beam,
    ship.cargoType,
    ship.cargo,
    unit,
    formatDateTime(ship.eta),
    formatDateTime(ship.etd),
    ship.berthName,
    ship.start,
    ship.end,
    ship.mandra
  ]);
}

const csvContent = csvRows.map(row => row.join(',')).join('\n');
const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
```

---

## 6. File Naming Convention

| Output | Pattern | Example |
|--------|---------|---------|
| Save JSON | `berth_YYYYMMDD_HHmmss.json` | berth_20250115_083045.json |
| PDF | `berth_YYYYMMDD_HHmmss.pdf` | berth_20250115_083045.pdf |
| CSV | `berth_report_YYYYMMDD_HHmmss.csv` | berth_report_20250115_083045.csv |

---

## 7. Error Handling

### Common Errors

| Scenario | Error Message | Recovery |
|----------|---------------|----------|
| JSON parse fail | "File không hợp lệ!" | Toast error, abort |
| Excel read fail | "Không thể đọc file Excel" | Toast error, abort |
| Invalid date | "Ngày không hợp lệ" | Mark warning, allow skip |
| PDF capture fail | "Lỗi khi xuất PDF!" | Toast error, cleanup |

### Cleanup on Error

```javascript
try {
  // ... export logic
} catch (err) {
  console.error(err);
  onError('Lỗi khi xuất!');
  
  // Cleanup temporary elements
  if (pdfLayout && document.body.contains(pdfLayout)) {
    document.body.removeChild(pdfLayout);
  }
}
```

---

*Quay lại: [00_OVERVIEW.md](./00_OVERVIEW.md)*
