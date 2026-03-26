package com.smalltrend.service.inventory.shared;

import com.smalltrend.dto.inventory.purchase.NotifyManagerEmailRequest;
import com.smalltrend.entity.PurchaseOrder;
import com.smalltrend.entity.User;
import com.smalltrend.repository.UserRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryManagerNotificationService {

    private static final List<String> MANAGER_ROLE_NAMES = List.of("MANAGER", "ROLE_MANAGER");

    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    @Value("${spring.mail.password:}")
    private String senderPassword;

    @Value("${app.notifications.inventory.manager.recipients:}")
    private String overrideRecipients;

    public int notifyManagers(PurchaseOrder order, NotifyManagerEmailRequest request) {
        validateMailConfig();

        List<String> recipients = getManagerRecipients();
        if (recipients.isEmpty()) {
            throw new RuntimeException("Không tìm thấy email manager hợp lệ để gửi thông báo.");
        }

        for (String recipient : recipients) {
            sendEmail(recipient, order, request);
        }

        return recipients.size();
    }

    private List<String> getManagerRecipients() {
        List<String> configuredRecipients = parseRecipients(overrideRecipients);
        if (!configuredRecipients.isEmpty()) {
            return configuredRecipients;
        }

        return userRepository.findByRole_NameInAndActiveTrueAndStatusIgnoreCase(MANAGER_ROLE_NAMES, "ACTIVE")
                .stream()
                .map(User::getEmail)
                .filter(email -> email != null && !email.isBlank())
                .map(String::trim)
                .distinct()
                .collect(Collectors.toList());
    }

    private List<String> parseRecipients(String recipients) {
        if (recipients == null || recipients.isBlank()) {
            return List.of();
        }
        return Arrays.stream(recipients.split(","))
                .map(String::trim)
                .filter(email -> !email.isBlank())
                .distinct()
                .collect(Collectors.toList());
    }

    private void validateMailConfig() {
        if (senderEmail == null || senderEmail.isBlank()) {
            throw new RuntimeException("spring.mail.username (MAIL_USERNAME) đang trống.");
        }
        if (senderPassword == null || senderPassword.isBlank()) {
            throw new RuntimeException("spring.mail.password (MAIL_PASSWORD) đang trống.");
        }
    }

    private void sendEmail(String recipient, PurchaseOrder order, NotifyManagerEmailRequest request) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setTo(recipient);
            helper.setFrom(senderEmail);
            helper.setSubject(request.getSubject().trim());
            helper.setText(buildHtmlContent(order, request), true);

            mailSender.send(message);
        } catch (Exception ex) {
            throw new RuntimeException("Không thể gửi email đến manager: " + ex.getMessage(), ex);
        }
    }

    private String buildHtmlContent(PurchaseOrder order, NotifyManagerEmailRequest request) {
        String poCode = order != null && order.getOrderNumber() != null ? safe(order.getOrderNumber()) : "N/A";

        return "<div style='font-family:Arial,sans-serif;'>"
                + "<p><strong>Thông báo từ bộ phận kho</strong></p>"
                + "<p>Mã phiếu nhập: <strong>" + poCode + "</strong></p>"
                + "<p>Nội dung:</p>"
                + "<div style='padding:12px;border:1px solid #ddd;border-radius:6px;background:#fafafa;white-space:pre-wrap;'>"
                + safe(request.getMessage())
                + "</div>"
                + "</div>";
    }

    private String safe(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
