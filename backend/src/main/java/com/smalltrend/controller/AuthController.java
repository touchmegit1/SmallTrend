package com.smalltrend.controller;

import com.smalltrend.dto.auth.AuthRequest;
import com.smalltrend.dto.auth.AuthResponse;
import com.smalltrend.dto.auth.RegisterRequest;
import com.smalltrend.dto.common.MessageResponse;
import com.smalltrend.entity.User;
import com.smalltrend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = userService.register(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            AuthResponse response = userService.login(request.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Invalid username or password"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("User not authenticated"));
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken() {
        return ResponseEntity.ok(new MessageResponse("Token is valid"));
    }
}
