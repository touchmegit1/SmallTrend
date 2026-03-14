package com.smalltrend.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    @lombok.Builder.Default
    private String type = "Bearer";
    private Integer userId;
    private String username;
    private String fullName;
    private String email;
    private String role;
    private String avatarUrl;

    public AuthResponse(String token, Integer userId, String username, String fullName, String email, String role, String avatarUrl) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.avatarUrl = avatarUrl;
    }
}
