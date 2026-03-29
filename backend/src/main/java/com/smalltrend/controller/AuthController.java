package com.smalltrend.controller;

import com.smalltrend.dto.auth.AuthRequest;
import com.smalltrend.dto.auth.AuthResponse;
import com.smalltrend.dto.auth.ForgotPasswordOtpRequest;
import com.smalltrend.dto.auth.RefreshTokenRequest;
import com.smalltrend.dto.auth.ResetPasswordOtpRequest;
import com.smalltrend.dto.common.MessageResponse;
import com.smalltrend.entity.User;
import com.smalltrend.service.AuditLogService;
import com.smalltrend.service.PasswordResetOtpService;
import com.smalltrend.service.UserService;
import com.smalltrend.validation.UserManagementValidator;
import jakarta.servlet.http.HttpServletRequest;
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
public class AuthController {

    private final UserService userService;
    private final PasswordResetOtpService passwordResetOtpService;
    private final AuthenticationManager authenticationManager;
    private final UserManagementValidator validator;
    private final AuditLogService auditLogService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request, HttpServletRequest httpRequest) {
        try {
            // Validate input 
            List<String> errors = validator.validateLogin(request.getUsername(), request.getPassword());
            if (validator.hasErrors(errors)) {
                log.warn("Login validation failed: {}", validator.errorsToString(errors));
                auditLogService.recordAuthEvent(request.getUsername(), "LOGIN", "FAIL", resolveIp(httpRequest),
                        resolveTraceId(httpRequest), "Validation failed: " + validator.errorsToString(errors));
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
            auditLogService.recordAuthEvent(request.getUsername(), "LOGIN", "OK", resolveIp(httpRequest),
                    resolveTraceId(httpRequest), "Login successful");
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            log.warn("Invalid login attempt for user: {}", request.getUsername());
            auditLogService.recordAuthEvent(request.getUsername(), "LOGIN", "DENIED", resolveIp(httpRequest),
                    resolveTraceId(httpRequest), "Invalid credentials");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Tên đăng nhập hoặc mật khẩu không đúng"));

        } catch (DisabledException e) {
            log.warn("Login attempt for disabled user: {}", request.getUsername());
            auditLogService.recordAuthEvent(request.getUsername(), "LOGIN", "DENIED", resolveIp(httpRequest),
                    resolveTraceId(httpRequest), "Account disabled");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Tài khoản đã bị vô hiệu hóa"));

        } catch (LockedException e) {
            log.warn("Login attempt for locked user: {}", request.getUsername());
            auditLogService.recordAuthEvent(request.getUsername(), "LOGIN", "DENIED", resolveIp(httpRequest),
                    resolveTraceId(httpRequest), "Account locked");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Tài khoản đã bị khóa"));

        } catch (AuthenticationException e) {
            log.warn("Authentication failed for user: {}, error: {}", request.getUsername(), e.getMessage());
            auditLogService.recordAuthEvent(request.getUsername(), "LOGIN", "DENIED", resolveIp(httpRequest),
                    resolveTraceId(httpRequest), "Authentication failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Xác thực thất bại: " + e.getMessage()));

        } catch (Exception e) {
            log.error("Login error for user: {}, error: {}", request.getUsername(), e.getMessage(), e);
            auditLogService.recordAuthEvent(request.getUsername(), "LOGIN", "FAIL", resolveIp(httpRequest),
                    resolveTraceId(httpRequest), "System error during login");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Lỗi hệ thống, vui lòng thử lại sau"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest httpRequest) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null) {
                String username = authentication.getName();
                log.info("User logged out: {}", username);
                auditLogService.recordAuthEvent(username, "LOGOUT", "OK", resolveIp(httpRequest),
                        resolveTraceId(httpRequest), "Logout successful");
                SecurityContextHolder.clearContext();
            } else {
                auditLogService.recordAuthEvent("anonymous", "LOGOUT", "DENIED", resolveIp(httpRequest),
                        resolveTraceId(httpRequest), "Logout requested without authenticated context");
            }
            return ResponseEntity.ok(new MessageResponse("Đăng xuất thành công"));
        } catch (Exception e) {
            log.error("Logout error: {}", e.getMessage(), e);
            auditLogService.recordAuthEvent("anonymous", "LOGOUT", "FAIL", resolveIp(httpRequest),
                    resolveTraceId(httpRequest), "System error during logout");
            return ResponseEntity.ok(new MessageResponse("Đăng xuất thành công"));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@Valid @RequestBody RefreshTokenRequest request, HttpServletRequest httpRequest) {
        try {
            AuthResponse response = userService.refreshToken(request.getRefreshToken());
            auditLogService.recordAuthEvent(response.getUsername(), "REFRESH_TOKEN", "OK", resolveIp(httpRequest),
                    resolveTraceId(httpRequest), "Access token refreshed");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.warn("Refresh token failed: {}", e.getMessage());
            auditLogService.recordAuthEvent("anonymous", "REFRESH_TOKEN", "DENIED", resolveIp(httpRequest),
                    resolveTraceId(httpRequest), "Refresh token invalid or expired");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Refresh token không hợp lệ hoặc đã hết hạn"));
        }
    }

    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String resolveTraceId(HttpServletRequest request) {
        String traceId = request.getHeader("X-Trace-Id");
        if (traceId != null && !traceId.isBlank()) {
            return traceId;
        }
        return request.getHeader("X-Request-Id");
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
                    .avatarUrl(user.getAvatarUrl())
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

    @PostMapping("/forgot-password/otp")
    public ResponseEntity<?> requestPasswordOtp(@Valid @RequestBody ForgotPasswordOtpRequest request) {
        try {
            passwordResetOtpService.requestOtp(request.getEmail());
            return ResponseEntity.ok(new MessageResponse("OTP da duoc gui den email"));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(ex.getMessage()));
        } catch (Exception ex) {
            log.error("Request password OTP error for email {}", request.getEmail(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Khong the gui OTP, vui long thu lai sau"));
        }
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<?> resetPasswordWithOtp(@Valid @RequestBody ResetPasswordOtpRequest request) {
        try {
            passwordResetOtpService.resetPassword(
                    request.getEmail(),
                    request.getOtp(),
                    request.getNewPassword(),
                    request.getConfirmPassword());
            return ResponseEntity.ok(new MessageResponse("Dat lai mat khau thanh cong"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse(ex.getMessage()));
        } catch (Exception ex) {
            log.error("Reset password by OTP failed for email {}", request.getEmail(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Khong the dat lai mat khau, vui long thu lai sau"));
        }
    }
}
