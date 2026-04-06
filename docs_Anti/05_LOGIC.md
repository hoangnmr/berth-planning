# Logic Xử Lý - Chi Tiết

## Tổng Quan

Tài liệu này mô tả logic xử lý của hệ thống **không bao gồm công thức tính toán cụ thể**. Mục đích là giúp reimplementation dễ dàng thay thế công thức theo nhu cầu.

---

## 1. Hệ Thống Tọa Độ

### 1.1 Trục X - Vị Trí (Mét)

**Phạm vi:** 0 → 1005 mét

**Cách tính:**
- Mỗi bến có vị trí `start` và `end` trong hệ tuyệt đối
- Ship position được lưu dạng `calc(X/1005*100%)` trong CSS
- Khi hiển thị: parse ngược để lấy giá trị mét

**Reference System:**
- K12C: độc lập (ref = 10)
- K12A, K12, K12B: chung reference (ref = 229)
- TT2: độc lập (ref = 773)

> **Reimplementation Note:** Có thể thay đổi hệ quy chiếu này tùy theo thực tế cảng.

### 1.2 Trục Y - Thời Gian

**Đơn vị:** Slot = 30px = 12 giờ

**Cách tính:**
- `slotIndex = (timeMs - startDateMs) / MS_PER_SLOT`
- `topPx = slotIndex * SLOT_HEIGHT`

**Snap behavior:**
- Khi drop/drag: làm tròn về slot gần nhất
- Cho phép vị trí âm (trước startDate) và vượt quá numDays

---

## 2. Logic Xác Định Vị Trí

### 2.1 Từ Mouse Position → Berth

```
Input: clientX (pixel position trên màn hình)
Output: berthName (K12C, K12A, K12, K12B, TT2) hoặc null (gap)

Logic:
1. Lấy gridRect = grid.getBoundingClientRect()
2. Tính relativeX = clientX - gridRect.left
3. Tính absoluteM = relativeX / gridRect.width * 1005
4. So sánh absoluteM với BERTH_DEFINITIONS:
   - 10-199: K12C
   - 199-229: Gap (return null)
   - 229-361: K12A
   - 361-549: K12
   - 549-753: K12B
   - 753-773: Gap (return null)
   - 773-995: TT2
   - Else: Gap/ngoài phạm vi
```

### 2.2 Từ Mouse Position → Time Slot

```
Input: clientY (pixel position)
Output: { slotIndex, eta, etd }

Logic:
1. Lấy gridRect = grid.getBoundingClientRect()
2. Tính relativeY = clientY - gridRect.top
3. Tính slotIndex = floor(relativeY / SLOT_HEIGHT)
4. Tính eta = startDate + slotIndex * MS_PER_SLOT
5. Tính etd = eta + ship.durationMs (hoặc default 24h)
```

### 2.3 Từ Ship Data → CSS Style

```
Input: ship { berthName, start, end, eta, etd }
Output: style { left, width, top, height }

Logic:
1. Tìm berthDef từ berthName
2. absStart = berthDef.refStart + ship.start
3. absEnd = berthDef.refStart + ship.end
4. left = calc(absStart / 1005 * 100%)
5. width = calc((absEnd - absStart) / 1005 * 100%)
6. slotIndex = (eta - startDate) / MS_PER_SLOT
7. top = slotIndex * SLOT_HEIGHT
8. durationSlots = ceil((etd - eta) / MS_PER_SLOT)
9. height = max(MIN_SHIP_HEIGHT, durationSlots * SLOT_HEIGHT)
```

---

## 3. Overlap Detection

### 3.1 Điều Kiện Overlap

Hai tàu **overlap** khi **cả hai** điều kiện sau thỏa mãn:
1. **Overlap thời gian:** ETA1 < ETD2 AND ETA2 < ETD1
2. **Overlap vị trí:** start1 < end2 AND start2 < end1 (trong cùng berth group)

### 3.2 Berth Groups

```
K12C: chỉ check với các tàu ở K12C
K12A, K12, K12B: check cross-berth trong group [K12A, K12, K12B]
TT2: chỉ check với các tàu ở TT2
```

### 3.3 Thuật Toán Check

```
Input: newShip, allShips[]
Output: { hasOverlap: boolean, overlappingShips: [] }

Logic:
1. Lọc allShips có berthName thuộc cùng berth group với newShip
2. Với mỗi ship trong filtered list (trừ chính newShip):
   a. Check time overlap:
      - newEta < ship.etd AND ship.eta < newEtd
   b. Nếu time overlap, check position overlap:
      - Chuyển cả 2 về hệ tuyệt đối nếu cần
      - newAbsStart < shipAbsEnd AND shipAbsStart < newAbsEnd
3. Nếu cả 2 điều kiện đều đúng → add vào overlappingShips
4. Return kết quả
```

> **Reimplementation Note:** Có thể mở rộng logic check cross-berth tùy layout cảng thực tế.

---

## 4. Gap Warning

### 4.1 Điều Kiện Warning

Gap warning xuất hiện khi:
- Hai tàu **không overlap** nhưng **khoảng cách < 10% LOA** của tàu lớn hơn

### 4.2 Thuật Toán Check

```
Input: newShip, allShips[]
Output: { hasGapWarning: boolean, nearbyShips: [] }

Logic:
1. Tìm các tàu cùng berth group và có overlap thời gian
2. Với mỗi tàu:
   a. Tính gap = distance giữa 2 tàu (có thể âm nếu overlap)
   b. Nếu gap >= 0 (không overlap):
      - minGap = 10% * max(newShip.loa, otherShip.loa)
      - Nếu gap < minGap → add vào nearbyShips
3. Return kết quả
```

---

## 5. Berth Utilization Calculation

### 5.1 Mục Đích

Tính hệ số sử dụng cầu bến trong khoảng thời gian nhất định.

### 5.2 Hai Phương Pháp Tính

#### Method 1: Time-based (đơn giản)

```
Input: ships[], startDate, numDays
Output: { occupiedMs, pct } cho mỗi berth

Logic:
1. Với mỗi berth, thu thập các intervals [eta, etd] của ships
2. Thêm PREP_TIME (2h) trước eta và sau etd
3. Merge overlapping intervals
4. Tính tổng occupiedMs = sum của merged intervals
5. totalWindowMs = numDays * 24 * 60 * 60 * 1000
6. pct = occupiedMs / totalWindowMs * 100
```

#### Method 2: Meter×Time (chi tiết hơn)

```
Logic bổ sung:
1. Chia time axis thành slices dựa trên các event boundaries
2. Với mỗi slice, merge meter ranges của ships active
3. Tính occupiedMeterMs = sum(meters * sliceMs)
4. totalMeterMs = berthLength * totalWindowMs
5. meterPct = occupiedMeterMs / totalMeterMs * 100
```

### 5.3 Xalan Factor

Hệ số bổ sung cho thời gian xử lý (loading/unloading setup):
```
occupiedMs = occupiedMs * (1 + XALAN_FACTOR)
// Default XALAN_FACTOR = 0.3 (30% thêm)
```

### 5.4 Combined Utilization (TÂN THUẬN 1)

Tổng hợp utilization của K12C + K12A + K12 + K12B bằng cách merge tất cả intervals.

> **Reimplementation Note:** Các hằng số PREP_TIME, XALAN_FACTOR có thể điều chỉnh.

---

## 6. Date Parsing

### 6.1 Các Format Hỗ Trợ

| Format | Ví dụ |
|--------|-------|
| ISO 8601 | 2025-01-15T08:30:00Z |
| DD/MM/YYYY HH:mm | 15/01/2025 08:30 |
| DD-MM-YYYY HH:mm | 15-01-2025 08:30 |
| DD/MM/YYYY | 15/01/2025 (time = 00:00) |
| Excel serial | 45676.354167 (days since 1900) |

### 6.2 Thuật Toán Parse

```
Input: dateValue (string hoặc number)
Output: Date object hoặc null

Logic:
1. Nếu là Date object hợp lệ → return as-is
2. Nếu là number (Excel serial):
   - Excel epoch = 1899-12-30
   - date = new Date((serial - 25569) * 86400 * 1000)
3. Nếu là string:
   a. Thử parse ISO format trước
   b. Nếu fail, thử các pattern DD/MM/YYYY, DD-MM-YYYY
   c. Tách date và time parts
   d. Construct Date object
4. Validate: nếu isNaN(date.getTime()) → return null
```

---

## 7. Cargo Type Normalization

### 7.1 Logic

```
Input: cargoType (string, có thể UPPERCASE từ import)
Output: normalized type ("Container" | "Sắt thép" | "Hàng khác")

Logic:
1. Lowercase input
2. Nếu chứa "cont" hoặc "container" → "Container"
3. Nếu chứa "sắt", "sat", "thép", "thep", "steel" → "Sắt thép"
4. Else → "Hàng khác"
```

---

## 8. Snap-to-Grid Logic

### 8.1 Vertical Snap (Time)

```
Input: rawTopPx
Output: snappedTopPx

Logic:
1. slotIndex = round(rawTopPx / SLOT_HEIGHT)
2. snappedTopPx = slotIndex * SLOT_HEIGHT
```

### 8.2 Horizontal Snap (Position)

Hiện tại **không snap** theo chiều ngang (cho phép vị trí chính xác đến 1m).

> **Reimplementation Note:** Có thể thêm snap theo pitch nếu cần.

---

## 9. State Persistence

### 9.1 Auto-save Triggers

```
useEffect(() => {
  const stateToSave = {
    berthedShips,
    waitingShips,
    startDate: startDate.toISOString(),
    numDays,
    cranePositions,
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
}, [berthedShips, waitingShips, startDate, numDays, cranePositions]);
```

### 9.2 Load on Mount

```
useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    // Convert date strings back to Date objects
    setBerthedShips(parsed.berthedShips.map(s => ({
      ...s,
      eta: new Date(s.eta),
      etd: new Date(s.etd)
    })));
    // ... similar for other state
  }
}, []);
```

---

## 10. PDF Generation Logic

### 10.1 Process

```
1. Clone DOM elements (.berth-planner, .waiting-list)
2. Tạo container ẩn với width cố định (1600px)
3. html2canvas chụp ảnh với scale 1.5
4. jsPDF tạo document landscape A4
5. Tính số trang dựa trên chiều cao ảnh
6. Add image vào từng trang với position offset
7. Add footer copyright vào tất cả trang
8. Trigger download
```

### 10.2 Sizing

```
pdfWidth = 1600px
pageHeight = 1123px (A4 landscape)
scale = 1.5 (html2canvas)
```

---

## 11. Report Generation (Detailed)

### 11.1 Dữ Liệu Thống Kê

```
1. Đếm tàu:
   - shipsByType: { Container: N, 'Sắt thép': N, 'Hàng khác': N }
   - totalShips: sum

2. Khối lượng hàng:
   - cargoByType: { Container: sumTEUs, 'Sắt thép': sumTons, ... }

3. Utilization:
   - Gọi computeBerthUtilization(ships, { startDate, numDays })
   - Lấy utilization % cho từng bến
```

### 11.2 Output

- **HTML Report:** Mở trong tab mới, chứa bảng + biểu đồ Chart.js
- **CSV:** Download tự động, chứa dữ liệu chi tiết từng tàu

---

*Tiếp theo: [06_IMPORT_EXPORT.md](./06_IMPORT_EXPORT.md)*
