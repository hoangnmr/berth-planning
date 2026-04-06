# TC-11: QUẢN LÝ CẨU (Crane Management)

> **Module:** Crane System (GW, GC, LB)  
> **Tài liệu tham chiếu:** [02-DU-LIEU-CAU-BEN.md](../02-DU-LIEU-CAU-BEN.md) - Mục 3, [07-TINH-NANG-KHAC.md](../07-TINH-NANG-KHAC.md) - Mục 6  
> **Tổng số test cases:** 12

---

## 1. Hiển thị cẩu

### TC-11-001: Hiển thị đúng 9 cẩu trên rail

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Component / Manual |
| **Điều kiện tiên quyết** | Ứng dụng đã load |
| **Bước thực hiện** | 1. Quan sát hàng cẩu trên BerthHeader |
| **Kết quả mong đợi** | - Block GW-main (743m): GW1, GW2, GW3, GW4, GW5, GC1, GC2<br>- Block TT2 (222m): LB1, LB40<br>- Tổng 9 cẩu |

---

### TC-11-002: Cẩu hiển thị đúng shape và tên

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Ứng dụng đã load |
| **Bước thực hiện** | 1. Quan sát shape và label của mỗi cẩu |
| **Kết quả mong đợi** | - GW1-GW5: hình tròn (circle), label "GW1"..."GW5"<br>- GC1-GC2: hình vuông (square), label "GC1", "GC2"<br>- LB1, LB40: hình tròn, label "LB1", "LB40" |

---

### TC-11-003: Vị trí mặc định của cẩu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Component / Manual |
| **Điều kiện tiên quyết** | Ứng dụng mới khởi động (chưa di chuyển cẩu) |
| **Bước thực hiện** | 1. Quan sát vị trí từng cẩu |
| **Kết quả mong đợi** | - GW1: ~6.7% block GW-main<br>- GW2: ~17.5%<br>- GW3: ~36.3%<br>- GW4: ~44.4%<br>- GW5: ~60.6%<br>- GC1: ~79.4%<br>- GC2: ~91.5%<br>- LB1: ~25.7% block TT2<br>- LB40: ~61.7% block TT2 |

---

## 2. Drag cẩu

### TC-11-004: Kéo cẩu GW trong phạm vi toàn bộ block

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Ứng dụng đã load |
| **Bước thực hiện** | 1. Drag cẩu GW3 sang trái (về phía K12C)<br>2. Drag cẩu GW3 sang phải (về phía K12B) |
| **Kết quả mong đợi** | - GW3 di chuyển được trong phạm vi 0% - 100% block GW-main<br>- Chỉ di chuyển theo trục X (ngang)<br>- Vị trí cập nhật mượt |

---

### TC-11-005: Cẩu GC bị giới hạn trong K12B (72.5% - 100%)

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Ứng dụng đã load |
| **Bước thực hiện** | 1. Drag cẩu GC1 về phía trái (ngoài K12B)<br>2. Drag cẩu GC1 về phía phải (cuối K12B) |
| **Kết quả mong đợi** | - GC1 KHÔNG thể di chuyển ra ngoài 72.5% block GW-main<br>- GC1 di chuyển được trong phạm vi 72.5% - 100%<br>- Bị clamped ở biên khi kéo quá giới hạn |

---

### TC-11-006: Cẩu LB di chuyển trong block TT2

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Ứng dụng đã load |
| **Bước thực hiện** | 1. Drag cẩu LB1 sang trái (đầu TT2)<br>2. Drag cẩu LB40 sang phải (cuối TT2) |
| **Kết quả mong đợi** | - LB1, LB40 di chuyển trong phạm vi 0% - 100% block TT2<br>- Không vượt ra ngoài block TT2 |

---

## 3. Lưu trữ vị trí cẩu

### TC-11-007: Vị trí cẩu được lưu vào localStorage

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Ứng dụng đã load |
| **Bước thực hiện** | 1. Di chuyển cẩu GW1 sang vị trí mới<br>2. Kiểm tra localStorage |
| **Kết quả mong đợi** | - cranePositions trong localStorage chứa vị trí mới của GW1<br>- Format: { GW1: X%, GW2: Y%, ... } |

---

### TC-11-008: Khôi phục vị trí cẩu sau reload

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Đã di chuyển cẩu |
| **Bước thực hiện** | 1. Di chuyển GW2 và LB1 sang vị trí mới<br>2. Reload trang<br>3. Đăng nhập |
| **Kết quả mong đợi** | - GW2 và LB1 ở vị trí đã lưu, không phải mặc định |

---

### TC-11-009: Vị trí cẩu trong file JSON

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Đã di chuyển cẩu |
| **Bước thực hiện** | 1. Lưu file JSON<br>2. Kiểm tra nội dung file → field "cranes" |
| **Kết quả mong đợi** | - File JSON chứa: "cranes": { "GW1": 25, "GW2": 80, ... }<br>- Giá trị khớp vị trí hiện tại trên giao diện |

---

### TC-11-010: Khôi phục cẩu từ file JSON

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | File JSON có field cranes |
| **Bước thực hiện** | 1. Mở file JSON<br>2. Kiểm tra vị trí cẩu |
| **Kết quả mong đợi** | - Tất cả cẩu ở vị trí lưu trong file<br>- Không phải vị trí mặc định |

---

## 4. Edge Cases

### TC-11-011: Cẩu không đè lên nhau (optional validation)

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P4 - Low |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | 2 cẩu gần nhau |
| **Bước thực hiện** | 1. Drag GW1 đến vị trí GW2 |
| **Kết quả mong đợi** | - Hiện tại: cẩu có thể đè lên nhau (chưa validate)<br>- Ghi nhận: nên thêm validation trong phiên bản sau |

---

### TC-11-012: Cẩu reset khi xóa localStorage

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Đã di chuyển cẩu |
| **Bước thực hiện** | 1. Xóa localStorage<br>2. Reload |
| **Kết quả mong đợi** | - Tất cả cẩu về vị trí mặc định |

---

## 5. Ma trận Test Coverage

| Tính năng | P1 | P2 | P3 | P4 | Tổng |
|-----------|----|----|----|----|------|
| Hiển thị cẩu | 1 | 2 | 0 | 0 | 3 |
| Drag cẩu | 2 | 1 | 0 | 0 | 3 |
| Lưu trữ vị trí | 0 | 4 | 0 | 0 | 4 |
| Edge cases | 0 | 0 | 1 | 1 | 2 |
| **Tổng** | **3** | **7** | **1** | **1** | **12** |
