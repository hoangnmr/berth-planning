# 06 - Import / Export (Excel, JSON, PDF, HTML Report)

## 1. Import từ Excel

### 1.1 Workflow tổng quan

```
1. User bấm nút "Import Excel" trong menu ⚙
2. Hiển thị Confirm Modal: "Bạn có chắc muốn xóa kế hoạch hiện tại trước khi import?"
   - Nút "Hủy" → đóng, không làm gì
   - Nút "Xóa và Import" → xóa toàn bộ plan hiện tại (clearPlan), tiếp tục
3. Mở file dialog accept .xlsx/.xls
4. Đọc file bằng FileReader → ArrayBuffer
5. SheetJS (xlsx) parse → Workbook → Sheet (ưu tiên sheet "Ships", fallback sheet đầu tiên) → JSON array
6. Parse từng row → ship object (với mapping header linh hoạt)
7. Mở ImportModal hiển thị preview
8. User chọn/bỏ chọn → nhấn Import
9. Các ship hợp lệ → thêm vào berthedShips hoặc waitingShips
10. Tự động điều chỉnh startDate và numDays theo dữ liệu import
11. Toast thông báo kết quả
```

### 1.2 Mapping Headers

Hệ thống hỗ trợ header tiếng Việt và tiếng Anh, với nhiều biến thể:

| Field | Các header chấp nhận (không phân biệt hoa/thường) |
|-------|---------------------------------------------------|
| shipName | `tên tàu`, `ten tau`, `tàu`, `tau`, `ship name`, `name`, `vessel`, `vessel name` |
| nationalID | `quốc tịch`, `quoc tich`, `national`, `nationality`, `flag` |
| loa | `loa`, `chiều dài`, `chieu dai`, `length`, `length overall` |
| cargo | `loại hàng`, `loai hang`, `hàng`, `hàng hóa`, `hang hoa`, `cargo`, `cargo type`, `goods` |
| eta | `eta`, `thời gian đến`, `thoi gian den`, `ngày đến`, `ngay den`, `arrival`, `estimated arrival` |
| etd | `etd`, `thời gian đi`, `thoi gian di`, `ngày đi`, `ngay di`, `departure`, `estimated departure` |
| berthName | `cầu`, `cau`, `vị trí`, `vi tri`, `berth`, `berth name`, `position` |
| draftIn | `mớn nước vào`, `mon nuoc vao`, `draft in`, `draftin` |
| draftOut | `mớn nước ra`, `mon nuoc ra`, `draft out`, `draftout` |
| ton | `tấn`, `tan`, `tonnage`, `ton`, `dwt` |
| agent | `đại lý`, `dai ly`, `agent` |

### 1.3 Parse Date/Time

SheetJS được gọi với option `{ cellDates: true }` để tự động parse ô date thành Date objects.

Logic parse date hỗ trợ nhiều format (hàm `parseImportedDate`):

```
Các format được hỗ trợ (ưu tiên từ trên xuống):
1. Excel serial number (số nguyên/thập phân > 25569):
   → Chuyển đổi: (serial - 25569) * 86400000 ms + UTC offset
   → Ví dụ: 45678.5 → ngày cụ thể lúc 12:00

2. ISO string: "2025-06-15T08:00:00"
   → new Date(string)

3. Có T separator: "2025-06-15T14:30"
   → new Date(string)

4. DD/MM/YYYY HH:mm hoặc DD-MM-YYYY HH:mm
   → Parse regex: /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\s+(\d{1,2}):(\d{2})/
   → new Date(year, month-1, day, hour, minute)

5. YYYY/MM/DD hoặc YYYY-MM-DD (có thể có HH:mm)
   → Parse regex: /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/

6. DD/MM/YYYY (không có giờ)
   → Mặc định 07:00 sáng

Nếu không parse được → return null → row bị đánh dấu error
```

### 1.4 Validation

Mỗi ship import được validate:

**Errors (ngăn import):**
- Thiếu tên tàu
- Thiếu LOA hoặc LOA không phải số
- ETA hoặc ETD không parse được
- ETD trước ETA

**Warnings (cho phép import, hiện cảnh báo):**
- Không có berth → đưa vào waiting list
- LOA quá lớn (> chiều dài cầu)
- Duration quá ngắn (< 2 giờ) hoặc quá dài (> 30 ngày)

**Conflict detection:**
- Kiểm tra overlap với tàu đã có trên grid (dùng checkOverlapAndGap)
- Nếu overlap → đánh dấu "conflict" → hiện cảnh báo trong preview
- Tàu conflict vẫn có thể được chọn để import (user quyết định)

### 1.5 Import Modal

**Giao diện:**
```
┌──────────────── Import Preview ─────────────────┐
│ Tổng: 15 tàu | Hợp lệ: 12 | Lỗi: 3            │
│                                                   │
│ ☑ Chọn tất cả / Bỏ chọn tất cả                  │
│                                                   │
│ ┌─────────────────────────────────────────────┐  │
│ │ ☑ │ VINASHIN 01│ K12 │ 180m│ 05/06│ 07/06│  │  │
│ │ ☑ │ HARMONY   │ TT2 │ 200m│ 05/06│ 08/06│  │  │
│ │ ☒ │ PEARL (⚠ overlap)│K12│ 150m│05/06│07/06│  │
│ │ ✕ │ BAD DATA  │ --- │ err │ --- │ ---  │  │  │
│ └─────────────────────────────────────────────┘  │
│                                                   │
│           [Hủy]              [Import (12)]        │
└───────────────────────────────────────────────────┘
```

**Màu sắc hàng:**
- Xanh lá: valid, không conflict
- Vàng: warning (missing berth, duration bất thường)
- Cam: conflict (overlap với tàu hiện có)
- Đỏ: error (không thể import)
- Disabled: hàng lỗi, không check được

### 1.6 Xử lý sau Import

Với mỗi ship được chọn:
1. **Có berth hợp lệ:** 
   - Tính style (left, width) từ berthName + start/end
   - Thêm vào berthedShips
2. **Không có berth:**
   - Thêm vào waitingShips (đưa vào cột chờ)
3. **Conflict ship (user vẫn chọn):**
   - Thêm bình thường → overlap sẽ hiển thị trên grid
4. Đóng modal, toast kết quả: "Đã import X tàu, Y vào cầu, Z vào danh sách chờ"

---

## 2. Lưu/Mở File JSON

### 2.1 Cấu trúc file JSON

```json
{
  "version": "1.0",
  "savedAt": "2025-06-15T14:30:00.000Z",
  "startDate": "2025-06-05",
  "numDays": 14,
  "berthedShips": [
    {
      "id": "ship_1718...",
      "name": "VINASHIN 01",
      "loa": 180,
      "berthName": "K12",
      "start": 50,
      "end": 230,
      "eta": "2025-06-05T07:00:00.000Z",
      "etd": "2025-06-07T19:00:00.000Z",
      "cargo": "Sắt thép",
      "nationalID": "VN",
      "agent": "VOSA",
      "draftIn": 8.5,
      "draftOut": 5.2,
      "ton": 25000,
      "style": {
        "left": "calc(229 / 1005 * 100% + 50 / 1005 * 100%)",
        "width": "calc(180 / 1005 * 100%)"
      }
    }
  ],
  "waitingShips": [
    {
      "id": "ship_1718...",
      "name": "OCEAN STAR",
      "loa": 200,
      "cargo": "Container",
      "eta": "2025-06-08T14:00:00.000Z",
      "etd": "2025-06-10T06:00:00.000Z"
    }
  ],
  "cranes": {
    "GW1": 25,
    "GW2": 45,
    "GW3": 65,
    "GW4": 80,
    "GW5": 90,
    "GC1": 35,
    "GC2": 60,
    "LB1": 10,
    "LB40": 50
  }
}
```

### 2.2 Lưu file (Save)

```
1. Tạo object chứa toàn bộ state hiện tại
2. Serialize Date objects → ISO string
3. JSON.stringify(data, null, 2)
4. Tạo Blob → URL.createObjectURL → download link
5. Tên file: "berth_DD_MM_YY-HH_MM_SS.json"
6. Auto-click link → download → revoke URL
```

### 2.3 Mở file (Open)

```
1. Input file accept .json
2. FileReader.readAsText → JSON.parse
3. Validate: kiểm tra version, có berthedShips array
4. Deserialize: ISO string → Date objects
5. setState: berthedShips, waitingShips, startDate, numDays
6. Nếu có cranes → restore crane positions
7. Toast: "Đã mở file thành công"
```

---

## 3. Export PDF

### 3.1 Workflow

```
1. User bấm "Export PDF"
2. Toast: "Đang chuẩn bị..."
3. Clone DOM planner (.berth-planner) + waiting list
4. Tạo hidden container với width cố định (1600px)
5. html2canvas chụp ảnh với scale 1.5
6. Toast: "Đang tạo PDF..."
7. jsPDF tạo document landscape
8. Thêm image, chia trang nếu cần
9. Thêm footer copyright vào tất cả trang
10. pdf.save() → download
11. Toast: "Xuất thành công"
12. Cleanup: xóa hidden container khỏi DOM
```

### 3.2 Cấu hình

| Tham số | Giá trị | Mô tả |
|---------|---------|-------|
| pdfWidth | 1600 px | Chiều rộng PDF |
| pageHeight | 1123 px | Chiều cao mỗi trang (A4 landscape) |
| html2canvas scale | 1.5 | Độ phân giải capture |
| orientation | landscape ('l') | Trang nằm ngang |
| unit | px | Đơn vị |
| format | [1600, 1123] | Kích thước tùy chỉnh |
| image format | JPEG (FAST) | Nén nhanh |

### 3.3 Pagination (Chia trang)

```
Logic:
1. Tính pdfHeight = (imgHeight * pdfWidth) / imgWidth
2. Nếu pdfHeight > pageHeight → cần nhiều trang
3. Trang đầu: addImage với position = 0
4. heightLeft = pdfHeight - pageHeight
5. While heightLeft > 0:
   - addPage()
   - position = heightLeft - pdfHeight (offset âm)
   - addImage với position
   - heightLeft -= pageHeight
```

### 3.4 Footer Copyright

```
Sau khi thêm tất cả trang:
- Duyệt từ trang 1 đến trang cuối
- Mỗi trang: thêm text "© Nguyen Hoang & Ban Khai thac | Trung tam DHKT KV TAN THUAN"
- Font size: 10, màu: #555555, căn giữa, vị trí: pageHeight - 15
```

### 3.5 Error Handling

```
try {
  // ... export logic
} catch (err) {
  console.error(err);
  Toast error: "Lỗi khi xuất PDF!"
  // Cleanup temporary elements
  if (pdfLayout && document.body.contains(pdfLayout)) {
    document.body.removeChild(pdfLayout);
  }
}
```

---

## 4. HTML Report (Báo cáo chi tiết - Bỏ qua)

> Theo yêu cầu: **bỏ phần báo cáo**. Chỉ ghi nhận rằng:
> - Có chức năng xuất HTML report riêng biệt
> - Report chứa: thống kê loại hàng, bảng chi tiết tàu có thể sort, biểu đồ Chart.js
> - Report mở trong tab mới
> - Đồng thời tạo CSV download tự động (kèm BOM \ufeff cho encoding UTF-8)
> - Nếu cần triển khai lại → xem file `report/ships_report.js` và `utils/reportHelpers.js`

---

## 5. File Naming Convention

| Output | Pattern | Ví dụ |
|--------|---------|-------|
| Save JSON | `berth_DD_MM_YY-HH_MM_SS.json` | berth_05_11_25-19_50_48.json |
| PDF | `berth_DD_MM_YY-HH_MM_SS.pdf` | berth_05_11_25-19_50_48.pdf |
| CSV (Report) | `berth_report_YYYYMMDD_HHmmss.csv` | berth_report_20250115_083045.csv |

---

## 6. Lưu ý khi triển khai lại

### 6.1 Import Excel
- SheetJS (xlsx) vẫn là lựa chọn tốt nhất cho client-side Excel parsing
- Cần giữ nguyên logic mapping header linh hoạt (nhiều biến thể tiếng Việt/Anh)
- Parse date là phần phức tạp nhất → cần test kỹ với nhiều format

### 6.2 JSON File
- Nên nâng version lên "2.0" nếu thay đổi schema
- Cân nhắc thêm migration logic cho backward compatibility
- Có thể chuyển sang dùng IndexedDB thay localStorage + file download

### 6.3 PDF Export
- html2canvas có hạn chế: không render một số CSS phức tạp
- Cân nhắc: svg-based rendering → chuyển trực tiếp sang PDF (sharp hơn)
- Hoặc dùng Puppeteer (nếu có backend) cho PDF server-side
