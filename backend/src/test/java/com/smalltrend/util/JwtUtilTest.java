package com.smalltrend.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", "5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437");
        ReflectionTestUtils.setField(jwtUtil, "expiration", 86400000L);
        ReflectionTestUtils.setField(jwtUtil, "refreshExpiration", 604800000L);
    }

    @Test
    void validateRefreshToken_shouldReturnTrue_forValidRefreshToken() {
        UserDetails userDetails = User.withUsername("alice")
                .password("x")
                .authorities("ROLE_USER")
                .build();

        String refreshToken = jwtUtil.generateRefreshToken("alice");

        assertTrue(jwtUtil.validateRefreshToken(refreshToken, userDetails));
    }

    @Test
    void validateRefreshToken_shouldReturnFalse_forAccessToken() {
        UserDetails userDetails = User.withUsername("alice")
                .password("x")
                .authorities("ROLE_USER")
                .build();

        String accessToken = jwtUtil.generateToken("alice");

        assertFalse(jwtUtil.validateRefreshToken(accessToken, userDetails));
    }
}
