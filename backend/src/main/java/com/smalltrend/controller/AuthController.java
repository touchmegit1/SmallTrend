package com.smalltrend.controller;

import com.smalltrend.dto.auth.AuthRequest;
import com.smalltrend.dto.auth.AuthResponse;
import com.smalltrend.dto.common.MessageResponse;
import com.smalltrend.entity.User;
import com.smalltrend.service.UserService;
import com.smalltrend.validation.UserManagementValidator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final UserManagementValidator validator;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            // Validate input 
            List<String> errors = validator.validateLogin(request.getUsername(), request.getPassword());
            if (validator.hasErrors(errors)) {
                log.warn("Login validation failed: {}", validator.errorsToString(errors));
                return ResponseEntity.badRequest()
                        .body(new MessageResponse(validator.errorsToString(errors)));
            }

            // Authenticate user
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            AuthResponse response = userService.login(request.getUsername());
            log.info("User logged in successfully: {}", request.getUsername());
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            log.warn("Invalid login attempt for user: {}", request.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Tên đăng nhập hoặc mật khẩu không đúng"));

        } catch (DisabledException e) {
            log.warn("Login attempt for disabled user: {}", request.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Tài khoản đã bị vô hiệu hóa"));

        } catch (LockedException e) {
            log.warn("Login attempt for locked user: {}", request.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Tài khoản đã bị khóa"));

        } catch (AuthenticationException e) {
            log.warn("Authentication failed for user: {}, error: {}", request.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Xác thực thất bại: " + e.getMessage()));

        } catch (Exception e) {
            log.error("Login error for user: {}, error: {}", request.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi hệ thống, vui lòng thử lại sau"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null) {
                String username = authentication.getName();
                log.info("User logged out: {}", username);
                SecurityContextHolder.clearContext();
            }
            return ResponseEntity.ok(new MessageResponse("Đăng xuất thành công"));
        } catch (Exception e) {
            log.error("Logout error: {}", e.getMessage(), e);
            return ResponseEntity.ok(new MessageResponse("Đăng xuất thành công"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Không có quyền truy cập"));
            }

            String username = authentication.getName();
            User user = userService.getCurrentUser(username);

            return ResponseEntity.ok(AuthResponse.builder()
                    .userId(user.getId())
                    .username(username)
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .role(user.getRole() != null ? user.getRole().getName() : "ROLE_USER")
                    .build());

        } catch (Exception e) {
            log.error("Get current user error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Không thể lấy thông tin người dùng"));
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                return ResponseEntity.ok(new MessageResponse("Token hợp lệ"));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Token không hợp lệ"));
            }
        } catch (Exception e) {
            log.error("Token validation error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Token không hợp lệ"));
        }
    }
}
