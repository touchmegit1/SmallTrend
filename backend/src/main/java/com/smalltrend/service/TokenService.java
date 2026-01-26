package com.smalltrend.service;

import com.smalltrend.entity.UserCredentials;
import com.smalltrend.entity.Users;
import com.smalltrend.repository.UserCredentialsRepository;
import com.smalltrend.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;


@Service
public class TokenService {

    @Autowired
    private UserCredentialsRepository credentialsRepository;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Lưu token vào database khi user login
     */
    @Transactional
    public void saveToken(Users user, String accessToken, String refreshToken, HttpServletRequest request) {
        UserCredentials credentials = credentialsRepository.findByUsername(user.getUsername())
                .orElseThrow(() -> new RuntimeException("User credentials not found"));

        credentials.setAccessToken(accessToken);
        credentials.setRefreshToken(refreshToken);
        credentials.setTokenIssuedAt(LocalDateTime.now());
        credentials.setTokenExpiresAt(LocalDateTime.now().plusHours(1)); // Access token: 1 hour
        credentials.setRefreshTokenExpiresAt(LocalDateTime.now().plusDays(7)); // Refresh token: 7 days
        credentials.setLastLogin(LocalDateTime.now());
        credentials.setLastIpAddress(getClientIP(request));
        credentials.setDeviceInfo(request.getHeader("User-Agent"));
        credentials.setIsActive(true);

        credentialsRepository.save(credentials);
    }

    /**
     * Verify token có tồn tại trong database và còn hiệu lực
     */
    public boolean isTokenValid(String token) {
        return credentialsRepository.findByAccessToken(token)
                .map(cred -> cred.getIsActive() && 
                            cred.getTokenExpiresAt().isAfter(LocalDateTime.now()))
                .orElse(false);
    }

    /**
     * Revoke token khi logout
     */
    @Transactional
    public void revokeToken(String username) {
        credentialsRepository.findByUsername(username).ifPresent(cred -> {
            cred.setAccessToken(null);
            cred.setRefreshToken(null);
            cred.setIsActive(false);
            credentialsRepository.save(cred);
        });
    }

    /**
     * Refresh access token bằng refresh token
     */
    @Transactional
    public String refreshAccessToken(String refreshToken) {
        UserCredentials credentials = credentialsRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (credentials.getRefreshTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh token expired");
        }

        // Generate new access token
        String newAccessToken = jwtUtil.generateToken(
            User.builder()
                .username(credentials.getUsername())
                .password("")
                .authorities("USER")
                .build()
        );

        credentials.setAccessToken(newAccessToken);
        credentials.setTokenIssuedAt(LocalDateTime.now());
        credentials.setTokenExpiresAt(LocalDateTime.now().plusHours(1));
        credentialsRepository.save(credentials);

        return newAccessToken;
    }

    /**
     * Lấy IP address thực của client
     */
    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
