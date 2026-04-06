# 02 - Dữ liệu Cầu bến, Pitch & Cẩu

## 1. Mô hình cầu bến (Berth Model)

### 1.1 Tổng quan hệ quy chiếu

Toàn bộ hệ thống sử dụng **hệ quy chiếu tuyệt đối 1005 mét** theo trục ngang:

```
  0m   10m          199m 229m    361m       549m       753m 773m        995m 1005m
  |gap10| K12C (189m) |gap30| K12A(132m)|  K12(188m) |K12B(204m)|gap20| TT2 (222m) |gap10|
```

**Chi tiết phân bố:**

| Phần | Từ (m) | Đến (m) | Chiều dài | Loại |
|------|--------|---------|-----------|------|
| Gap đầu | 0 | 10 | 10m | Khoảng trống |
| **K12C** | 10 | 199 | 189m | Cầu bến |
| Gap 1 | 199 | 229 | 30m | Khoảng trống |
| **K12A** | 229 | 361 | 132m | Cầu bến |
| **K12** | 361 | 549 | 188m | Cầu bến |
| **K12B** | 549 | 753 | 204m | Cầu bến |
| Gap 2 | 753 | 773 | 20m | Khoảng trống |
| **TT2** | 773 | 995 | 222m | Cầu bến |
| Gap cuối | 995 | 1005 | 10m | Khoảng trống |
| **Tổng** | | | **1005m** | |

### 1.2 Hệ quy chiếu tương đối (Reference System)

Mỗi cầu bến có **refStart** - điểm gốc tọa độ riêng. Vị trí tàu trên mỗi cầu được lưu **relative** so với refStart:

| Cầu | refStart (m tuyệt đối) | Ghi chú |
|-----|----------------------|---------|
| K12C | 10 | Hệ quy chiếu riêng |
| K12A | 229 | Chung nhóm K12A/K12/K12B |
| K12 | 229 | Chung nhóm K12A/K12/K12B |
| K12B | 229 | Chung nhóm K12A/K12/K12B |
| TT2 | 773 | Hệ quy chiếu riêng |

> **Quy tắc chuyển đổi:**  
> `vị trí tuyệt đối = refStart + vị trí tương đối`  
> `vị trí tương đối = vị trí tuyệt đối - refStart`

**Ý nghĩa:** K12A, K12, K12B chia sẻ chung refStart = 229. Nghĩa là khi tàu nằm ở đầu K12 thì `start` relative = 361 - 229 = 132 (tức 132m tính từ đầu K12A). Điều này cho phép kiểm tra overlap giữa tàu ở K12A, K12, K12B với nhau.

### 1.3 Nhóm cầu bến (Berth Groups)

Các cầu trong cùng nhóm có thể **overlap lẫn nhau** vì nằm liền kề:

| Nhóm | Cầu bến | Lý do |
|------|---------|-------|
| Nhóm riêng | K12C | Cách biệt bởi gap 30m |
| Nhóm chung | K12A, K12, K12B | Liền kề, tàu lớn có thể chiếm nhiều cầu |
| Nhóm riêng | TT2 | Cách biệt bởi gap 20m |

---

## 2. Dữ liệu Pitch (Thước đo mét)

### 2.1 Pitch thông thường

Pitch là các mốc đo chiều dài (mét) trên mỗi cầu bến, dùng làm thước tham chiếu trực quan.

**K12C (8 pitch):**

| Pitch ID | Vị trí tương đối (m) | Label |
|----------|---------------------|-------|
| 1 | 0 | 0 |
| 2 | 24 | 24 |
| 3 | 53 | 53 |
| 4 | 79 | 79 |
| 5 | 108 | 108 |
| 6 | 134 | 134 |
| 7 | 168 | 168 |
| 8 | 180 | 187 |

**K12A (6 pitch):**

| Pitch ID | Vị trí tương đối (m) | Label |
|----------|---------------------|-------|
| 1 | 7 | 7 |
| 2 | 34 | 34 |
| 3 | 54 | 54 |
| 4 | 78 | 78 |
| 5 | 98 | 98 |
| 6 | 125 | 125 |

**K12 (6 pitch) - Label tính từ đầu K12A:**

| Pitch ID | Vị trí tương đối (m) | Label |
|----------|---------------------|-------|
| 7 | 16 | 148 |
| 8 | 41 | 173 |
| 9 | 70 | 202 |
| 10 | 100 | 232 |
| 11 | 129 | 261 |
| 12 | 159 | 291 |

**K12B (9 pitch) - Label tính từ đầu K12A:**

| Pitch ID | Vị trí tương đối (m) | Label |
|----------|---------------------|-------|
| 13 | 0 | 320 |
| 14 | 19 | 339 |
| 15 | 42 | 362 |
| 16 | 64 | 384 |
| 17 | 87 | 407 |
| 18 | 114 | 434 |
| 19 | 142 | 462 |
| 20 | 170 | 490 |
| 21 | 195 | 522 |

**TT2 (14 pitch):**

| Pitch ID | Vị trí tương đối (m) | Label |
|----------|---------------------|-------|
| 0 | 0 | 0 |
| 1 | 12 | 12 |
| 2 | 30 | 30 |
| 3 | 45 | 45 |
| 4 | 61 | 61 |
| 5 | 79 | 79 |
| 6 | 97 | 97 |
| 7 | 115 | 115 |
| 8 | 132 | 132 |
| 9 | 150 | 150 |
| 10 | 166 | 166 |
| 11 | 184 | 184 |
| 12 | 201 | 201 |
| 13 | 215 | 222 |

### 2.2 Pitch độc lập (Pitch đặc biệt - Màu đỏ)

| ID | Vị trí tuyệt đối (m) | Label | Vị trí |
|----|---------------------|-------|--------|
| B1 | 723 | -40 | Giữa gap K12B-TT2 |
| B2 | 970 | 245 | Trong gap sau TT2 |

---

## 3. Hệ thống Cẩu (Crane System)

### 3.1 Tổng quan

Có 3 loại cẩu, mỗi loại có hình dạng và phạm vi di chuyển khác nhau:

| Loại | Shape | Color | Phạm vi |
|------|-------|-------|---------|
| GW (Giàn Wheels) | Tròn (circle) | crane-color-gw | Toàn bộ K12C + gap30 + K12A + K12 + K12B (743m) |
| GC (Giàn Container) | Vuông (square) | crane-color-gc | Chỉ trong K12B (72.5% - 100% của block 743m) |
| LB (Liebherr) | Tròn (circle) | crane-color-lb | Toàn bộ TT2 (222m) |

### 3.2 Vị trí mặc định

**Block GW-main (743m = K12C + gap + K12A + K12 + K12B):**

| Cẩu | Vị trí mặc định | Min% | Max% |
|-----|-----------------|------|------|
| GW1 | 50/743 (≈6.7%) | 0% | 100% |
| GW2 | 130/743 (≈17.5%) | 0% | 100% |
| GW3 | 270/743 (≈36.3%) | 0% | 100% |
| GW4 | 330/743 (≈44.4%) | 0% | 100% |
| GW5 | 450/743 (≈60.6%) | 0% | 100% |
| GC1 | 590/743 (≈79.4%) | 72.5% | 100% |
| GC2 | 680/743 (≈91.5%) | 72.5% | 100% |

**Block TT2 (222m):**

| Cẩu | Vị trí mặc định | Min% | Max% |
|-----|-----------------|------|------|
| LB1 | 57/222 (≈25.7%) | 0% | 100% |
| LB40 | 137/222 (≈61.7%) | 0% | 100% |

### 3.3 Hành vi cẩu

- Cẩu có thể **kéo thả (drag)** trên thanh ray
- Vị trí cẩu bị giới hạn trong phạm vi `minPercent` - `maxPercent` của block
- Vị trí cẩu được lưu vào `cranePositionsRef` và persist qua localStorage/JSON
- Cẩu GC chỉ hoạt động trong phạm vi K12B (dùng cho container)

---

## 4. Model dữ liệu Tàu (Ship Object)

### 4.1 Các trường chính

| Field | Type | Mô tả | Bắt buộc |
|-------|------|-------|----------|
| `id` | String | ID duy nhất (ví dụ: 'W1', 'W1706123456789') | ✅ |
| `name` | String | Tên tàu | ✅ |
| `dwt` | Number | Dead Weight Tonnage | ❌ |
| `loa` | Number | Length Overall (mét) - chiều dài tàu | ✅ (để tính vị trí) |
| `beam` | Number | Chiều rộng tàu (mét) | ❌ |
| `cargoType` | String | Loại hàng: 'Container', 'Sắt thép', 'Hàng khác' | ❌ |
| `cargo` | String/Number | Khối lượng hàng. Container: "import/export" (vd: "500/300") | ❌ |
| `berthName` | String | Cầu bến hiện tại: 'K12C', 'K12A', 'K12', 'K12B', 'TT2' | ✅ (cho berthed ship) |
| `mandra` | String | Mạn cập: 'left' (trái) hoặc 'right' (phải) | ❌ |
| `eta` | Date | Estimated Time of Arrival (ngày cập cầu) | ✅ (cho berthed ship) |
| `etd` | Date | Estimated Time of Departure (ngày rời cầu) | ✅ (cho berthed ship) |
| `start` | Number | Vị trí bắt đầu tàu (relative-to-berth, mét) | ✅ (cho berthed ship) |
| `end` | Number | Vị trí kết thúc tàu (relative-to-berth, mét) | ✅ (cho berthed ship) |
| `notes` | String | Ghi chú | ❌ |

**Các trường bổ sung (tùy chọn, được lưu trữ khi import/edit):**

| Field | Type | Mô tả |
|-------|------|-------|
| `imo` | String | Mã IMO tàu |
| `nationalID` | String | Quốc tịch tàu |
| `draftIn` | Number | Mớn nước vào (m) |
| `draftOut` | Number | Mớn nước ra (m) |
| `ton` | Number | Trọng tải (tấn) |
| `agent` | String | Đại lý hàng hải |
| `gapWarning` | Boolean | Cờ cảnh báo khoảng cách < 10% LOA (transient) |

### 4.2 Trường Style (chỉ cho tàu đã cập cầu)

| Field | Type | Mô tả |
|-------|------|-------|
| `style.left` | String | Vị trí X: `calc(absStart/1005*100%)` |
| `style.width` | String | Chiều rộng: `calc(widthMeters/1005*100%)` |
| `style.top` | String | Vị trí Y: `${topPx}px` |
| `style.height` | String | Chiều cao: `${heightPx}px` |

### 4.3 Trường phụ

| Field | Type | Mô tả |
|-------|------|-------|
| `gapWarning` | Boolean | Cảnh báo khoảng cách < 10% LOA |
| `imo` | String | IMO number (hiện không sử dụng nhiều) |

---

## 5. Lưu ý khi triển khai lại

### 5.1 Dữ liệu cầu bến
- Cấu trúc cầu bến (berths, gaps, pitches) nên được cấu hình qua JSON/database, **không hardcode**
- Hệ quy chiếu tương đối (refStart) nên được tự động tính từ cấu hình cầu bến
- Nhóm berth (berth groups) nên được xác định tự động dựa trên cấu trúc liền kề

### 5.2 Vị trí tàu
- Hệ quy chiếu 2 lớp (tuyệt đối 1005m + tương đối per-berth) nên được giữ nguyên logic
- Style (`calc(x/total*100%)`) là cách hiện tại render vị trí tàu trên DOM, có thể thay bằng Canvas/SVG tọa độ trực tiếp

### 5.3 Normalize Cargo Type

Hàm `normalizeCargoType(cargoType)` chuẩn hóa loại hàng từ nhiều biến thể khác nhau:

```
Logic:
1. Lowercase input
2. Chứa 'cont' hoặc 'container' → "Container"
3. Chứa 'sắt' hoặc 'sat' hoặc 'thép' hoặc 'thep' hoặc 'steel' → "Sắt thép"
4. Còn lại → "Hàng khác"
```

> **Lưu ý:** Logic này được dùng khi import từ Excel, khi tạo tàu mới, và khi hiển thị màu sắc tàu.

### 5.4 Hằng số bổ sung

| Hằng số | Giá trị | Mô tả |
|---------|---------|-------|
| MIN_SHIP_GAP_RATIO | 0.1 (10%) | Khoảng cách an toàn tối thiểu giữa 2 tàu = 10% LOA tàu lớn hơn |
| DEFAULT_NUM_DAYS | 7 | Số ngày hiển thị mặc định |
| DEFAULT_PASSWORD | "HoangTT" | Mật khẩu mặc định |
| STORAGE_KEY | 'berthPlannerState' | Key lưu state trong localStorage |
| PASSWORD_KEY | 'plannerPassword' | Key lưu mật khẩu tùy chỉnh |

### 5.3 Dữ liệu cẩu
- Vị trí cẩu mặc định và phạm vi di chuyển nên đưa vào cấu hình
- Cần thêm validation: cẩu không được đè lên nhau trên cùng ray
