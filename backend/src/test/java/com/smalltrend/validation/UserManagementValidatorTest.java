package com.smalltrend.validation;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UserManagementValidatorTest {

    private UserManagementValidator validator;

    @BeforeEach
    void setUp() {
        validator = new UserManagementValidator();
    }

    @Test
    void validateUser_shouldReturnNoErrors_whenInputValid() {
        List<String> errors = validator.validateUser(
                "Nguyen Van A",
                "valid.user@smalltrend.com",
                "0901234567",
                "123 Le Loi",
                "ACTIVE"
        );

        assertTrue(errors.isEmpty());
    }

    @Test
    void validateUser_shouldReturnMultipleErrors_whenInputInvalid() {
        List<String> errors = validator.validateUser(
                "A",
                "invalid-email",
                "123",
                "x".repeat(256),
                "UNKNOWN"
        );

        assertTrue(errors.contains("Họ tên phải có ít nhất 2 ký tự"));
        assertTrue(errors.contains("Email không đúng định dạng"));
        assertTrue(errors.contains("Số điện thoại không đúng định dạng (VD: 0901234567 hoặc +84901234567)"));
        assertTrue(errors.contains("Địa chỉ không được vượt quá 255 ký tự"));
        assertTrue(errors.contains("Trạng thái không hợp lệ (ACTIVE, INACTIVE, PENDING, LOCKED)"));
    }

    @Test
    void validateUserCredentials_shouldValidateUsernameAndPassword() {
        List<String> errors = validator.validateUserCredentials("ab", "123");

        assertTrue(errors.contains("Tên đăng nhập chỉ được chứa chữ cái, số, dấu chấm, gạch dưới, gạch ngang (3-20 ký tự)"));
        assertTrue(errors.contains("Mật khẩu phải có ít nhất 6 ký tự"));
    }

    @Test
    void validateRole_validatePermission_shouldValidateLengthAndAllowedValues() {
        List<String> roleErrors = validator.validateRole("DEV", "ok");
        List<String> permissionErrors = validator.validatePermission("A", "x".repeat(256));

        assertTrue(roleErrors.contains("Tên vai trò không hợp lệ"));
        assertTrue(permissionErrors.contains("Tên quyền phải có ít nhất 2 ký tự"));
        assertTrue(permissionErrors.contains("Mô tả quyền không được vượt quá 255 ký tự"));
    }

    @Test
    void validateSalary_shouldValidateBySalaryType() {
        List<String> monthlyErrors = validator.validateSalary("MONTHLY", 0.0, null);
        List<String> hourlyErrors = validator.validateSalary("HOURLY", null, 0.0);
        List<String> typeErrors = validator.validateSalary("OTHER", null, null);

        assertTrue(monthlyErrors.contains("Lương cơ bản phải lớn hơn 0 đối với lương tháng"));
        assertTrue(hourlyErrors.contains("Lương theo giờ phải lớn hơn 0"));
        assertTrue(typeErrors.contains("Loại lương không hợp lệ (MONTHLY, MONTHLY_MIN_SHIFTS, HOURLY)"));
    }

    @Test
    void validateRoleAssignment_validatePermissionAssignment_shouldRequirePositiveIds() {
        List<String> roleAssignErrors = validator.validateRoleAssignment(0, null);
        List<String> permissionAssignErrors = validator.validatePermissionAssignment(null, -1);

        assertTrue(roleAssignErrors.contains("ID người dùng không hợp lệ"));
        assertTrue(roleAssignErrors.contains("ID vai trò không hợp lệ"));
        assertTrue(permissionAssignErrors.contains("ID vai trò không hợp lệ"));
        assertTrue(permissionAssignErrors.contains("ID quyền không hợp lệ"));
    }

    @Test
    void validateLogin_validatePagination_validateId_shouldReturnExpectedMessages() {
        List<String> loginErrors = validator.validateLogin(" ", null);
        List<String> paginationErrors = validator.validatePagination(-1, 101);
        List<String> idErrors = validator.validateId(0, "User id");

        assertTrue(loginErrors.contains("Tên đăng nhập không được để trống"));
        assertTrue(loginErrors.contains("Mật khẩu không được để trống"));
        assertTrue(paginationErrors.contains("Số trang phải lớn hơn hoặc bằng 0"));
        assertTrue(paginationErrors.contains("Kích thước trang phải từ 1 đến 100"));
        assertEquals("User id không hợp lệ", idErrors.get(0));
    }

    @Test
    void hasErrors_and_errorsToString_shouldHandleNullAndFilledList() {
        List<String> errors = List.of("Loi 1", "Loi 2");

        assertFalse(validator.hasErrors(List.of()));
        assertTrue(validator.hasErrors(errors));
        assertEquals("", validator.errorsToString(null));
        assertEquals("Loi 1; Loi 2", validator.errorsToString(errors));
    }
}
