# HỆ THỐNG QUẢN LÝ CẦU BẾN (Berth Planning System)

## Tổng Quan

Hệ thống Quản Lý Cầu Bến là ứng dụng web dùng để lập kế hoạch xếp tàu tại các cầu bến cảng. Hệ thống cho phép:
- Quản lý danh sách tàu chờ cầu và tàu đã cập cầu
- Hiển thị trực quan vị trí tàu trên lưới thời gian (timeline grid)
- Kéo thả (drag-drop) để xếp lịch tàu
- Phát hiện và cảnh báo chồng lấn giữa các tàu
- Import/Export kế hoạch (JSON, Excel, PDF)
- Tính toán hệ số sử dụng cầu bến
- Xuất báo cáo chi tiết

---

## Cấu Trúc Cầu Bến

Hệ thống quản lý **5 cầu bến** với tổng chiều dài **1005 mét**:

| Bến | Chiều dài | Vị trí bắt đầu (m) | Vị trí kết thúc (m) |
|-----|-----------|-------------------|---------------------|
| K12C | 189m | 10 | 199 |
| Gap | 30m | 199 | 229 |
| K12A | 132m | 229 | 361 |
| K12 | 188m | 361 | 549 |
| K12B | 204m | 549 | 753 |
| Gap | 20m | 753 | 773 |
| TT2 | 222m | 773 | 995 |
| Gap | 10m | 995 | 1005 |

> **Lưu ý**: K12A, K12 và K12B dùng chung hệ quy chiếu (refStart = 229m), cho phép tàu dài nằm trải qua nhiều bến.

---

## Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
|------------|-----------|
| Framework | React 18.x |
| Language | JavaScript (ES6+) |
| Styling | Vanilla CSS |
| Build tool | Create React App |
| Excel handling | xlsx (SheetJS) |
| PDF export | jsPDF + html2canvas |
| Testing | Jest + React Testing Library |

### Dependencies chính
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "xlsx": "^0.18.5",
  "jspdf": "^3.0.3",
  "html2canvas": "^1.4.1"
}
```

---

## Danh Sách File Tài Liệu

| File | Mô tả |
|------|-------|
| [01_GIAO_DIEN.md](./01_GIAO_DIEN.md) | Mô tả chi tiết giao diện chương trình |
| [02_WORKFLOW.md](./02_WORKFLOW.md) | Workflow của từng chức năng |
| [03_DATA_MODEL.md](./03_DATA_MODEL.md) | Cấu trúc dữ liệu và state management |
| [04_COMPONENTS.md](./04_COMPONENTS.md) | Chi tiết các component React |
| [05_LOGIC.md](./05_LOGIC.md) | Logic xử lý (không công thức) |
| [06_IMPORT_EXPORT.md](./06_IMPORT_EXPORT.md) | Chức năng Import/Export |

---

## Sơ Đồ Kiến Trúc Tổng Quan

```
┌─────────────────────────────────────────────────────────────┐
│                        App.js (Main State)                   │
│  - berthedShips, waitingShips                                │
│  - startDate, numDays                                        │
│  - selectedShip, highlightedShips                           │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│    Header     │   │  BerthPlanner   │   │   Right Panel   │
│ - Date picker │   │ - BerthHeader   │   │ - ControlPanel  │
│ - Day select  │   │ - PitchRuler    │   │   (add ship)    │
│ - Menu        │   │ - PlanningGrid  │   │ - DetailPanel   │
└───────────────┘   │   - BerthedShip │   │   (edit ship)   │
                    └─────────────────┘   └─────────────────┘
```

---

## Mục Đích Tài Liệu

Bộ tài liệu này được tạo ra với mục đích:

1. **Tái tạo hệ thống** với công nghệ hiện đại hơn
2. **Giữ nguyên workflow và GUI** cơ bản
3. **Cho phép thay đổi công thức tính toán** tùy module
4. **Dễ dàng chuyển giao** cho developer khác

---

## Cách Sử Dụng Tài Liệu

1. Đọc **01_GIAO_DIEN.md** để hiểu layout và các thành phần UI
2. Đọc **02_WORKFLOW.md** để nắm luồng xử lý từng chức năng
3. Đọc **03_DATA_MODEL.md** để hiểu cấu trúc dữ liệu
4. Đọc **04_COMPONENTS.md** để biết chi tiết component
5. Đọc **05_LOGIC.md** để hiểu business logic
6. Đọc **06_IMPORT_EXPORT.md** cho phần import/export

---

*© Nguyen Hoang & Ban Khai thac | Trung tam DHKT KV TAN THUAN*
