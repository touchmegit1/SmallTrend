package com.smalltrend.service;

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
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PriceExpiryAlertEmailScheduler {

    private final VariantPriceService variantPriceService;
    private final PriceExpiryAlertLogRepository alertLogRepository;
    private final JavaMailSender mailSender;

    @Value("${app.notifications.price-expiry.recipient:admin.smalltrend.swp@gmail.com}")
    private String recipientEmail;

    @Value("${app.notifications.price-expiry.days-before:1}")
    private int daysBeforeExpiry;

    @Value("${spring.mail.username:}")
    private String senderEmail;

    @Scheduled(cron = "${app.notifications.price-expiry.cron:0 30 7 * * *}")
    public void sendPriceExpiryAlerts() {
        sendPriceExpiryAlertsInternal();
    }

    public int sendPriceExpiryAlertsNow() {
        return sendPriceExpiryAlertsInternal();
    }

    private int sendPriceExpiryAlertsInternal() {
        LocalDate today = LocalDate.now();

        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.warn("Price expiry recipient email is empty. Skip sending.");
            return 0;
        }

        List<PriceExpiryAlertResponse> alerts = variantPriceService.getPriceExpiryAlerts(daysBeforeExpiry);
        if (alerts.isEmpty()) {
            log.debug("No price expiry alerts for email today.");
            return 0;
        }

        List<PriceExpiryAlertResponse> unsentAlerts = alerts.stream()
                .filter(alert -> !alertLogRepository.existsByVariantPriceIdAndAlertDateAndRecipientEmail(
                        alert.getVariantPriceId(),
                        today,
                        recipientEmail))
                .collect(Collectors.toList());

        if (unsentAlerts.isEmpty()) {
            log.debug("All price expiry alerts already sent today.");
            return 0;
        }

        try {
            sendEmail(recipientEmail, unsentAlerts);

            unsentAlerts.forEach(alert -> alertLogRepository.save(
                    PriceExpiryAlertLog.builder()
                            .variantPriceId(alert.getVariantPriceId())
                            .alertDate(today)
                            .recipientEmail(recipientEmail)
                            .build()
            ));

            log.info("Sent price expiry alert email to {} with {} items.", recipientEmail, unsentAlerts.size());
            return unsentAlerts.size();
        } catch (Exception e) {
            log.error("Failed to send price expiry alert email", e);
            return 0;
        }
    }

    public String getRecipientEmail() {
        return recipientEmail;
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
                        alert.getExpiryDate() != null ? alert.getExpiryDate().toString() : "N/A"
                ))
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
