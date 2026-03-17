package com.smalltrend.service;

import com.smalltrend.entity.User;
import com.smalltrend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetOtpService {

    private static final int OTP_EXPIRE_MINUTES = 10;
    private static final int OTP_LENGTH = 6;

    private final UserRepository userRepository;
    private final UserService userService;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    private final Random random = new Random();
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    public void requestOtp(String email) {
        String normalizedEmail = normalizeEmail(email);
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này"));

        String otpCode = generateOtp();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRE_MINUTES);
        otpStore.put(normalizedEmail, new OtpEntry(otpCode, expiresAt));

        sendOtpEmail(user, otpCode, expiresAt);
    }

    @Transactional
    public void resetPassword(String email, String otp, String newPassword, String confirmPassword) {
        String normalizedEmail = normalizeEmail(email);
        String normalizedOtp = Optional.ofNullable(otp).orElse("").trim();

        OtpEntry otpEntry = otpStore.get(normalizedEmail);
        if (otpEntry == null || LocalDateTime.now().isAfter(otpEntry.expiresAt())) {
            otpStore.remove(normalizedEmail);
            throw new RuntimeException("OTP đã hết hạn hoặc không tồn tại");
        }

        if (!otpEntry.code().equals(normalizedOtp)) {
            throw new RuntimeException("OTP không chính xác");
        }

        userService.resetPasswordByEmail(normalizedEmail, newPassword, confirmPassword);
        otpStore.remove(normalizedEmail);
    }

    private void sendOtpEmail(User user, String otpCode, LocalDateTime expiresAt) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            if (mailFrom != null && !mailFrom.isBlank()) {
                helper.setFrom(mailFrom);
            }

            helper.setTo(user.getEmail());
            helper.setSubject("SmallTrend - OTP dat lai mat khau");
            helper.setText(buildHtmlBody(user.getFullName(), otpCode, expiresAt), true);
            mailSender.send(message);
        } catch (Exception ex) {
            log.error("Unable to send forgot-password OTP to {}", user.getEmail(), ex);
            throw new RuntimeException("Không thể gửi OTP qua email, vui lòng thử lại sau");
        }
    }

    private String buildHtmlBody(String fullName, String otpCode, LocalDateTime expiresAt) {
        return "<div style='font-family:Arial,sans-serif;line-height:1.6'>"
                + "<p>Xin chao " + escapeHtml(Optional.ofNullable(fullName).orElse("ban")) + ",</p>"
                + "<p>Ma OTP dat lai mat khau cua ban la:</p>"
                + "<p style='font-size:24px;font-weight:700;letter-spacing:4px'>" + otpCode + "</p>"
                + "<p>Ma co hieu luc den " + expiresAt + " (" + OTP_EXPIRE_MINUTES + " phut).</p>"
                + "<p>Neu ban khong thuc hien yeu cau nay, hay bo qua email.</p>"
                + "</div>";
    }

    private String normalizeEmail(String email) {
        String normalized = Optional.ofNullable(email).orElse("").trim().toLowerCase();
        if (normalized.isEmpty()) {
            throw new RuntimeException("Email không được để trống");
        }
        return normalized;
    }

    private String generateOtp() {
        int bound = (int) Math.pow(10, OTP_LENGTH);
        int value = random.nextInt(bound);
        return String.format("%0" + OTP_LENGTH + "d", value);
    }

    private String escapeHtml(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private record OtpEntry(String code, LocalDateTime expiresAt) {

    }
}
