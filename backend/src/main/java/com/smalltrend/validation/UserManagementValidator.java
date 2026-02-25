package com.smalltrend.validation;

import org.springframework.stereotype.Component;
import java.util.regex.Pattern;
import java.util.List;
import java.util.ArrayList;

/**
 * UserManagementValidator - Tập hợp tất cả validation rules cho User Management
 * Gộp tất cả validation liên quan đến User, UserCredential, Role, Permission
 */

@Component
public class UserManagementValidator {

    // Regex patterns for validation
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    );
    
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "^(\\+84|0)[0-9]{8,10}$"
    );
    
    private static final Pattern USERNAME_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9._-]{3,20}$"
    );
    
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
        "^.{6,}$"
    );

    /**
     * Validate User Information
     */
    public List<String> validateUser(String fullName, String email, String phone, String address, String status) {
        List<String> errors = new ArrayList<>();
        
        // Validate full name
        if (fullName == null || fullName.trim().isEmpty()) {
            errors.add("Họ tên không được để trống");
        } else if (fullName.trim().length() < 2) {
            errors.add("Họ tên phải có ít nhất 2 ký tự");
        } else if (fullName.trim().length() > 255) {
            errors.add("Họ tên không được vượt quá 255 ký tự");
        }
        
        // Validate email
        if (email == null || email.trim().isEmpty()) {
            errors.add("Email không được để trống");
        } else if (!EMAIL_PATTERN.matcher(email).matches()) {
            errors.add("Email không đúng định dạng");
        } else if (email.length() > 100) {
            errors.add("Email không được vượt quá 100 ký tự");
        }
        
        // Validate phone
        if (phone != null && !phone.trim().isEmpty() && !PHONE_PATTERN.matcher(phone).matches()) {
            errors.add("Số điện thoại không đúng định dạng (VD: 0901234567 hoặc +84901234567)");
        }
        
        // Validate address
        if (address != null && address.length() > 255) {
            errors.add("Địa chỉ không được vượt quá 255 ký tự");
        }
        
        // Validate status
        if (status != null && !status.trim().isEmpty() && !isValidUserStatus(status)) {
            errors.add("Trạng thái không hợp lệ (ACTIVE, INACTIVE, PENDING, LOCKED)");
        }
        
        return errors;
    }

    /**
     * Validate User Credentials
     */
    public List<String> validateUserCredentials(String username, String password) {
        List<String> errors = new ArrayList<>();
        
        // Validate username
        if (username == null || username.trim().isEmpty()) {
            errors.add("Tên đăng nhập không được để trống");
        } else if (!USERNAME_PATTERN.matcher(username).matches()) {
            errors.add("Tên đăng nhập chỉ được chứa chữ cái, số, dấu chấm, gạch dưới, gạch ngang (3-20 ký tự)");
        }
        
        // Validate password
        if (password == null || password.trim().isEmpty()) {
            errors.add("Mật khẩu không được để trống");
        } else if (!PASSWORD_PATTERN.matcher(password).matches()) {
            errors.add("Mật khẩu phải có ít nhất 6 ký tự");
        }
        
        return errors;
    }

    /**
     * Validate Role Information
     */
    public List<String> validateRole(String name, String description) {
        List<String> errors = new ArrayList<>();
        
        // Validate role name
        if (name == null || name.trim().isEmpty()) {
            errors.add("Tên vai trò không được để trống");
        } else if (name.trim().length() < 2) {
            errors.add("Tên vai trò phải có ít nhất 2 ký tự");
        } else if (name.trim().length() > 255) {
            errors.add("Tên vai trò không được vượt quá 255 ký tự");
        } else if (!isValidRoleName(name.trim())) {
            errors.add("Tên vai trò không hợp lệ");
        }
        
        // Validate description (optional)
        if (description != null && description.length() > 255) {
            errors.add("Mô tả vai trò không được vượt quá 255 ký tự");
        }
        
        return errors;
    }

    /**
     * Validate Permission Information  
     */
    public List<String> validatePermission(String name, String description) {
        List<String> errors = new ArrayList<>();
        
        // Validate permission name
        if (name == null || name.trim().isEmpty()) {
            errors.add("Tên quyền không được để trống");
        } else if (name.trim().length() < 2) {
            errors.add("Tên quyền phải có ít nhất 2 ký tự");
        } else if (name.trim().length() > 255) {
            errors.add("Tên quyền không được vượt quá 255 ký tự");
        }
        
        // Validate description (optional)
        if (description != null && description.length() > 255) {
            errors.add("Mô tả quyền không được vượt quá 255 ký tự");
        }
        
        return errors;
    }

    /**
     * Validate Salary Information
     */
    public List<String> validateSalary(String salaryType, Double baseSalary, Double hourlyRate) {
        List<String> errors = new ArrayList<>();
        
        // Validate salary type
        if (salaryType != null && !isValidSalaryType(salaryType)) {
            errors.add("Loại lương không hợp lệ (MONTHLY, HOURLY)");
        }
        
        // Validate based on salary type
        if ("MONTHLY".equals(salaryType)) {
            if (baseSalary == null || baseSalary <= 0) {
                errors.add("Lương cơ bản phải lớn hơn 0 đối với lương tháng");
            } else if (baseSalary > 999999999.99) {
                errors.add("Lương cơ bản không được vượt quá 999,999,999.99");
            }
        } else if ("HOURLY".equals(salaryType)) {
            if (hourlyRate == null || hourlyRate <= 0) {
                errors.add("Lương theo giờ phải lớn hơn 0");
            } else if (hourlyRate > 999999.99) {
                errors.add("Lương theo giờ không được vượt quá 999,999.99");
            }
        }
        
        return errors;
    }

    /**
     * Validate Role Assignment
     */
    public List<String> validateRoleAssignment(Integer userId, Integer roleId) {
        List<String> errors = new ArrayList<>();
        
        if (userId == null || userId <= 0) {
            errors.add("ID người dùng không hợp lệ");
        }
        
        if (roleId == null || roleId <= 0) {
            errors.add("ID vai trò không hợp lệ");
        }
        
        return errors;
    }

    /**
     * Validate Permission Assignment to Role
     */
    public List<String> validatePermissionAssignment(Integer roleId, Integer permissionId) {
        List<String> errors = new ArrayList<>();
        
        if (roleId == null || roleId <= 0) {
            errors.add("ID vai trò không hợp lệ");
        }
        
        if (permissionId == null || permissionId <= 0) {
            errors.add("ID quyền không hợp lệ");
        }
        
        return errors;
    }

    /**
     * Validate Login Credentials
     */
    public List<String> validateLogin(String username, String password) {
        List<String> errors = new ArrayList<>();
        
        if (username == null || username.trim().isEmpty()) {
            errors.add("Tên đăng nhập không được để trống");
        }
        
        if (password == null || password.trim().isEmpty()) {
            errors.add("Mật khẩu không được để trống");
        }
        
        return errors;
    }

    // Helper methods
    private boolean isValidUserStatus(String status) {
        String normalized = status == null ? "" : status.trim().toUpperCase();
        return "ACTIVE".equals(normalized)
            || "INACTIVE".equals(normalized)
            || "PENDING".equals(normalized)
            || "LOCKED".equals(normalized);
    }
    
    private boolean isValidSalaryType(String salaryType) {
        return "MONTHLY".equals(salaryType) || "HOURLY".equals(salaryType);
    }
    
    private boolean isValidRoleName(String roleName) {
        // Define valid role names
        return "ADMIN".equals(roleName) || "MANAGER".equals(roleName) || 
               "CASHIER".equals(roleName) || "INVENTORY_STAFF".equals(roleName) || 
               "SALES_STAFF".equals(roleName);
    }

    /**
     * Validate ID parameter
     */
    public List<String> validateId(Integer id, String fieldName) {
        List<String> errors = new ArrayList<>();
        
        if (id == null || id <= 0) {
            errors.add(fieldName + " không hợp lệ");
        }
        
        return errors;
    }

    /**
     * Validate pagination parameters
     */
    public List<String> validatePagination(Integer page, Integer size) {
        List<String> errors = new ArrayList<>();
        
        if (page != null && page < 0) {
            errors.add("Số trang phải lớn hơn hoặc bằng 0");
        }
        
        if (size != null && (size <= 0 || size > 100)) {
            errors.add("Kích thước trang phải từ 1 đến 100");
        }
        
        return errors;
    }

    /**
     * Check if errors list is empty
     */
    public boolean hasErrors(List<String> errors) {
        return errors != null && !errors.isEmpty();
    }

    /**
     * Convert errors list to single string message
     */
    public String errorsToString(List<String> errors) {
        if (errors == null || errors.isEmpty()) {
            return "";
        }
        return String.join("; ", errors);
    }
}
