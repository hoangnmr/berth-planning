# TC-12: HỆ SỐ SỬ DỤNG CẦU BẾN (Berth Utilization)

> **Module:** Berth Utilization Calculation & Display  
> **Tài liệu tham chiếu:** [07-TINH-NANG-KHAC.md](../07-TINH-NANG-KHAC.md) - Mục 5  
> **Tổng số test cases:** 15

---

## 1. Tính toán cơ bản (Time-based)

### TC-12-001: Tính utilization 1 tàu trên 1 cầu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Tàu A: K12C, ETA=01/06 08:00, ETD=03/06 08:00 (2 ngày). Window: 01/06 - 08/06 (7 ngày) |
| **Bước thực hiện** | 1. Gọi `computeBerthUtilization(ships, opts)` với tàu A |
| **Kết quả mong đợi** | - PREP_TIME = 2h → interval: [01/06 06:00, 03/06 10:00] = 52h<br>- XALAN_FACTOR = 0.3 → occupied = 52h * 1.3 = 67.6h<br>- totalWindow = 7 * 24 = 168h<br>- pct = 67.6 / 168 * 100 ≈ 40.2%<br>- K12C utilization ≈ 40.2% |

---

### TC-12-002: Tính utilization nhiều tàu cùng cầu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | 2 tàu trên K12: Tàu A (01/06-03/06), Tàu B (04/06-05/06) |
| **Bước thực hiện** | 1. Gọi computeBerthUtilization |
| **Kết quả mong đợi** | - 2 intervals không overlap → tổng = sum(interval A) + sum(interval B)<br>- Áp dụng PREP_TIME và XALAN_FACTOR cho mỗi interval |

---

### TC-12-003: Tính utilization - intervals overlap merge

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | 2 tàu K12: Tàu A (01/06-03/06), Tàu B (02/06-04/06) - overlap time |
| **Bước thực hiện** | 1. Gọi computeBerthUtilization |
| **Kết quả mong đợi** | - Intervals với PREP_TIME overlap → merge thành 1 interval lớn<br>- Không đếm trùng thời gian overlap |

---

### TC-12-004: Utilization 0% khi cầu trống

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Không có tàu nào trên K12C |
| **Bước thực hiện** | 1. Gọi computeBerthUtilization cho K12C |
| **Kết quả mong đợi** | - K12C: pct = 0%, occupiedMs = 0 |

---

### TC-12-005: Utilization clip vào window

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Tàu ETA=30/05, ETD=03/06. Window: 01/06-08/06 |
| **Bước thực hiện** | 1. Gọi computeBerthUtilization |
| **Kết quả mong đợi** | - Interval bị clip: [01/06 00:00, 03/06 + PREP_TIME]<br>- Phần trước 01/06 không được tính |

---

## 2. Tính toán chi tiết (Mét × Thời gian)

### TC-12-006: Tính meterPct cho 1 tàu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Tàu A: K12C (189m), LOA=100m, start=0, end=100, 2 ngày |
| **Bước thực hiện** | 1. Gọi computeBerthUtilization với method mét×thời gian |
| **Kết quả mong đợi** | - occupiedMeterMs = 100m * 2 days * ms<br>- totalMeterMs = 189m * 7 days * ms<br>- Áp dụng XALAN_FACTOR<br>- meterPct = occupiedMeterMs * 1.3 / totalMeterMs * 100 |

---

### TC-12-007: Mét×Thời gian chính xác hơn khi nhiều tàu cùng thời gian

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | 2 tàu cùng cầu K12A, cùng thời gian, khác vị trí: A[0-80], B[90-132] |
| **Bước thực hiện** | 1. Tính meterPct |
| **Kết quả mong đợi** | - Meter ranges: [0,80] + [90,132] = 122m occupied<br>- KHÔNG đếm trùng (merge ranges)<br>- meterPct chính xác hơn time-based |

---

### TC-12-008: Gap < 10% LOA trong meter ranges coi là occupied

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | 2 tàu sát nhau: A[0-100], B[105-200], gap = 5m |
| **Bước thực hiện** | 1. Tính meter ranges merge |
| **Kết quả mong đợi** | - Gap 5m < 10% LOA → coi như occupied<br>- Merged range: [0, 200] = 200m |

---

## 3. Combined Utilization (TÂN THUẬN 1)

### TC-12-009: Tính combined K12C + K12A + K12 + K12B

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Tàu trên K12C, K12A, K12 (K12B trống) |
| **Bước thực hiện** | 1. Gọi computeBerthUtilization → kiểm tra combined |
| **Kết quả mong đợi** | - combined.name = "TÂN THUẬN 1"<br>- Gộp intervals từ 4 berths: K12C, K12A, K12, K12B<br>- Merge overlapping intervals<br>- pct tính từ tổng occupied / totalWindow |

---

### TC-12-010: TT2 KHÔNG nằm trong combined

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Tàu chỉ trên TT2 |
| **Bước thực hiện** | 1. Gọi computeBerthUtilization<br>2. Kiểm tra combined |
| **Kết quả mong đợi** | - combined.pct = 0% (TT2 không nằm trong combinedBerths)<br>- TT2 chỉ có utilization riêng trong rows |

---

## 4. Hiển thị Utilization

### TC-12-011: Hiển thị % trên BerthHeader

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Có tàu trên grid |
| **Bước thực hiện** | 1. Quan sát BerthHeader |
| **Kết quả mong đợi** | - Mỗi cầu hiển thị "XX.X%" dưới tên cầu<br>- Format: 1 chữ số thập phân |

---

### TC-12-012: Màu sắc theo ngưỡng utilization

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Các cầu có utilization khác nhau |
| **Bước thực hiện** | 1. Tạo dữ liệu để cầu có 30%, 60%, 90% utilization<br>2. Quan sát màu hiển thị |
| **Kết quả mong đợi** | - < 50%: Xanh lá<br>- 50-80%: Vàng<br>- > 80%: Đỏ |

---

## 5. Tham số cấu hình

### TC-12-013: Thay đổi PREP_TIME ảnh hưởng kết quả

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Không |
| **Bước thực hiện** | 1. Tính với opts.prepHours = 0<br>2. Tính với opts.prepHours = 4<br>3. So sánh kết quả |
| **Kết quả mong đợi** | - prepHours = 4 → utilization cao hơn prepHours = 0<br>- Mỗi tàu thêm 4h trước và 4h sau |

---

### TC-12-014: Thay đổi XALAN_FACTOR ảnh hưởng kết quả

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Không |
| **Bước thực hiện** | 1. Tính với opts.xalanFactor = 0<br>2. Tính với opts.xalanFactor = 0.5<br>3. So sánh |
| **Kết quả mong đợi** | - xalanFactor = 0.5 → utilization = base * 1.5<br>- xalanFactor = 0 → utilization = base (không nhân thêm) |

---

### TC-12-015: Utilization capped tại 100%

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Nhiều tàu dày đặc + XALAN_FACTOR cao |
| **Bước thực hiện** | 1. Tạo dữ liệu để occupiedMs * (1 + xalanFactor) > totalWindowMs |
| **Kết quả mong đợi** | - pct capped tại 100%, không vượt quá<br>- occupiedMs = min(occupiedMs, totalWindowMs) |

---

## 6. Ma trận Test Coverage

| Tính năng | P1 | P2 | P3 | P4 | Tổng |
|-----------|----|----|----|----|------|
| Time-based calculation | 2 | 3 | 0 | 0 | 5 |
| Meter×Time calculation | 0 | 2 | 1 | 0 | 3 |
| Combined (TÂN THUẬN 1) | 1 | 1 | 0 | 0 | 2 |
| Hiển thị | 1 | 0 | 1 | 0 | 2 |
| Tham số cấu hình | 0 | 1 | 2 | 0 | 3 |
| **Tổng** | **4** | **7** | **4** | **0** | **15** |
