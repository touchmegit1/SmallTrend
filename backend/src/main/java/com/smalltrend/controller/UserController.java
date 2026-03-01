package com.smalltrend.controller;

import com.smalltrend.dto.common.MessageResponse;
import com.smalltrend.dto.user.UserDTO;
import com.smalltrend.dto.user.UserStatusRequest;
import com.smalltrend.dto.user.UserUpdateRequest;
import com.smalltrend.dto.auth.RegisterRequest;
import com.smalltrend.entity.User;
import com.smalltrend.exception.UserException;
import com.smalltrend.service.UserService;
import com.smalltrend.validation.UserManagementValidator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class UserController {

    private final UserService userService;
    private final UserManagementValidator validator;

    /**
     * Admin tạo tài khoản cho nhân viên - không có đăng ký tự do
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createEmployeeAccount(@Valid @RequestBody RegisterRequest request) {
        try {
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
                String errorMsg = validator.errorsToString(errors);
                return ResponseEntity.badRequest()
                        .body(MessageResponse.builder().message(errorMsg).build());
            }

            UserDTO newUser = userService.createEmployee(request);
            return ResponseEntity.ok(newUser);
        } catch (UserException ex) {
            // Handle constraint violations (duplicate username, email, phone)
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(MessageResponse.builder().message(ex.getMessage()).build());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(MessageResponse.builder().message("Có lỗi xảy ra khi tạo tài khoản. Vui lòng thử lại.")
                            .build());
        }
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
            String errorMsg = validator.errorsToString(errors);
            return ResponseEntity.badRequest()
                    .body(MessageResponse.builder().message(errorMsg).build());
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
            String errorMsg = validator.errorsToString(errors);
            return ResponseEntity.badRequest()
                    .body(MessageResponse.builder().message(errorMsg).build());
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
        try {
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
                String errorMsg = validator.errorsToString(errors);
                return ResponseEntity.badRequest()
                        .body(MessageResponse.builder().message(errorMsg).build());
            }

            User updatedUser = userService.updateUser(id, request);
            return ResponseEntity.ok(UserDTO.fromEntity(updatedUser));
        } catch (UserException ex) {
            // Handle constraint violations
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(MessageResponse.builder().message(ex.getMessage()).build());
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(MessageResponse.builder().message("Có lỗi xảy ra khi cập nhật tài khoản. Vui lòng thử lại.")
                            .build());
        }
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
            String errorMsg = validator.errorsToString(errors);
            return ResponseEntity.badRequest()
                    .body(MessageResponse.builder().message(errorMsg).build());
        }

        userService.deleteUser(id);
        return ResponseEntity.ok(MessageResponse.builder().message("Xóa người dùng thành công").build());
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
            String errorMsg = validator.errorsToString(errors);
            return ResponseEntity.badRequest()
                    .body(MessageResponse.builder().message(errorMsg).build());
        }

        // Validate status
        if (request.getStatus() == null || request.getStatus().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(MessageResponse.builder().message("Trạng thái không được để trống").build());
        }

        User user = userService.updateUserStatus(id, request.getStatus());
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
            String errorMsg = validator.errorsToString(errors);
            return ResponseEntity.badRequest()
                    .body(MessageResponse.builder().message(errorMsg).build());
        }

        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(MessageResponse.builder().message("Từ khóa tìm kiếm không được để trống").build());
        }

        Page<User> usersPage = userService.searchUsers(query.trim(), page, size);
        Page<UserDTO> userDTOsPage = usersPage.map(UserDTO::fromEntity);

        return ResponseEntity.ok(userDTOsPage);
    }
}
