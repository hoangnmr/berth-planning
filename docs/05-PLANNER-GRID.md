# 05 - Planning Grid (Kéo thả, Cập cầu, Overlap)

## 1. Hệ tọa độ Planning Grid

### 1.1 Trục X (Ngang - Vị trí mét)

- Tổng: **1005 mét** → 100% width
- Vị trí tàu dùng `calc(absMeters / 1005 * 100%)`
- Chia thành các column flexbox tương ứng cầu bến + gap

### 1.2 Trục Y (Dọc - Thời gian)

- Mỗi slot = **12 giờ** = **30px** chiều cao
- Mỗi ngày = 2 slot (NGÀY + ĐÊM) = **60px**
- Vị trí thời gian: `topPx = ((eta - startDate) / msPerSlot) * 30`
- Chiều cao tàu: `heightPx = ((etd - eta) / msPerSlot) * 30`

### 1.3 Hằng số

| Hằng số | Giá trị | Mô tả |
|---------|---------|-------|
| TOTAL_METERS | 1005 | Tổng chiều dài hệ quy chiếu |
| SLOT_HEIGHT | 30 px | Chiều cao 1 slot (12 giờ) |
| MS_PER_SLOT | 43,200,000 ms | 12 giờ tính bằng milliseconds |
| MIN_SHIP_HEIGHT | 48 px | Chiều cao tối thiểu tàu (để hiển thị nội dung) |

---

## 2. Render tàu trên Grid

### 2.1 Chuyển đổi từ Ship Data → CSS Style

Hàm chuyển dữ liệu tàu sang vị trí hiển thị:

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

### 2.2 Chuyển đổi ngược: CSS Style → Ship Data (parse positions)

```
Input: ship.style.left, ship.style.width
Output: { start, end } (relative-to-berth)

Logic:
1. Parse left: match /calc\((-?\d+)\/\d+\*100%\)/ → absStart
2. Parse width: match /calc\((\d+)\/\d+\*100%\)/ → widthMeters
3. absEnd = absStart + widthMeters
4. Tìm berthDef từ berthName
5. start = absStart - berthDef.refStart
6. end = absEnd - berthDef.refStart
```

### 2.3 Logic tính style (calculateShipStyle)

Hàm `calculateShipStyle(ship, startDate)` trong PlanningGrid:

```
Input: ship (với eta, etd, style.left, style.width)
Output: { ...ship.style, top, height }

Logic:
1. Nếu thiếu eta hoặc etd → top = '0px', height = '30px' (1 slot)
2. top = ((eta.getTime() - startDate.getTime()) / MS_PER_SLOT) * SLOT_HEIGHT
3. height = ((etd.getTime() - eta.getTime()) / MS_PER_SLOT) * SLOT_HEIGHT
4. Giữ nguyên left, width từ ship.style
```

### 2.2 Chiều cao tối thiểu

Nếu `height < MIN_SHIP_HEIGHT (48px)` → force thành `48px` để đảm bảo đọc được nội dung tàu.

---

## 3. Drag & Drop từ Waiting List vào Grid

### 3.1 Workflow

```
1. [WaitingShipCard] dragStart:
   - setData('application/json', JSON.stringify(ship))
   - effectAllowed = 'move'

2. [PlanningGrid] dragOver:
   - preventDefault() để cho phép drop
   - Tính slot index từ vị trí Y → highlight slot tương ứng

3. [PlanningGrid] drop:
   - Lấy ship data từ dataTransfer
   - Gọi window.onShipDropFromWaiting(ship, event)

4. [App.js] onShipDropFromWaiting:
   a. Xác định berth từ tọa độ X:
      - absoluteMeters = (x / totalWidth) * 1005
      - Duyệt blockDefs để tìm berth
   b. Tính vị trí relative-to-berth:
      - startRel = absoluteMeters - refStart - (LOA / 2)  // căn giữa tàu
      - endRel = startRel + LOA
   c. Tính ETA/ETD từ tọa độ Y:
      - slot = floor(y / slotHeight)
      - eta = startDate + slot * msPerSlot
      - etd = eta + duration (giữ nguyên duration nếu có, default 24h)
   d. Tính style (left, width, top, height)
   e. Tạo newShip → thêm vào berthedShips, xóa khỏi waitingShips
   f. Toast success
```

### 3.2 Xác định vị trí từ Mouse Position

**Từ Mouse X → Berth:**
```
1. Lấy gridRect = grid.getBoundingClientRect()
2. Tính relativeX = clientX - gridRect.left
3. Tính absoluteM = relativeX / gridRect.width * 1005
4. So sánh absoluteM với blockDefs:
   - 10-199: K12C
   - 199-229: Gap (return null, không cho thả)
   - 229-361: K12A
   - 361-549: K12
   - 549-753: K12B
   - 753-773: Gap (return null)
   - 773-995: TT2
   - Else: ngoài phạm vi
```

**Từ Mouse Y → Time Slot:**
```
1. Lấy gridRect = grid.getBoundingClientRect()
2. Tính relativeY = clientY - gridRect.top
3. slotIndex = floor(relativeY / SLOT_HEIGHT)
4. eta = startDate + slotIndex * MS_PER_SLOT
5. etd = eta + ship.durationMs (hoặc default 24h)
```

### 3.3 Block Definitions (xác định berth từ vị trí X)

| Block ID | Start (m) | End (m) |
|----------|-----------|---------|
| gap | 0 | 10 |
| K12C | 10 | 199 |
| gap | 199 | 229 |
| K12A | 229 | 361 |
| K12 | 361 | 549 |
| K12B | 549 | 753 |
| gap | 753 | 773 |
| TT2 | 773 | 995 |
| gap | 995 | 1005 |

> Nếu thả vào vùng gap → bỏ qua (không tạo tàu)

---

## 4. Drag tàu trong Grid (Di chuyển tàu đã cập cầu)

### 4.1 Workflow chi tiết

```
MouseDown trên BerthedShip:
1. Lưu originalShipRef (eta, etd, berthName, style) để rollback
2. setIsDragging(true), setHasMoved(false)
3. Ghi nhận dragStartX, dragStartY
4. Cursor = 'grabbing', userSelect = 'none'
5. Hiện tooltip, set global flag window.__shipDraggingId

MouseMove:
1. Tính deltaX, deltaY từ vị trí trước
2. Nếu |delta| > 3px → setHasMoved(true)
3. Parse style.left hiện tại → tính meters mới
4. Parse style.top hiện tại → tính pixels mới
5. Giới hạn: 
   - Ngang: [-shipWidth, totalMeters]  (cho phép ló tàu)
   - Dọc: [0, containerHeight - shipHeight]
6. Xác định berth mới: determinePrimaryBerth(newLeft, newLeft + shipWidth)
7. Real-time overlap check:
   - Duyệt allShips cùng berth group
   - Kiểm tra giao nhau 2 chiều (horizontal & vertical)
   - setHasOverlap / setHasGapWarning → Visual feedback
8. Gọi onShipPositionChange(shipId, { left, top, timeOffset, berthName })
9. Cập nhật tooltip position (requestAnimationFrame)
10. Reset dragStart cho lần move tiếp

MouseUp:
1. setIsDragging(false)
2. Nếu hasOverlap:
   → Rollback: gọi onShipPositionChange với originalShip data
   → Reset hasOverlap, hasMoved
   → return

3. Nếu !hasMoved (click, không drag):
   → Gọi onShipClick(ship) → Select tàu
   → return

4. Snap to slot:
   - currentSlot = topPx / SLOT_HEIGHT
   - snappedSlot = Math.round(currentSlot)
   - snappedTopPx = snappedSlot * SLOT_HEIGHT
   - Tính timeOffset từ snapped position
   - Xác định berth
   - Gọi onShipPositionChange với vị trí snapped

5. Gọi onShipDragEnd() → Reset activeBerth, activeDayIndex
```

### 4.2 Logic nhận event tại App.js (handleShipPositionChange)

```
Khi nhận được position change:
1. Update activeBerth (cho highlight cầu bến)
2. Tính activeDayIndex:
   - Từ topPx, heightPx → tìm tất cả slot NGÀY/ĐÊM giao nhau
   - setActiveDayIndex(overlapping slots)
3. Update berthedShips:
   - Cập nhật style.left
   - Tính lại start/end relative-to-berth từ left
   - Cập nhật berthName
   - Tính lại ETA/ETD từ timeOffset (nếu có)
   - Hoặc rollback ETA/ETD nếu có rollbackEta/rollbackEtd
```

---

## 5. Kiểm tra Overlap (Chồng lấn)

### 5.1 Logic checkOverlapAndGap

**Input:**
- ship: tàu đang kiểm tra (có berthName, loa, start/end hoặc style)
- allShips: danh sách tàu khác
- startDateMs: mốc thời gian gốc

**Logic chính:**

```
1. Parse vị trí tàu mới: newStart, newEnd (mét), newTop, newBottom (px)

2. Duyệt từng otherShip trong allShips:
   a. Bỏ qua nếu cùng ID
   b. Kiểm tra berth group: chỉ check nếu 2 tàu thuộc cùng nhóm
      - K12C ↔ K12C: check
      - K12A/K12/K12B ↔ K12A/K12/K12B: check
      - TT2 ↔ TT2: check
      - K12C ↔ K12A: KHÔNG check
   c. Parse vị trí otherShip (ưu tiên tính lại từ eta/etd)
   d. Check overlap 2 chiều:
      - Horizontal: newStart < otherEnd AND newEnd > otherStart
      - Vertical: newTop < otherBottom AND newBottom > otherTop
      → Nếu CẢ HAI: return { overlap: true, overlapShip }
   e. Check gap warning (chỉ khi vertical overlap, không horizontal overlap):
      - dist = khoảng cách mép gần nhất giữa 2 tàu
      - minGap = 10% × max(LOA_tàu1, LOA_tàu2)
      → Nếu dist < minGap: gapWarning = true

3. Return { overlap: false, gapWarning, overlapShip: null }
```

### 5.2 Visual Feedback khi Overlap

| Trạng thái | CSS Class | Hiệu ứng |
|------------|-----------|-----------|
| Đang overlap (khi drag) | `ship-overlap` | Viền đỏ, có thể nhấp nháy |
| Gap warning (khi drag) | `ship-gap-warning` | Viền vàng |
| Highlighted (sau overlap detect) | `ship-highlighted` | Highlight 3 giây rồi tắt |

### 5.3 Rollback khi Overlap

Khi mouseUp mà hasOverlap = true:
1. Lấy lại originalShipRef (saved khi mouseDown)
2. Gọi onShipPositionChange với rollbackEta, rollbackEtd, original style
3. Tàu quay về vị trí cũ

---

## 6. Xác định Berth chính (determinePrimaryBerth)

Khi tàu nằm trên ranh giới giữa các cầu, cần xác định cầu chính:

```
Logic:
1. Duyệt tất cả BERTH_DEFINITIONS
2. Tính overlap (mét) giữa tàu [shipStart, shipEnd] và mỗi berth [berth.start, berth.end]
3. Berth nào có overlap lớn nhất → là berth chính

Ví dụ: Tàu từ 340m → 400m
- K12A (229-361): overlap = 361-340 = 21m
- K12 (361-549): overlap = 400-361 = 39m
→ Berth chính = K12
```

---

## 7. Timeline Interaction

### 7.1 Slot highlight khi chọn tàu

```
1. Tính topPx, heightPx từ ETA/ETD
2. Duyệt qua numDays × 2 slot:
   - daySlotStart = i * 60, daySlotEnd = i * 60 + 30  (NGÀY)
   - nightSlotStart = i * 60 + 30, nightSlotEnd = (i+1) * 60  (ĐÊM)
3. Nếu ship [topPx, topPx+heightPx] giao với slot → thêm vào highlight list
4. setActiveDayIndex(list of slot indices)
```

### 7.2 Slot highlight khi drag over (từ waiting list)

```
1. Tính vị trí Y chuột trong grid
2. slotIndex = floor(y / slotHeight)
3. onActiveDayChange(slotIndex)
```

---

## 8. Lưu ý khi triển khai lại

### 8.1 Drag & Drop
- Hiện tại dùng kết hợp **HTML5 Drag API** (waiting → grid) và **manual mouse events** (trong grid)
- Nên thống nhất sử dụng **1 library** (React DnD hoặc DnD Kit) cho cả 2 trường hợp
- Hoặc chuyển sang Canvas-based rendering (Konva.js) để performance tốt hơn với nhiều tàu

### 8.2 Overlap Detection
- Hiện tại check overlap theo 2 chiều (horizontal + vertical) trên pixel/meter
- Logic overlap cần được tách thành pure function testable
- Nên thêm spatial indexing (R-tree) nếu số lượng tàu lớn

### 8.3 Position Calculation
- Hệ thống `calc()` CSS cho vị trí tàu hoạt động tốt nhưng khó debug
- Cân nhắc sử dụng tọa độ số thuần và transform CSS hoặc Canvas render
- Cần đồng bộ giữa: ship.start/end, ship.style.left/width, và ETA/ETD ↔ top/height

### 8.4 Snap Behavior
- Hiện tại chỉ snap theo **chiều dọc** (trục Y - thời gian): snap vào slot 12h (NGÀY/ĐÊM)
- **Không snap theo chiều ngang** (trục X - vị trí): cho phép đặt tàu tại vị trí chính xác đến 1m
- Có thể mở rộng: snap vào giờ chẵn, snap vào pitch mét
