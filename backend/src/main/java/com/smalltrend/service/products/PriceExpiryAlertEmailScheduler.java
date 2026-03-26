package com.smalltrend.service.products;

import com.smalltrend.dto.inventory.dashboard.PriceExpiryAlertResponse;
import com.smalltrend.entity.PriceExpiryAlertLog;
import com.smalltrend.repository.PriceExpiryAlertLogRepository;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Scheduler gửi email cảnh báo các mức giá sắp hết hiệu lực.
 * Có cơ chế ghi log để tránh gửi trùng cho cùng variant_price + ngày + người nhận.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PriceExpiryAlertEmailScheduler {

    private final VariantPriceService variantPriceService;
    private final PriceExpiryAlertLogRepository alertLogRepository;
    private final JavaMailSender mailSender;

    @Value("${app.notifications.price-expiry.recipient:admin.smalltrend.swp@gmail.com}")
    private String recipientEmails;

    @Value("${app.notifications.price-expiry.days-before:1}")
    private int daysBeforeExpiry;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    @Value("${spring.mail.password:}")
    private String senderPassword;

    @Scheduled(cron = "${app.notifications.price-expiry.cron:0 30 7 * * *}")
    public void sendPriceExpiryAlerts() {
        sendPriceExpiryAlertsInternal(false);
    }

    public int sendPriceExpiryAlertsNow() {
        return sendPriceExpiryAlertsInternal(true);
    }

    private int sendPriceExpiryAlertsInternal(boolean throwOnError) {
        validateMailConfig(throwOnError);

        LocalDate today = LocalDate.now();
        List<String> recipients = getRecipientEmailList();

        if (recipients.isEmpty()) {
            log.warn("No valid recipients configured. Skip sending.");
            return 0;
        }

        List<PriceExpiryAlertResponse> alerts = variantPriceService.getPriceExpiryAlerts(daysBeforeExpiry);
        if (alerts.isEmpty()) {
            log.debug("No price expiry alerts for email today.");
            return 0;
        }

        int sentCount = 0;

        for (String recipient : recipients) {
            List<PriceExpiryAlertResponse> unsentAlerts = alerts.stream()
                    .filter(alert -> !alertLogRepository.existsByVariantPriceIdAndAlertDateAndRecipientEmail(
                            alert.getVariantPriceId(),
                            today,
                            recipient))
                    .collect(Collectors.toList());

            if (unsentAlerts.isEmpty()) {
                log.debug("All price expiry alerts already sent today for {}.", recipient);
                continue;
            }

            try {
                sendEmail(recipient, unsentAlerts);

                unsentAlerts.forEach(alert -> alertLogRepository.save(
                        PriceExpiryAlertLog.builder()
                                .variantPriceId(alert.getVariantPriceId())
                                .alertDate(today)
                                .recipientEmail(recipient)
                                .build()));

                sentCount += unsentAlerts.size();
                log.info("Sent price expiry alert email to {} with {} items.", recipient, unsentAlerts.size());
            } catch (Exception e) {
                if (throwOnError) {
                    throw new IllegalStateException("Cannot send price expiry email to " + recipient + ": " + e.getMessage(), e);
                }
                log.error("Failed to send price expiry alert email to {}", recipient, e);
            }
        }

        return sentCount;
    }

    private void validateMailConfig(boolean throwOnError) {
        if (recipientEmails == null || recipientEmails.isBlank()) {
            failOrWarn("app.notifications.price-expiry.recipient is empty.", throwOnError);
        }

        if (senderEmail == null || senderEmail.isBlank()) {
            failOrWarn("spring.mail.username (MAIL_USERNAME) is empty.", throwOnError);
        }

        if (senderPassword == null || senderPassword.isBlank()) {
            failOrWarn("spring.mail.password (MAIL_PASSWORD) is empty.", throwOnError);
        }

        if (senderEmail != null && senderEmail.toLowerCase().endsWith("@gmail.com")
                && senderPassword != null && !senderPassword.isBlank() && senderPassword.length() != 16) {
            log.warn("MAIL_PASSWORD length is {}. Gmail App Password is usually 16 characters.", senderPassword.length());
        }
    }

    private void failOrWarn(String message, boolean throwOnError) {
        if (throwOnError) {
            throw new IllegalStateException(message);
        }
        log.warn("{} Skip sending.", message);
    }

    public String getRecipientEmail() {
        return recipientEmails;
    }

    public List<String> getRecipientEmails() {
        return getRecipientEmailList();
    }

    public int getRecipientCount() {
        return getRecipientEmailList().size();
    }

    public int getDaysBeforeExpiry() {
        return daysBeforeExpiry;
    }

    public String getSenderEmail() {
        return senderEmail;
    }

    public String getCronExpression() {
        return "${app.notifications.price-expiry.cron:0 30 7 * * *}";
    }

    private List<String> getRecipientEmailList() {
        if (recipientEmails == null || recipientEmails.isBlank()) {
            return List.of();
        }
        return Arrays.stream(recipientEmails.split(","))
                .map(String::trim)
                .filter(email -> !email.isBlank())
                .distinct()
                .collect(Collectors.toList());
    }

    private void sendEmail(String recipient, List<PriceExpiryAlertResponse> alerts) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

        helper.setTo(recipient);
        if (senderEmail != null && !senderEmail.isBlank()) {
            helper.setFrom(senderEmail);
        }
        helper.setSubject("[SmallTrend] Cảnh báo giá sắp hết hiệu lực trong 1 ngày");
        helper.setText(buildHtmlContent(alerts), true);

        mailSender.send(message);
    }

    private String buildHtmlContent(List<PriceExpiryAlertResponse> alerts) {
        String rows = alerts.stream()
                .map(alert -> String.format(
                        "<tr><td style='padding:8px;border:1px solid #ddd;'>%s</td><td style='padding:8px;border:1px solid #ddd;'>%s</td><td style='padding:8px;border:1px solid #ddd;'>%s</td></tr>",
                        safe(alert.getVariantName()),
                        safe(alert.getSku()),
                        alert.getExpiryDate() != null ? alert.getExpiryDate().toString() : "N/A"))
                .collect(Collectors.joining());

        return "<div style='font-family:Arial,sans-serif;'>"
                + "<p>Hệ thống ghi nhận các mức giá sẽ hết hiệu lực trong vòng 1 ngày:</p>"
                + "<table style='border-collapse:collapse;width:100%;'>"
                + "<thead><tr>"
                + "<th style='padding:8px;border:1px solid #ddd;background:#f7f7f7;'>Sản phẩm</th>"
                + "<th style='padding:8px;border:1px solid #ddd;background:#f7f7f7;'>SKU</th>"
                + "<th style='padding:8px;border:1px solid #ddd;background:#f7f7f7;'>Ngày hết hiệu lực</th>"
                + "</tr></thead><tbody>"
                + rows
                + "</tbody></table>"
                + "<p style='margin-top:12px;'>Vui lòng cập nhật bảng giá kịp thời.</p>"
                + "</div>";
    }

    private String safe(String value) {
        if (value == null) {
            return "N/A";
        }
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
