package com.smalltrend.controller;

import com.smalltrend.dto.common.MessageResponse;
import com.smalltrend.dto.user.UserDTO;
import com.smalltrend.dto.user.UserStatusRequest;
import com.smalltrend.dto.user.UserUpdateRequest;
import com.smalltrend.dto.auth.RegisterRequest;
import com.smalltrend.entity.User;
import com.smalltrend.service.UserService;
import com.smalltrend.validation.UserManagementValidator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class UserController {

    private final UserService userService;
    private final UserManagementValidator validator;

    /**
     * Admin tạo tài khoản cho nhân viên - không có đăng ký tự do
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createEmployeeAccount(@Valid @RequestBody RegisterRequest request) {
        // Validate using UserManagementValidator
        List<String> errors = validator.validateUser(
                request.getFullName(),
                request.getEmail(),
                request.getPhone(),
                request.getAddress(),
                "ACTIVE");

        List<String> credentialErrors = validator.validateUserCredentials(
                request.getUsername(),
                request.getPassword());
        errors.addAll(credentialErrors);

        if (validator.hasErrors(errors)) {
            log.warn("Employee account creation validation failed: {}", validator.errorsToString(errors));
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(validator.errorsToString(errors)));
        }

        UserDTO newUser = userService.createEmployee(request);
        log.info("Employee account created by admin: {}", request.getUsername());
        return ResponseEntity.ok(newUser);
    }

    /**
     * Lấy danh sách tất cả user với phân trang
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER', 'INVENTORY_STAFF', 'SALES_STAFF')")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        // Validate pagination
        List<String> errors = validator.validatePagination(page, size);
        if (validator.hasErrors(errors)) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(validator.errorsToString(errors)));
        }

        Page<User> usersPage = userService.getAllUsers(page, size);
        Page<UserDTO> userDTOsPage = usersPage.map(UserDTO::fromEntity);

        return ResponseEntity.ok(userDTOsPage);
    }

    /**
     * Lấy thông tin user theo ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER', 'INVENTORY_STAFF', 'SALES_STAFF')")
    public ResponseEntity<?> getUserById(@PathVariable Integer id) {
        // Validate ID
        List<String> errors = validator.validateId(id, "ID người dùng");
        if (validator.hasErrors(errors)) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(validator.errorsToString(errors)));
        }

        User user = userService.getUserById(id);
        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }

    /**
     * Cập nhật thông tin user
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @Valid @RequestBody UserUpdateRequest request) {
        // Validate ID
        List<String> errors = validator.validateId(id, "ID người dùng");

        // Validate update data
        List<String> userErrors = validator.validateUser(
                request.getFullName(),
                request.getEmail(),
                request.getPhone(),
                request.getAddress(),
                request.getStatus());
        errors.addAll(userErrors);

        if (validator.hasErrors(errors)) {
            log.warn("User update validation failed for ID {}: {}", id, validator.errorsToString(errors));
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(validator.errorsToString(errors)));
        }

        User updatedUser = userService.updateUser(id, request);
        log.info("User updated successfully: ID {}", id);
        return ResponseEntity.ok(UserDTO.fromEntity(updatedUser));
    }

    /**
     * Xóa user (chỉ admin)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        // Validate ID
        List<String> errors = validator.validateId(id, "ID người dùng");
        if (validator.hasErrors(errors)) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(validator.errorsToString(errors)));
        }

        userService.deleteUser(id);
        log.info("User deleted successfully: ID {}", id);
        return ResponseEntity.ok(new MessageResponse("Xóa người dùng thành công"));
    }

    /**
     * Cập nhật trạng thái user (chỉ admin)
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserStatus(@PathVariable Integer id, @Valid @RequestBody UserStatusRequest request) {
        // Validate ID
        List<String> errors = validator.validateId(id, "ID người dùng");
        if (validator.hasErrors(errors)) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(validator.errorsToString(errors)));
        }

        // Validate status
        if (request.getStatus() == null || request.getStatus().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Trạng thái không được để trống"));
        }

        User user = userService.updateUserStatus(id, request.getStatus());
        log.info("User status updated successfully: ID {} to {}", id, request.getStatus());
        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }

    /**
     * Tìm kiếm user theo tên hoặc email
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'CASHIER', 'INVENTORY_STAFF', 'SALES_STAFF')")
    public ResponseEntity<?> searchUsers(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        // Validate pagination
        List<String> errors = validator.validatePagination(page, size);
        if (validator.hasErrors(errors)) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(validator.errorsToString(errors)));
        }

        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Từ khóa tìm kiếm không được để trống"));
        }

        Page<User> usersPage = userService.searchUsers(query.trim(), page, size);
        Page<UserDTO> userDTOsPage = usersPage.map(UserDTO::fromEntity);

        return ResponseEntity.ok(userDTOsPage);
    }
}
