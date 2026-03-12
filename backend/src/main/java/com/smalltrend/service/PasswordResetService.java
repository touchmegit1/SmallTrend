package com.smalltrend.service;

import com.smalltrend.entity.PasswordResetOtp;
import com.smalltrend.entity.User;
import com.smalltrend.entity.UserCredential;
import com.smalltrend.repository.PasswordResetOtpRepository;
import com.smalltrend.repository.UserCredentialsRepository;
import com.smalltrend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final int OTP_EXPIRE_MINUTES = 10;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final UserCredentialsRepository userCredentialsRepository;
    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Transactional
    public void requestOtp(String email) {
        String normalizedEmail = normalizeEmail(email);
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Email không tồn tại trong hệ thống"));

        if (user.getActive() != null && !user.getActive()) {
            throw new IllegalArgumentException("Tài khoản đã bị vô hiệu hóa");
        }

        String otpCode = generateOtp();
        passwordResetOtpRepository.deleteByEmail(normalizedEmail);

        PasswordResetOtp resetOtp = PasswordResetOtp.builder()
                .user(user)
                .email(normalizedEmail)
                .otpCode(otpCode)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRE_MINUTES))
                .used(false)
                .build();
        passwordResetOtpRepository.save(resetOtp);

        emailService.sendPasswordResetOtp(normalizedEmail, user.getFullName(), otpCode, OTP_EXPIRE_MINUTES);
    }

    @Transactional
    public void resetPassword(String email, String otp, String newPassword, String confirmPassword) {
        String normalizedEmail = normalizeEmail(email);
        String normalizedOtp = normalizeOtp(otp);
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("Mật khẩu mới phải có ít nhất 6 ký tự");
        }
        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("Xác nhận mật khẩu mới không khớp");
        }

        PasswordResetOtp resetOtp = passwordResetOtpRepository
                .findTopByEmailAndOtpCodeAndUsedFalseOrderByCreatedAtDesc(normalizedEmail, normalizedOtp)
                .orElseThrow(() -> new IllegalArgumentException("OTP không hợp lệ"));

        if (resetOtp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP đã hết hạn, vui lòng yêu cầu mã mới");
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản hợp lệ"));

        String encodedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedPassword);
        userRepository.save(user);

        Optional<UserCredential> credentials = userCredentialsRepository.findByUserId(user.getId());
        if (credentials.isPresent()) {
            UserCredential credential = credentials.get();
            credential.setPasswordHash(encodedPassword);
            userCredentialsRepository.save(credential);
        }

        resetOtp.setUsed(true);
        passwordResetOtpRepository.save(resetOtp);
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email không được để trống");
        }
        return email.trim().toLowerCase();
    }

    private String normalizeOtp(String otp) {
        if (otp == null || otp.isBlank()) {
            throw new IllegalArgumentException("OTP không được để trống");
        }

        String normalized = otp.trim();
        if (!normalized.matches("\\d{6}")) {
            throw new IllegalArgumentException("OTP phải gồm đúng 6 chữ số");
        }
        return normalized;
    }

    private String generateOtp() {
        int code = 100000 + RANDOM.nextInt(900000);
        return String.valueOf(code);
    }
}
