# TC-05: KIỂM TRA CHỒNG LẤN & CẢNH BÁO (Overlap Detection)

> **Module:** Overlap Detection, Gap Warning, Berth Groups  
> **Tài liệu tham chiếu:** [05-PLANNER-GRID.md](../05-PLANNER-GRID.md) - Mục 5  
> **Tổng số test cases:** 20

---

## 1. Overlap cơ bản (cùng cầu bến)

### TC-05-001: Overlap 2 chiều - cùng vị trí, cùng thời gian

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Unit / Integration |
| **Điều kiện tiên quyết** | Tàu A: K12A, start=0, end=180, ETA=05/06, ETD=07/06 |
| **Bước thực hiện** | 1. Đặt tàu B: K12A, start=50, end=200, ETA=06/06, ETD=08/06 |
| **Kết quả mong đợi** | - Overlap detected = true<br>- Horizontal overlap: A[0-180] ∩ B[50-200] ✓<br>- Vertical overlap: A[05/06-07/06] ∩ B[06/06-08/06] ✓<br>- overlapShip = Tàu A |

---

### TC-05-002: Không overlap - cùng vị trí, khác thời gian

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Tàu A: K12A, start=0, end=180, ETA=05/06, ETD=07/06 |
| **Bước thực hiện** | 1. Đặt tàu B: K12A, start=0, end=180, ETA=08/06, ETD=10/06 |
| **Kết quả mong đợi** | - Overlap = false (khác thời gian, dù cùng vị trí)<br>- Tàu B được phép đặt |

---

### TC-05-003: Không overlap - khác vị trí, cùng thời gian

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Tàu A: K12, start=0, end=180, ETA=05/06, ETD=07/06 |
| **Bước thực hiện** | 1. Đặt tàu B: K12, start=200, end=350, ETA=05/06, ETD=07/06 |
| **Kết quả mong đợi** | - Overlap = false (khác vị trí, dù cùng thời gian)<br>- Tàu B được phép đặt |

---

### TC-05-004: Overlap biên - tàu B bắt đầu đúng vị trí kết thúc tàu A

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Tàu A: start=0, end=180, ETA=05/06, ETD=07/06 |
| **Bước thực hiện** | 1. Đặt tàu B: start=180, end=330, ETA=05/06, ETD=07/06 |
| **Kết quả mong đợi** | - Overlap = false (newStart = otherEnd, không giao nhau theo logic strict: newStart < otherEnd)<br>- Có thể có gap warning nếu khoảng cách = 0 |

---

### TC-05-005: Overlap - tàu B nằm hoàn toàn bên trong tàu A

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Tàu A: start=0, end=300, ETA=01/06, ETD=10/06 |
| **Bước thực hiện** | 1. Đặt tàu B: start=50, end=150, ETA=03/06, ETD=05/06 (nằm hoàn toàn trong A) |
| **Kết quả mong đợi** | - Overlap = true<br>- B hoàn toàn bên trong A cả horizontal & vertical |

---

## 2. Overlap giữa các nhóm cầu bến (Berth Groups)

### TC-05-006: Overlap giữa K12A và K12 (cùng nhóm)

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Unit / Integration |
| **Điều kiện tiên quyết** | Tàu A: K12A, start=100, end=180 (absEnd = 229+180 = 409). Tàu B: K12, start=0, end=150 (absStart = 229+132 = 361) |
| **Bước thực hiện** | 1. Check overlap giữa A và B cùng nhóm K12A/K12/K12B<br>2. Cả 2 tàu cùng thời gian |
| **Kết quả mong đợi** | - Overlap được kiểm tra vì cùng nhóm (refStart=229)<br>- A: [100, 180], B: [132, 282] (relative to refStart)<br>- Horizontal: 100 < 282 AND 180 > 132 → overlap ✓ |

---

### TC-05-007: Không check overlap giữa K12C và K12A (khác nhóm)

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Tàu A: K12C, Tàu B: K12A (khác nhóm) |
| **Bước thực hiện** | 1. Kiểm tra overlap giữa A (K12C) và B (K12A) |
| **Kết quả mong đợi** | - KHÔNG kiểm tra overlap (khác nhóm berth)<br>- K12C là nhóm riêng, cách biệt bởi gap 30m |

---

### TC-05-008: Không check overlap giữa K12B và TT2 (khác nhóm)

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Tàu A: K12B, Tàu B: TT2 |
| **Bước thực hiện** | 1. Kiểm tra overlap giữa A và B |
| **Kết quả mong đợi** | - KHÔNG kiểm tra overlap<br>- TT2 có refStart riêng (773), K12B thuộc nhóm refStart=229 |

---

### TC-05-009: Overlap giữa K12 và K12B (cùng nhóm)

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Tàu A: K12, LOA lớn (250m) vắt qua ranh K12/K12B. Tàu B: K12B |
| **Bước thực hiện** | 1. Kiểm tra overlap |
| **Kết quả mong đợi** | - Overlap detected nếu cả 2 giao nhau horizontal & vertical<br>- Cùng refStart=229 nên so sánh vị trí relative chính xác |

---

## 3. Gap Warning (Cảnh báo khoảng cách)

### TC-05-010: Gap warning khi khoảng cách < 10% LOA lớn hơn

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Tàu A: LOA=200, end=200. Tàu B: LOA=150, start=210. Khoảng cách=10m, minGap=10%*200=20m |
| **Bước thực hiện** | 1. Đặt tàu B cạnh tàu A<br>2. Kiểm tra gap warning |
| **Kết quả mong đợi** | - gapWarning = true (10m < 20m)<br>- Tàu B vẫn được đặt (gap warning không block)<br>- Toast warning hiển thị |

---

### TC-05-011: Không có gap warning khi khoảng cách đủ lớn

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Tàu A: LOA=180, end=180. Tàu B: LOA=150, start=210. Khoảng cách=30m, minGap=10%*180=18m |
| **Bước thực hiện** | 1. Kiểm tra gap warning |
| **Kết quả mong đợi** | - gapWarning = false (30m > 18m)<br>- Không hiển thị cảnh báo |

---

### TC-05-012: Gap warning chỉ khi vertical overlap (cùng thời gian)

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Tàu A và B gần nhau nhưng khác thời gian hoàn toàn |
| **Bước thực hiện** | 1. Tàu A: 01/06-03/06, Tàu B: 05/06-07/06, cách nhau 5m |
| **Kết quả mong đợi** | - gapWarning = false (không cùng thời gian)<br>- Khoảng cách chỉ có ý nghĩa khi 2 tàu cùng neo đậu |

---

### TC-05-013: Gap warning tính LOA tàu lớn hơn

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Tàu A: LOA=100, Tàu B: LOA=250, khoảng cách = 15m |
| **Bước thực hiện** | 1. Kiểm tra gap: minGap = 10% * max(100, 250) = 25m |
| **Kết quả mong đợi** | - gapWarning = true (15m < 25m)<br>- Dùng LOA tàu lớn hơn (250m) để tính ngưỡng |

---

## 4. Visual Feedback khi Overlap

### TC-05-014: Viền đỏ khi đang drag qua vùng overlap

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | 2 tàu trên grid |
| **Bước thực hiện** | 1. Drag tàu A di chuyển vào vùng tàu B |
| **Kết quả mong đợi** | - Tàu A hiển thị viền đỏ (class ship-overlap)<br>- Visual feedback realtime khi di chuột |

---

### TC-05-015: Viền vàng khi gap warning trong lúc drag

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | 2 tàu trên grid, khoảng cách gần |
| **Bước thực hiện** | 1. Drag tàu A đến gần tàu B (trong vùng gap warning) |
| **Kết quả mong đợi** | - Tàu A hiển thị viền vàng (class ship-gap-warning)<br>- Không block drag (vẫn di chuyển được) |

---

### TC-05-016: Highlight 3 giây khi overlap detected (cập cầu / cập nhật)

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | 2 tàu trên grid |
| **Bước thực hiện** | 1. Sửa vị trí tàu A trong Detail Panel để overlap tàu B<br>2. Click "Cập Nhật Kế Hoạch" |
| **Kết quả mong đợi** | - Toast error: overlap<br>- Cả 2 tàu (A và B) highlight 3 giây (class ship-highlighted)<br>- Sau 3 giây → bỏ highlight |

---

## 5. Overlap khi drag (Rollback)

### TC-05-017: Rollback vị trí khi mouseUp có overlap

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Manual / Integration |
| **Điều kiện tiên quyết** | 2 tàu trên grid |
| **Bước thực hiện** | 1. Ghi nhớ vị trí ban đầu tàu A (left, top)<br>2. Drag tàu A đè lên tàu B<br>3. Thả (mouseUp) |
| **Kết quả mong đợi** | - Tàu A quay về vị trí ban đầu<br>- ETA/ETD khôi phục giá trị cũ<br>- berthName khôi phục<br>- Visual overlap (viền đỏ) biến mất |

---

### TC-05-018: Không rollback khi chỉ có gap warning

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | 2 tàu gần nhau |
| **Bước thực hiện** | 1. Drag tàu A đến gần tàu B (gap warning, không overlap)<br>2. Thả (mouseUp) |
| **Kết quả mong đợi** | - Tàu A ở vị trí mới (KHÔNG rollback)<br>- gapWarning được gán cho tàu |

---

## 6. Overlap khi cập nhật từ Detail Panel

### TC-05-019: Cập nhật Detail Panel - loại trừ chính tàu đang sửa

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Unit / Integration |
| **Điều kiện tiên quyết** | Tàu A đang trên grid, mở Detail Panel cho tàu A |
| **Bước thực hiện** | 1. Không thay đổi gì<br>2. Click "Cập Nhật Kế Hoạch" |
| **Kết quả mong đợi** | - Cập nhật thành công (tàu A không overlap với chính nó)<br>- Chính tàu đang sửa được loại khỏi danh sách so sánh |

---

### TC-05-020: Cập nhật vị trí overlap với tàu khác

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Tàu A và B trên grid cùng cầu |
| **Bước thực hiện** | 1. Mở Detail Panel tàu A<br>2. Sửa start/end để trùng với tàu B<br>3. Click "Cập Nhật" |
| **Kết quả mong đợi** | - Toast error: overlap detected<br>- Tàu A giữ nguyên vị trí cũ<br>- Cả 2 tàu highlight 3s |

---

## 7. Ma trận Test Coverage

| Tính năng | P1 | P2 | P3 | P4 | Tổng |
|-----------|----|----|----|----|------|
| Overlap cơ bản (cùng cầu) | 3 | 2 | 0 | 0 | 5 |
| Overlap nhóm cầu bến | 2 | 2 | 0 | 0 | 4 |
| Gap warning | 1 | 3 | 0 | 0 | 4 |
| Visual feedback | 0 | 2 | 1 | 0 | 3 |
| Rollback khi drag | 1 | 1 | 0 | 0 | 2 |
| Overlap khi cập nhật | 2 | 0 | 0 | 0 | 2 |
| **Tổng** | **9** | **10** | **1** | **0** | **20** |
