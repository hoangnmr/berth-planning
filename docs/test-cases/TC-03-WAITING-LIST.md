# TC-03: DANH SÁCH TÀU CHỜ & CẬP CẦU (Waiting List)

> **Module:** Waiting List & Docking  
> **Tài liệu tham chiếu:** [04-QUAN-LY-TAU.md](../04-QUAN-LY-TAU.md) - Mục 2  
> **Tổng số test cases:** 18

---

## 1. Hiển thị Waiting List

### TC-03-001: Hiển thị danh sách tàu chờ đúng số lượng

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Component / Manual |
| **Điều kiện tiên quyết** | Có 5 tàu trong waiting list |
| **Bước thực hiện** | 1. Quan sát Control Panel bên phải |
| **Kết quả mong đợi** | - Tiêu đề: "Tàu Đang Chờ Cầu (5)"<br>- Hiển thị đúng 5 card WaitingShipCard |

---

### TC-03-002: Sắp xếp theo ETA tăng dần

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | 3 tàu với ETA: 10/06, 05/06, 15/06 |
| **Bước thực hiện** | 1. Quan sát thứ tự trong waiting list |
| **Kết quả mong đợi** | - Thứ tự: 05/06, 10/06, 15/06<br>- Tàu chưa có ETA xuống cuối danh sách |

---

### TC-03-003: WaitingShipCard hiển thị đúng thông tin

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Component / Manual |
| **Điều kiện tiên quyết** | Tàu "OCEAN STAR" (Container, 1200 TEUs, K12A, 0-180, ETA 05/06 08:00, ETD 07/06 20:00) |
| **Bước thực hiện** | 1. Quan sát card tàu OCEAN STAR |
| **Kết quả mong đợi** | - Thanh màu cam (Container) bên trái<br>- Số thứ tự + tên: "1. OCEAN STAR"<br>- Loại hàng + số lượng: "Container \| 1.200 TEUs"<br>- Bến + vị trí: "K12A \| 0 - 180"<br>- Thời gian: "05/06\|08:00 → 07/06\|20:00"<br>- Nút 🚢 (Cập cầu) và 🗑 (Xóa) hiển thị |

---

### TC-03-004: WaitingShipCard tàu không có ETA/ETD

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Component / Manual |
| **Điều kiện tiên quyết** | Tàu chỉ có tên và LOA, không có ETA/ETD/berthName |
| **Bước thực hiện** | 1. Quan sát card tàu |
| **Kết quả mong đợi** | - Hiển thị "N/A → N/A" cho phần thời gian<br>- Không hiển thị thông tin bến |

---

### TC-03-005: Scroll danh sách khi nhiều tàu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Tạo 15+ tàu trong waiting list |
| **Bước thực hiện** | 1. Scroll trong danh sách tàu chờ |
| **Kết quả mong đợi** | - Danh sách scroll dọc<br>- Tất cả card đều hiển thị được khi scroll |

---

## 2. Cập cầu từ Waiting List (nút Cập cầu 🚢)

### TC-03-006: Cập cầu thành công

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Tàu "SHIP A" có đủ: ETA=05/06 08:00, ETD=07/06 20:00, berthName=K12A, LOA=180 |
| **Bước thực hiện** | 1. Click nút 🚢 trên card "SHIP A" |
| **Kết quả mong đợi** | - Tàu biến mất khỏi waiting list<br>- Tàu xuất hiện trên Planning Grid tại vị trí K12A<br>- Chiều rộng tàu = LOA (180m / 1005m * 100%)<br>- Vị trí dọc tương ứng ETA→ETD<br>- Toast success |

---

### TC-03-007: Cập cầu thất bại - thiếu thông tin

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Tàu "SHIP B" chỉ có tên và LOA, thiếu ETA/ETD/berthName |
| **Bước thực hiện** | 1. Click nút 🚢 trên card "SHIP B" |
| **Kết quả mong đợi** | - Toast error: "Tàu SHIP B chưa đủ thông tin"<br>- Tàu VẪN ở waiting list<br>- Không xuất hiện trên grid |

---

### TC-03-008: Cập cầu thất bại - overlap với tàu trên grid

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Tàu A đang trên grid K12A (0-180m, 05/06-07/06). Tàu B trong waiting list có cùng vị trí & thời gian |
| **Bước thực hiện** | 1. Click nút 🚢 trên card tàu B |
| **Kết quả mong đợi** | - Toast error thông báo overlap<br>- 2 tàu (A trên grid + B trong waiting list) highlight 3 giây<br>- Tàu B KHÔNG được thêm vào grid, vẫn ở waiting list |

---

### TC-03-009: Cập cầu với gap warning

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Tàu A (LOA=180) trên grid K12A ở vị trí 0-180. Tàu B (LOA=150) trong waiting list ở vị trí 185-335 (gap = 5m < 10% * 180 = 18m) |
| **Bước thực hiện** | 1. Click nút 🚢 trên card tàu B |
| **Kết quả mong đợi** | - Tàu B ĐƯỢC thêm vào grid (gap warning không block)<br>- Toast warning hiển thị cảnh báo khoảng cách<br>- Tàu B có viền vàng (ship-gap-warning) |

---

### TC-03-010: Tính vị trí khi cập cầu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Unit / Integration |
| **Điều kiện tiên quyết** | Tàu có: berthName=K12, start=50, LOA=180, ETA, ETD |
| **Bước thực hiện** | 1. Click cập cầu<br>2. Kiểm tra style tàu trên grid |
| **Kết quả mong đợi** | - refStart(K12) = 229<br>- absStart = 229 + 50 = 279<br>- absEnd = 229 + 50 + 180 = 459<br>- style.left = `calc(279/1005*100%)`<br>- style.width = `calc(180/1005*100%)` |

---

## 3. Drag tàu từ Waiting List vào Grid

### TC-03-011: Drag card vào grid thành công

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Có tàu trong waiting list, grid trống |
| **Bước thực hiện** | 1. Drag (kéo) WaitingShipCard từ waiting list<br>2. Thả vào vùng cầu K12 trên Planning Grid |
| **Kết quả mong đợi** | - Tàu biến mất khỏi waiting list<br>- Tàu xuất hiện trên grid tại vị trí thả<br>- Tàu căn giữa theo vị trí chuột (LOA/2 về mỗi bên)<br>- ETA = thời gian tương ứng vị trí Y<br>- ETD = ETA + duration (mặc định 24h nếu chưa có)<br>- Toast success |

---

### TC-03-012: Drag card vào vùng gap (không hợp lệ)

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Có tàu trong waiting list |
| **Bước thực hiện** | 1. Drag card từ waiting list<br>2. Thả vào vùng gap (giữa 2 cầu bến) |
| **Kết quả mong đợi** | - KHÔNG tạo tàu trên grid<br>- Tàu quay về waiting list<br>- Không có hiệu ứng hoặc toast lỗi |

---

### TC-03-013: Drag card - highlight slot khi hover

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Đang drag card từ waiting list |
| **Bước thực hiện** | 1. Kéo card qua các vùng khác nhau trên grid |
| **Kết quả mong đợi** | - Slot NGÀY/ĐÊM dưới con trỏ được highlight<br>- Highlight di chuyển theo con trỏ |

---

### TC-03-014: Drag card xác định berth từ vị trí X

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Đang drag card |
| **Bước thực hiện** | 1. Thả tại các vị trí X khác nhau trên grid:<br>   - Vùng bên trái (K12C)<br>   - Vùng giữa (K12A/K12/K12B)<br>   - Vùng bên phải (TT2) |
| **Kết quả mong đợi** | - Tàu được gán đúng berthName theo vị trí thả<br>- Vị trí start/end tính relative-to-berth chính xác |

---

## 4. Click Card trong Waiting List

### TC-03-015: Click card mở Detail Panel

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Có tàu trong waiting list |
| **Bước thực hiện** | 1. Click vào phần thân của WaitingShipCard (không phải nút) |
| **Kết quả mong đợi** | - Detail Panel mở hiển thị thông tin tàu<br>- Control Panel ẩn đi<br>- Có thể chỉnh sửa thông tin tàu chờ |

---

### TC-03-016: Click nút Cập cầu (không phải click card)

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Tàu đủ thông tin trong waiting list |
| **Bước thực hiện** | 1. Click nút 🚢 (icon mỏ neo) trên card |
| **Kết quả mong đợi** | - Tàu được cập cầu (không mở Detail Panel)<br>- Luồng cập cầu thực hiện (xem TC-03-006) |

---

### TC-03-017: Click nút Xóa (không phải click card)

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Có tàu trong waiting list |
| **Bước thực hiện** | 1. Click nút 🗑 trên card |
| **Kết quả mong đợi** | - ConfirmModal hiện<br>- Confirm → tàu bị xóa<br>- Hủy → tàu không bị xóa |

---

### TC-03-018: Danh sách trống hiển thị đúng

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P4 - Low |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Không có tàu nào trong waiting list |
| **Bước thực hiện** | 1. Quan sát phần Waiting List |
| **Kết quả mong đợi** | - Tiêu đề: "Tàu Đang Chờ Cầu (0)"<br>- Không hiển thị card nào<br>- Có thể hiển thị placeholder "Không có tàu chờ" |

---

## 5. Ma trận Test Coverage

| Tính năng | P1 | P2 | P3 | P4 | Tổng |
|-----------|----|----|----|----|------|
| Hiển thị waiting list | 1 | 2 | 2 | 0 | 5 |
| Cập cầu (nút 🚢) | 3 | 2 | 0 | 0 | 5 |
| Drag & Drop → Grid | 1 | 2 | 1 | 0 | 4 |
| Click card | 0 | 1 | 2 | 0 | 3 |
| Empty state | 0 | 0 | 0 | 1 | 1 |
| **Tổng** | **5** | **7** | **5** | **1** | **18** |
