# TC-01: XÁC THỰC & ĐỔI MẬT KHẨU (Authentication)

> **Module:** Authentication  
> **Tài liệu tham chiếu:** [07-TINH-NANG-KHAC.md](../07-TINH-NANG-KHAC.md) - Mục 1  
> **Tổng số test cases:** 15

---

## 1. Đăng nhập (Password Modal)

### TC-01-001: Đăng nhập với mật khẩu mặc định đúng

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Ứng dụng chưa từng đổi mật khẩu (chưa có key `plannerPassword` trong localStorage) |
| **Bước thực hiện** | 1. Mở ứng dụng (http://localhost:3000)<br>2. Password Modal hiển thị<br>3. Nhập "HoangTT" vào ô mật khẩu<br>4. Click "Vào chương trình" |
| **Kết quả mong đợi** | - Password Modal đóng lại<br>- Giao diện chính hiển thị đầy đủ (Header, Planner, Sidebar)<br>- Không có thông báo lỗi |
| **Dữ liệu test** | Password: `HoangTT` |

---

### TC-01-002: Đăng nhập với mật khẩu sai

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Ứng dụng đang hiển thị Password Modal |
| **Bước thực hiện** | 1. Nhập "wrongpassword" vào ô mật khẩu<br>2. Click "Vào chương trình" |
| **Kết quả mong đợi** | - Hiển thị thông báo lỗi "Mật khẩu không đúng" (hoặc tương tự)<br>- Password Modal vẫn hiển thị, không cho vào app<br>- Ô password được xóa trắng hoặc giữ nguyên |
| **Dữ liệu test** | Password: `wrongpassword` |

---

### TC-01-003: Đăng nhập với mật khẩu rỗng

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Ứng dụng đang hiển thị Password Modal |
| **Bước thực hiện** | 1. Để trống ô mật khẩu<br>2. Click "Vào chương trình" |
| **Kết quả mong đợi** | - Hiển thị thông báo lỗi<br>- Password Modal vẫn hiển thị |
| **Dữ liệu test** | Password: `""` (rỗng) |

---

### TC-01-004: Password Modal hiển thị khi khởi động

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Component / Manual |
| **Điều kiện tiên quyết** | Không có điều kiện đặc biệt |
| **Bước thực hiện** | 1. Mở ứng dụng (hoặc reload trang) |
| **Kết quả mong đợi** | - Password Modal hiển thị ngay lập tức<br>- Có overlay mờ phía sau<br>- Input password có focus<br>- Giao diện chính bị che bởi overlay, không tương tác được |

---

### TC-01-005: Password Modal luôn hiển thị khi reload

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Đã đăng nhập thành công |
| **Bước thực hiện** | 1. Đăng nhập thành công<br>2. Thực hiện một vài thao tác (tạo tàu, kéo thả...)<br>3. Nhấn F5 hoặc reload trang |
| **Kết quả mong đợi** | - Password Modal hiển thị lại (không có session persist)<br>- Phải nhập lại mật khẩu để vào app<br>- Dữ liệu trước đó vẫn còn sau khi đăng nhập lại (từ localStorage) |

---

### TC-01-006: Đăng nhập với mật khẩu đã thay đổi

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Đã đổi mật khẩu thành "NewPass123" trước đó |
| **Bước thực hiện** | 1. Reload trang<br>2. Nhập "NewPass123" vào ô mật khẩu<br>3. Click "Vào chương trình" |
| **Kết quả mong đợi** | - Đăng nhập thành công<br>- Giao diện chính hiển thị |
| **Dữ liệu test** | Password: `NewPass123` |

---

### TC-01-007: Mật khẩu mặc định không hoạt động sau khi đổi

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Đã đổi mật khẩu thành "NewPass123" |
| **Bước thực hiện** | 1. Reload trang<br>2. Nhập "HoangTT" (mật khẩu mặc định cũ)<br>3. Click "Vào chương trình" |
| **Kết quả mong đợi** | - Hiển thị thông báo lỗi, không cho đăng nhập<br>- Phải dùng mật khẩu mới |
| **Dữ liệu test** | Password: `HoangTT` |

---

## 2. Đổi mật khẩu (Change Password Modal)

### TC-01-008: Mở modal đổi mật khẩu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Đã đăng nhập thành công |
| **Bước thực hiện** | 1. Click nút ⚙ (Menu) trên Header<br>2. Click "Đổi Mật khẩu" |
| **Kết quả mong đợi** | - ChangePasswordModal hiển thị<br>- Có 3 trường: Mật khẩu cũ, Mật khẩu mới, Xác nhận mật khẩu mới<br>- Có nút Hủy và Xác nhận<br>- Menu dropdown tự đóng |

---

### TC-01-009: Đổi mật khẩu thành công

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Modal đổi mật khẩu đang mở, mật khẩu hiện tại là "HoangTT" |
| **Bước thực hiện** | 1. Nhập "HoangTT" vào ô "Mật khẩu cũ"<br>2. Nhập "NewPass123" vào ô "Mật khẩu mới"<br>3. Nhập "NewPass123" vào ô "Xác nhận mật khẩu mới"<br>4. Click "Xác nhận" |
| **Kết quả mong đợi** | - Modal đóng lại<br>- Toast success hiển thị<br>- localStorage key `plannerPassword` = "NewPass123"<br>- Đăng nhập lần sau dùng mật khẩu mới |
| **Dữ liệu test** | Old: `HoangTT`, New: `NewPass123` |

---

### TC-01-010: Đổi mật khẩu - Sai mật khẩu cũ

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P1 - Critical |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Modal đổi mật khẩu đang mở |
| **Bước thực hiện** | 1. Nhập "WrongOldPass" vào ô "Mật khẩu cũ"<br>2. Nhập "NewPass" vào ô "Mật khẩu mới"<br>3. Nhập "NewPass" vào ô "Xác nhận"<br>4. Click "Xác nhận" |
| **Kết quả mong đợi** | - Hiển thị thông báo lỗi "Mật khẩu cũ không đúng"<br>- Mật khẩu KHÔNG bị thay đổi<br>- Modal vẫn mở |

---

### TC-01-011: Đổi mật khẩu - Xác nhận không khớp

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Modal đổi mật khẩu đang mở |
| **Bước thực hiện** | 1. Nhập mật khẩu cũ đúng<br>2. Nhập "NewPass1" vào ô "Mật khẩu mới"<br>3. Nhập "NewPass2" vào ô "Xác nhận" (khác mật khẩu mới)<br>4. Click "Xác nhận" |
| **Kết quả mong đợi** | - Hiển thị thông báo lỗi "Mật khẩu xác nhận không khớp"<br>- Mật khẩu KHÔNG bị thay đổi |

---

### TC-01-012: Đổi mật khẩu - Mật khẩu mới rỗng

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P2 - High |
| **Loại test** | Integration / Manual |
| **Điều kiện tiên quyết** | Modal đổi mật khẩu đang mở |
| **Bước thực hiện** | 1. Nhập mật khẩu cũ đúng<br>2. Để trống ô "Mật khẩu mới"<br>3. Để trống ô "Xác nhận"<br>4. Click "Xác nhận" |
| **Kết quả mong đợi** | - Hiển thị thông báo lỗi "Mật khẩu mới không được trắng"<br>- Mật khẩu KHÔNG bị thay đổi |

---

### TC-01-013: Hủy đổi mật khẩu

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Modal đổi mật khẩu đang mở |
| **Bước thực hiện** | 1. Nhập một số thông tin vào các ô<br>2. Click nút "Hủy" |
| **Kết quả mong đợi** | - Modal đóng lại<br>- Mật khẩu KHÔNG bị thay đổi<br>- Quay về giao diện chính bình thường |

---

### TC-01-014: Mật khẩu mặc định khôi phục khi xóa localStorage

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P3 - Medium |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Đã đổi mật khẩu thành "NewPass123" |
| **Bước thực hiện** | 1. Mở DevTools → Application → localStorage<br>2. Xóa key `plannerPassword`<br>3. Reload trang<br>4. Nhập "HoangTT" |
| **Kết quả mong đợi** | - Đăng nhập thành công với mật khẩu mặc định "HoangTT" |

---

### TC-01-015: Password Modal có hiển thị mật khẩu hiện tại

| Thuộc tính | Giá trị |
|-----------|---------|
| **Mức ưu tiên** | P4 - Low |
| **Loại test** | Manual |
| **Điều kiện tiên quyết** | Không có |
| **Bước thực hiện** | 1. Mở ứng dụng<br>2. Quan sát Password Modal |
| **Kết quả mong đợi** | - Modal hiển thị mật khẩu hiện tại dạng italic, màu xám (gợi ý)<br>- Giúp người dùng biết mật khẩu khi quên |

---

## 3. Ma trận Test Coverage

| Tính năng | P1 | P2 | P3 | P4 | Tổng |
|-----------|----|----|----|----|------|
| Đăng nhập đúng/sai | 3 | 2 | 0 | 0 | 5 |
| Session (không persist) | 0 | 1 | 0 | 0 | 1 |
| Đăng nhập sau đổi mật khẩu | 1 | 1 | 0 | 0 | 2 |
| Đổi mật khẩu thành công | 1 | 0 | 0 | 0 | 1 |
| Đổi mật khẩu - validation | 1 | 2 | 0 | 0 | 3 |
| UI/UX modal | 0 | 1 | 2 | 1 | 4 |
| **Tổng** | **6** | **7** | **2** | **1** | **15** |
