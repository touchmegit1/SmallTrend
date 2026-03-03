# Quy Ước Commit Convention

Hướng dẫn viết commit message đơn giản và dễ hiểu cho dự án SmallTrend.

## 📋 Định Dạng Commit Message

```
<type>: <subject>
```

## 🏷️ Các Loại Commit (Type)

| Type | Mô tả | Ví dụ |
|------|-------|-------|
| **feat** | Thêm tính năng mới | `feat: add login page` |
| **fix** | Sửa lỗi | `fix: fix null pointer exception in user service` |
| **docs** | Cập nhật tài liệu | `docs: update README` |
| **style** | Định dạng code (space, semicolon, v.v.) | `style: format code with prettier` |
| **refactor** | Tái cấu trúc code | `refactor: simplify authentication logic` |
| **test** | Thêm hoặc sửa test | `test: add unit tests for payment service` |
| **chore** | Cập nhật build, dependencies | `chore: update dependencies` |
| **ci** | Cập nhật CI/CD config | `ci: add GitHub actions workflow` |

## 📝 Chi Tiết Viết Commit

### Subject (Dòng tiêu đề)
- ✅ Bắt đầu với loại commit (type)
- ✅ Sử dụng **imperative mood** (mệnh lệnh): "add", "fix", "update" (không phải "added", "fixed")
- ✅ **Không viết hoa** chữ cái đầu sau dấu hai chấm
- ✅ **Không có dấu chấm** ở cuối
- ✅ Tối đa **50 ký tự**

**Tốt:**
```
feat: add user authentication
```

**Không tốt:**
```
Add user authentication
Fixed login timeout
feat: Add user authentication.
```

**Ví dụ:**
```
feat: add email verification feature
```

## 💡 Ví Dụ Thực Tế

### Ví dụ 1: Thêm tính năng
```
feat: add product filter by category and price range
```

### Ví dụ 2: Sửa lỗi
```
fix: fix calculation error in total price
```

### Ví dụ 3: Cập nhật tài liệu
```
docs: update API documentation for user endpoints
```

### Ví dụ 4: Sửa định dạng code
```
style: format code with Prettier
```

### Ví dụ 5: Cập nhật dependencies
```
chore: update Spring Boot to 3.0.0
```

## ✅ Checklist Trước Khi Commit

- [ ] Loại commit (type) có đúng không?
- [ ] Subject rõ ràng, ngắn gọn (≤50 ký tự)?
- [ ] Sử dụng imperative mood (add, fix, update)?
- [ ] Không có dấu chấm ở cuối Subject?
- [ ] Body có giải thích được lý do thay đổi không?
- [ ] Code đã test xong chưa?
- [ ] Không commit vào branch `main` trực tiếp?

## 🚀 Git Tips

### Commit một file cụ thể
```bash
git add <file_name>
git commit -m "type: message"
```

### Sửa commit cuối cùng
```bash
git commit --amend -m "type: new message"
```

### Xem lịch sử commit
```bash
git log --oneline
```

## 📌 Quy Tắc Nhánh

- `main` - Production (không commit trực tiếp)
- `Dev` - Development (branch chính để phát triển)

**Quy trình:**
1. Tạo branch từ `Dev`: `git checkout -b feature/feature-name`
2. Commit thay đổi với convention
3. Push lên repository
4. Tạo Pull Request để review

## ❓ Câu Hỏi Thường Gặp

**Q: Tôi quên viết commit convention, phải làm sao?**
A: Dùng `git commit --amend` để sửa lại commit cuối.

**Q: Nên commit thường xuyên không?**
A: Vâng, commit khi hoàn thành 1 tính năng nhỏ hoặc sửa 1 lỗi.

**Q: Subject và Body khác nhau như thế nào?**
A: Subject là tiêu đề ngắn (≤50 ký tự), Body là chi tiết lý do thay đổi.

---

**Lưu ý:** Tuân thủ convention này giúp codebase dễ theo dõi, dễ review code, và dễ tìm lỗi trong lịch sử commit! 🎯
