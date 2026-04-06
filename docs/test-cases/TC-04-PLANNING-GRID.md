# TC-04: PLANNING GRID & DRAG-DROP

> **Module:** Planning Grid, Ship Drag & Drop, Ship Rendering  
> **Tài liệu tham chiếu:** [05-PLANNER-GRID.md](../05-PLANNER-GRID.md), [03-GIAO-DIEN-TONG-THE.md](../03-GIAO-DIEN-TONG-THE.md)  
> **Tổng số test cases:** 25

---

## 1. Hiển thị Grid

### TC-04-001: Grid hiển thị đúng số ngày

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Component / Manual |
| **Điều kiện tiên quyết** | startDate = 01/06/2025, numDays = 7 |
| **Bước thực hiện** | 1. Quan sát Timeline (trục Y bên trái) |
| **Kết quả mong đợi** | - Hiển thị 7 ngày từ 01/06 đến 07/06<br>- Mỗi ngày = 2 slot (NGÀY + ĐÊM)<br>- Tổng 14 slot<br>- Mỗi slot cao 30px → tổng grid cao 420px |

---

### TC-04-002: Timeline hiển thị thứ và ngày đúng

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | startDate = Thứ 2 (02/06/2025) |
| **Bước thực hiện** | 1. Quan sát cột Timeline bên trái |
| **Kết quả mong đợi** | - Ngày đầu: "T2 02/06 NGÀY / ĐÊM"<br>- Ngày tiếp: "T3 03/06 NGÀY / ĐÊM"<br>- Chủ nhật hiển thị "CN" |

---

### TC-04-003: Berth Header hiển thị đúng 5 cầu bến

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Component / Manual |
| **Điều kiện tiên quyết** | Ứng dụng đã load |
| **Bước thực hiện** | 1. Quan sát Berth Header phía trên grid |
| **Kết quả mong đợi** | - Hiển thị 5 cầu: K12C (189m), K12A (132m), K12 (188m), K12B (204m), TT2 (222m)<br>- Chiều rộng tỷ lệ với chiều dài thực<br>- Gap giữa các cầu hiển thị border dashed |

---

### TC-04-004: Thay đổi startDate qua nút ◀/▶

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | startDate = 05/06/2025 |
| **Bước thực hiện** | 1. Click nút ◀ (giảm ngày)<br>2. Kiểm tra ngày bắt đầu<br>3. Click nút ▶ (tăng ngày) 2 lần |
| **Kết quả mong đợi** | - Bước 1: startDate = 04/06/2025<br>- Bước 3: startDate = 06/06/2025<br>- Grid re-render với ngày mới<br>- Tàu trên grid cập nhật vị trí Y |

---

### TC-04-005: Thay đổi numDays qua dropdown

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Ứng dụng đã load, numDays = 7 |
| **Bước thực hiện** | 1. Mở dropdown số ngày<br>2. Chọn "30" |
| **Kết quả mong đợi** | - Grid hiển thị 30 ngày (60 slot)<br>- Grid cao hơn, có thể scroll dọc<br>- Options hợp lệ: 1, 7, 10, 15, 30, 35, 40, 45, 60 |

---

### TC-04-006: Pitch Ruler hiển thị đúng mốc mét

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Component / Manual |
| **Điều kiện tiên quyết** | Ứng dụng đã load |
| **Bước thực hiện** | 1. Quan sát Pitch Ruler dưới Berth Header |
| **Kết quả mong đợi** | - K12C: 8 pitch (0, 24, 53, 79, 108, 134, 168, 187)<br>- K12A: 6 pitch (7, 34, 54, 78, 98, 125)<br>- K12: 6 pitch (148, 173, 202, 232, 261, 291)<br>- K12B: 9 pitch (320, 339, ... 522)<br>- TT2: 14 pitch (0, 12, ... 222)<br>- Pitch B1 (-40) và B2 (245) hiển thị màu đỏ |

---

## 2. Hiển thị tàu trên Grid

### TC-04-007: Tàu render đúng vị trí và kích thước

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Tàu A: K12A, start=0, end=180, ETA=05/06 08:00, ETD=07/06 20:00 |
| **Bước thực hiện** | 1. Quan sát tàu A trên grid |
| **Kết quả mong đợi** | - Vị trí ngang: absStart=229, left=calc(229/1005*100%)<br>- Chiều rộng: width=calc(180/1005*100%)<br>- Vị trí dọc: top tính từ slot ETA<br>- Chiều cao: tương ứng duration (2.5 ngày = 5 slot = 150px) |

---

### TC-04-008: Tàu hiển thị đúng nội dung

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Component / Manual |
| **Điều kiện tiên quyết** | Tàu "VINALINES STAR" (Container, mạn trái) trên grid |
| **Bước thực hiện** | 1. Quan sát nội dung bên trong tàu |
| **Kết quả mong đợi** | - Tên tàu + loại hàng hiển thị<br>- Thời gian ETA → ETD hiển thị<br>- Mũi tàu hướng sang trái (mạn trái)<br>- Cabin ở bên phải<br>- Vị trí (mét) ở 2 đầu tàu |

---

### TC-04-009: Màu sắc tàu theo loại hàng

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | 3 tàu trên grid: Container, Sắt thép, Hàng khác |
| **Bước thực hiện** | 1. Quan sát màu nền của 3 tàu |
| **Kết quả mong đợi** | - Container: Cam (ship-fill-container)<br>- Sắt thép: Xanh lá (ship-fill-steel)<br>- Hàng khác: Xanh dương (ship-fill-other) |

---

### TC-04-010: Mạn cập (trái/phải) hiển thị đúng hướng mũi tàu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Tàu A mạn trái, Tàu B mạn phải |
| **Bước thực hiện** | 1. So sánh hướng mũi 2 tàu |
| **Kết quả mong đợi** | - Tàu A: mũi (tam giác) bên trái, cabin bên phải<br>- Tàu B: mũi bên phải, cabin bên trái |

---

### TC-04-011: Font size tự động theo LOA

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Các tàu có LOA: 50m, 80m, 100m, 150m |
| **Bước thực hiện** | 1. So sánh font size của text trong các tàu |
| **Kết quả mong đợi** | - LOA 50m: font ~10px<br>- LOA 80m: font ~12px<br>- LOA 100m: font ~13px<br>- LOA 150m: font ~15px |

---

### TC-04-012: Chiều cao tối thiểu tàu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Integration |
| **Điều kiện tiên quyết** | Tàu có duration rất ngắn (2 giờ = < 1 slot = < 30px) |
| **Bước thực hiện** | 1. Quan sát tàu trên grid |
| **Kết quả mong đợi** | - Chiều cao tàu ≥ 48px (MIN_SHIP_HEIGHT)<br>- Nội dung text vẫn đọc được |

---

## 3. Tooltip tàu

### TC-04-013: Tooltip hiển thị khi hover

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Có tàu trên grid |
| **Bước thực hiện** | 1. Hover chuột vào tàu trên grid |
| **Kết quả mong đợi** | - Tooltip hiển thị bên cạnh tàu<br>- Nội dung: Tên tàu, DWT, LOA, loại hàng, ETA/ETD, Duration, Bến + vị trí<br>- Tooltip render bằng Portal (không bị clip bởi overflow) |

---

### TC-04-014: Tooltip tự ẩn sau 5 giây

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P4 - Low |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Tooltip đang hiển thị |
| **Bước thực hiện** | 1. Hover vào tàu → tooltip hiện<br>2. Di chuột ra ngoài nhưng không tương tác<br>3. Chờ 5 giây |
| **Kết quả mong đợi** | - Tooltip tự ẩn sau 5 giây |

---

### TC-04-015: Tooltip follow chuột khi drag

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Đang drag tàu trên grid |
| **Bước thực hiện** | 1. MouseDown trên tàu<br>2. Di chuyển chuột |
| **Kết quả mong đợi** | - Tooltip cập nhật vị trí theo chuột (offset 15px)<br>- Tooltip hiển thị thông tin vị trí mới realtime |

---

## 4. Drag tàu trong Grid

### TC-04-016: Di chuyển tàu ngang (thay đổi vị trí mét)

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Tàu A trên grid K12A, không có tàu khác |
| **Bước thực hiện** | 1. MouseDown trên tàu A<br>2. Kéo sang phải (vào vùng K12)<br>3. MouseUp |
| **Kết quả mong đợi** | - Tàu A di chuyển sang vị trí mới<br>- berthName thay đổi (nếu sang cầu khác)<br>- start/end tính lại relative-to-berth<br>- Snap theo chiều dọc (vào slot 12h) |

---

### TC-04-017: Di chuyển tàu dọc (thay đổi thời gian)

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Tàu A trên grid |
| **Bước thực hiện** | 1. MouseDown trên tàu A<br>2. Kéo xuống dưới 2-3 slot<br>3. MouseUp |
| **Kết quả mong đợi** | - Tàu A di chuyển xuống vị trí mới<br>- ETA/ETD được cập nhật (+N slot * 12h)<br>- Tàu snap vào mốc slot (NGÀY/ĐÊM)<br>- Duration (ETD - ETA) giữ nguyên |

---

### TC-04-018: Snap to slot khi kết thúc drag

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Tàu trên grid |
| **Bước thực hiện** | 1. Drag tàu xuống vị trí giữa 2 slot<br>2. MouseUp |
| **Kết quả mong đợi** | - Tàu snap vào slot gần nhất (Math.round)<br>- Vị trí top = snappedSlot * 30px<br>- ETA/ETD chính xác theo mốc 12h |

---

### TC-04-019: Rollback khi overlap detected

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | 2 tàu trên grid cùng cầu bến |
| **Bước thực hiện** | 1. Drag tàu A đè lên tàu B<br>2. MouseUp |
| **Kết quả mong đợi** | - Tàu A rollback về vị trí ban đầu<br>- Visual feedback: viền đỏ khi đang drag qua vùng overlap<br>- ETA/ETD khôi phục giá trị cũ |

---

### TC-04-020: Click tàu (không drag) → Select

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Tàu trên grid |
| **Bước thực hiện** | 1. Click (mouseDown + mouseUp tại cùng vị trí) vào tàu |
| **Kết quả mong đợi** | - Tàu được chọn (selected)<br>- Detail Panel mở<br>- KHÔNG di chuyển tàu (hasMoved = false) |

---

### TC-04-021: Nút CHỜ và RỜI hiển thị khi hover

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Tàu trên grid |
| **Bước thực hiện** | 1. Hover chuột vào tàu trên grid |
| **Kết quả mong đợi** | - Nút "CHỜ" và "RỜI" hiện ra trên tàu<br>- Nút ẩn khi di chuột ra ngoài |

---

## 5. Xác định Berth chính

### TC-04-022: Tàu nằm trên ranh giới 2 cầu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Unit / Integration |
| **Điều kiện tiên quyết** | Tàu LOA=60, đặt ở ranh giới K12A/K12 (340m-400m tuyệt đối) |
| **Bước thực hiện** | 1. Drag tàu nằm vắt ngang ranh giới<br>2. Kiểm tra berthName |
| **Kết quả mong đợi** | - K12A (229-361): overlap = 361-340 = 21m<br>- K12 (361-549): overlap = 400-361 = 39m<br>- Berth chính = K12 (overlap lớn hơn) |

---

### TC-04-023: Tàu nằm hoàn toàn trong 1 cầu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Unit |
| **Điều kiện tiên quyết** | Tàu ở giữa cầu K12C |
| **Bước thực hiện** | 1. Kiểm tra determinePrimaryBerth |
| **Kết quả mong đợi** | - berthName = "K12C"<br>- Không ambiguity |

---

## 6. Highlight & Active State

### TC-04-024: Berth highlight khi drag tàu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Đang drag tàu |
| **Bước thực hiện** | 1. Drag tàu qua các cầu khác nhau |
| **Kết quả mong đợi** | - Cầu bến dưới tàu có class "berth-active"<br>- Highlight di chuyển theo cầu tàu đang ở |

---

### TC-04-025: Click vùng trống deselect tàu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Đang chọn 1 tàu trên grid |
| **Bước thực hiện** | 1. Click vào vùng nước trống trên grid |
| **Kết quả mong đợi** | - selectedShip = null<br>- activeBerth = null<br>- activeDayIndex = null<br>- Detail Panel đóng |

---

## 7. Ma trận Test Coverage

| Tính năng | P1 | P2 | P3 | P4 | Tổng |
|-----------|----|----|----|----|------|
| Hiển thị grid | 2 | 3 | 0 | 0 | 5 |
| Hiển thị tàu | 1 | 2 | 3 | 0 | 6 |
| Tooltip | 0 | 1 | 1 | 1 | 3 |
| Drag trong grid | 3 | 2 | 0 | 0 | 5 |
| Berth detection | 0 | 1 | 1 | 0 | 2 |
| Highlight/Active | 0 | 2 | 1 | 0 | 3 |
| Click behaviors | 0 | 0 | 0 | 0 | 1 |
| **Tổng** | **6** | **11** | **6** | **1** | **25** |
