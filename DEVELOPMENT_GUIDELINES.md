# SmallTrend Development Guidelines - Hướng dẫn phát triển dự án 

## 📋 Tổng quan dự án

SmallTrend là hệ thống quản lý cửa hàng tạp hóa với các chức năng:
- Quản lý người dùng và phân quyền  
- Quản lý sản phẩm và kho hàng
- Quản lý bán hàng và khách hàng
- Báo cáo và phân tích

## 🎯 Quy tắc và nguyên tắc phát triển

### 1. Nguyên tắc chung
- **Bảo tồn và phát triển**: Luôn giữ lại code cũ đang hoạt động, chỉ mở rộng thêm tính năng mới
- **Validation tập trung**: Gộp tất cả validation liên quan vào một file duy nhất
- **Error handling rõ ràng**: Luôn hiển thị lỗi cụ thể cho người dùng
- **Security first**: Chỉ admin mới được tạo tài khoản nhân viên, không có đăng ký tự do

### 2. Cấu trúc dự án đã được tối ưu

```
backend/
├── src/main/java/com/smalltrend/
│   ├── controller/          # Chỉ giữ AuthController và UserController  
│   ├── validation/          # Validator tập trung
│   ├── entity/             # JPA Entities
│   ├── service/            # Business logic
│   ├── repository/         # Data access
│   └── config/             # Configuration
└── src/main/resources/
    ├── application.properties  # Cấu hình database
    └── data.sql               # Dữ liệu mẫu

frontend/
├── src/
│   ├── components/         # UI components
│   ├── pages/             # Trang web
│   ├── services/          # API calls  
│   └── context/           # State management
```

## 🔧 Quy trình phát triển từng bước

### Bước 1: Thiết lập môi trường 

#### 1.1 Chuẩn bị database
```sql
-- Tạo database
CREATE DATABASE smalltrend;
USE smalltrend;
```

#### 1.2 Cấu hình application.properties
```properties
# Database connection
spring.datasource.url=jdbc:mysql://localhost:3306/smalltrend?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC&createDatabaseIfNotExist=true
spring.datasource.username=root  
spring.datasource.password=123456

# JPA Configuration
spring.jpa.hibernate.ddl-auto=create
spring.jpa.defer-datasource-initialization=true
spring.sql.init.mode=always
```

#### 1.3 Chạy ứng dụng
```bash
cd backend
mvn spring-boot:run
```

### Bước 2: Tạo chức năng mới theo mẫu

#### 2.1 Tạo Entity 
```java
@Entity
@Table(name = "ten_bang")
@Data
@NoArgsConstructor  
@AllArgsConstructor
public class TenEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    // Các field khác...
}
```

#### 2.2 Tạo Repository
```java
@Repository
public interface TenRepository extends JpaRepository<TenEntity, Integer> {
    // Custom queries nếu cần
}
```

#### 2.3 Tạo Validation trong file tập trung
```java
// Thêm vào UserManagementValidator.java hoặc tạo validator mới tương tự
public List<String> validateTenChucNang(String field1, String field2) {
    List<String> errors = new ArrayList<>();
    
    if (field1 == null || field1.trim().isEmpty()) {
        errors.add("Field 1 không được để trống");
    }
    
    // Thêm validation khác...
    return errors;
}
```

#### 2.4 Tạo Service 
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class TenService {
    
    private final TenRepository repository;
    private final TenValidator validator;
    
    public TenEntity create(TenDTO dto) {
        // Validate
        List<String> errors = validator.validateTenChucNang(dto.getField1(), dto.getField2());
        if (validator.hasErrors(errors)) {
            throw new RuntimeException(validator.errorsToString(errors));
        }
        
        // Business logic
        TenEntity entity = new TenEntity();
        // Map DTO to Entity
        
        return repository.save(entity);
    }
}
```

#### 2.5 Tạo Controller
```java
@Slf4j
@RestController
@RequestMapping("/api/ten-chuc-nang")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')") // Hoặc role phù hợp
public class TenController {
    
    private final TenService service;
    private final TenValidator validator;
    
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody TenDTO dto) {
        try {
            TenEntity result = service.create(dto);
            log.info("Created successfully: {}", result.getId());
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            log.error("Creation failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }
}
```

### Bước 3: Frontend Development

#### 3.1 Tạo Service API
```javascript
// src/services/tenService.js
import api from '../config/axiosConfig';

const create = async (data) => {
    try {
        const response = await api.post('/ten-chuc-nang', data);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Có lỗi xảy ra';
        throw new Error(errorMessage);
    }
};

export default { create };
```

#### 3.2 Tạo Component React
```jsx
// src/components/TenComponent.jsx
import React, { useState } from 'react';

const TenComponent = () => {
    const [formData, setFormData] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            await tenService.create(formData);
            // Success handling
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
            {/* Form fields */}
        </form>
    );
};
```

## 🔒 Security và Phân quyền

### 1. Roles trong hệ thống
- **ADMIN**: Toàn quyền, có thể tạo tài khoản nhân viên
- **MANAGER**: Quản lý cửa hàng, báo cáo  
- **CASHIER**: Bán hàng
- **INVENTORY_STAFF**: Quản lý kho
- **SALES_STAFF**: Bán hàng và khách hàng

### 2. Authentication Flow
1. Chỉ admin mới có thể tạo tài khoản nhân viên
2. Không có chức năng đăng ký tự do
3. Token JWT có thời hạn 24h
4. Validate token trên mọi request cần authentication  

### 3. Error Messages chuẩn hóa
- Tiếng Việt, rõ ràng, cụ thể
- Hiển thị trên frontend ít nhất 10 giây  
- Có nút đóng thủ công
- Log chi tiết trên server

## 📊 Database Guidelines

### 1. Naming Convention
- Bảng: snake_case (users, product_variants)
- Cột: snake_case (full_name, created_at) 
- Foreign key: table_id (user_id, role_id)

### 2. Schema tối ưu 
- Luôn có created_at, updated_at cho bảng chính
- Soft delete thay vì hard delete
- Index cho các cột tìm kiếm thường xuyên
- Foreign key constraints

### 3. Sample Data
- File data.sql chứa dữ liệu mẫu cơ bản
- Mật khẩu mặc định: "password123" (đã hash BCrypt)  
- Accounts mẫu: admin/admin, manager/manager, etc.

## 🧪 Testing Guidelines

### 1. Unit Tests
```java
@Test
void testValidation() {
    List<String> errors = validator.validateUser("", "", "", "", "");
    assertFalse(errors.isEmpty());
    assertTrue(errors.contains("Họ tên không được để trống"));
}
```

### 2. Integration Tests 
```java
@SpringBootTest
@Transactional
class TenControllerIntegrationTest {
    
    @Test
    void testCreateAPI() {
        // Test API endpoints
    }
}
```

## 🚀 Deployment

### 1. Production Build
```bash
# Backend
cd backend  
mvn clean package -DskipTests

# Frontend
cd frontend
npm run build
```

### 2. Environment Variables
```properties
# Production
DB_URL=jdbc:mysql://production-host:3306/smalltrend
DB_USERNAME=${DB_USER}
DB_PASSWORD=${DB_PASS}
JWT_SECRET=${JWT_SECRET_KEY}
```

## 📚 Best Practices

### 1. Code Style
- Sử dụng Lombok để giảm boilerplate code
- Logging với SLF4J: log.info(), log.error()
- JavaDoc cho public methods
- Comments bằng tiếng Việt cho business logic

### 2. Performance 
- Pagination cho danh sách dài
- Lazy loading cho relationships
- Cache cho dữ liệu ít thay đổi
- Index database phù hợp

### 3. Security
- Validate input ở cả frontend và backend
- Sanitize user input
- Use PreparedStatement (JPA tự động)
- Rate limiting cho API

### 4. Error Handling
- Try-catch mọi nơi có thể xảy ra lỗi
- Log chi tiết lỗi cho debug
- Trả về message thân thiện cho user
- Rollback transaction khi cần

## 🔄 Git Workflow

### 1. Branch Strategy
```bash
main -> production ready code
develop -> integration branch  
feature/ten-feature -> new features
hotfix/ten-loi -> urgent fixes
```

### 2. Commit Messages
```
feat: thêm chức năng quản lý sản phẩm
fix: sửa lỗi validation user
refactor: tối ưu UserController
docs: cập nhật hướng dẫn API
```

### 3. Code Review Checklist
- [ ] Code style consistent
- [ ] Validation đầy đủ
- [ ] Error handling proper
- [ ] Security considerations
- [ ] Performance implications  
- [ ] Tests written/updated

## 🆘 Troubleshooting

### 1. Database Issues
```sql
-- Reset auto increment nếu conflict
ALTER TABLE users AUTO_INCREMENT = 1;

-- Check constraints
SHOW CREATE TABLE users;
```

### 2. Spring Boot Issues  
```bash
# Clean build
mvn clean compile

# Check ports
netstat -ano | findstr :8081
```

### 3. Frontend Issues
```bash
# Clear cache
npm start -- --reset-cache

# Check build
npm run build
```

## 📞 Support và Documentation

### 1. API Documentation
- Swagger UI: http://localhost:8081/swagger-ui.html
- Postman collection trong docs/

### 2. Database Schema
- ERD diagram trong docs/erd.png
- Migration scripts trong src/main/resources/

### 3. Team Communication
- Slack channel: #smalltrend-dev
- Weekly standup: thứ 2 9AM
- Code review: required trước merge

---

**Lưu ý quan trọng:** 
- Luôn test trước khi commit
- Backup database trước khi thay đổi schema
- Giao tiếp khi có thắc mắc  
- Document các thay đổi lớn

**Liên hệ hỗ trợ:**
- Lead Developer: [contact]
- Database Admin: [contact]  
- DevOps: [contact]