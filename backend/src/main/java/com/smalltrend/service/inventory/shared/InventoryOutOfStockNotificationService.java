package com.smalltrend.service.inventory.shared;

import com.smalltrend.entity.InventoryStock;
import com.smalltrend.entity.ProductBatch;
import com.smalltrend.entity.User;
import com.smalltrend.repository.InventoryStockRepository;
import com.smalltrend.repository.ProductBatchRepository;
import com.smalltrend.repository.UserRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryOutOfStockNotificationService {

    private static final List<String> MANAGER_ROLE_NAMES = List.of("MANAGER", "ROLE_MANAGER");

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;
    private final InventoryStockRepository inventoryStockRepository;
    private final ProductBatchRepository productBatchRepository;

    private final ConcurrentHashMap<String, Boolean> activeOutOfStockKeys = new ConcurrentHashMap<>();

    @Value("${spring.mail.username:}")
    private String senderEmail;

    @Value("${spring.mail.password:}")
    private String senderPassword;

    @Value("${app.notifications.inventory.out-of-stock.recipients:}")
    private String overrideRecipients;

    @Value("${app.notifications.inventory.out-of-stock.daily-enabled:true}")
    private boolean dailyEnabled;

    @Value("${app.notifications.inventory.expired-batch.daily-enabled:true}")
    private boolean expiredBatchDailyEnabled;

    @Scheduled(cron = "${app.notifications.inventory.out-of-stock.daily-cron:0 05 7 * * *}")
    public void sendDailyOutOfStockSummary() {
        if (!dailyEnabled) {
            return;
        }
        if (!isMailConfigValid()) {
            log.warn("Skip daily out-of-stock summary because mail config is missing.");
            return;
        }

        List<String> recipients = getRecipients();
        if (recipients.isEmpty()) {
            log.warn("Skip daily out-of-stock summary because recipients are empty.");
            return;
        }

        List<InventoryStock> outOfStockItems = inventoryStockRepository.findOutOfStockWithDetails();
        if (outOfStockItems.isEmpty()) {
            log.debug("No out-of-stock items for daily summary.");
            return;
        }

        String subject = "[SmallTrend] Tổng hợp sản phẩm hết hàng - " + LocalDateTime.now().toLocalDate();
        String html = buildDailySummaryHtml(outOfStockItems);

        for (String recipient : recipients) {
            try {
                sendEmail(recipient, subject, html);
            } catch (Exception ex) {
                log.error("Failed to send daily out-of-stock summary to {}", recipient, ex);
            }
        }
    }

    @Scheduled(cron = "${app.notifications.inventory.expired-batch.daily-cron:0 15 7 * * *}")
    public void sendDailyExpiredBatchSummary() {
        if (!expiredBatchDailyEnabled) {
            return;
        }
        if (!isMailConfigValid()) {
            log.warn("Skip daily expired-batch summary because mail config is missing.");
            return;
        }

        List<String> recipients = getRecipients();
        if (recipients.isEmpty()) {
            log.warn("Skip daily expired-batch summary because recipients are empty.");
            return;
        }

        List<ProductBatch> expiredBatches = productBatchRepository.findExpiredBatches(LocalDate.now());
        if (expiredBatches.isEmpty()) {
            log.debug("No expired batches for daily summary.");
            return;
        }

        String subject = "[SmallTrend] Tổng hợp lô hết hạn - " + LocalDateTime.now().toLocalDate();
        String html = buildDailyExpiredBatchSummaryHtml(expiredBatches);

        for (String recipient : recipients) {
            try {
                sendEmail(recipient, subject, html);
            } catch (Exception ex) {
                log.error("Failed to send daily expired-batch summary to {}", recipient, ex);
            }
        }
    }

    public void handleStockTransition(InventoryStock stock, Integer oldQty, Integer newQty, String source) {
        if (stock == null) {
            return;
        }

        int previous = oldQty != null ? oldQty : 0;
        int current = newQty != null ? newQty : 0;
        String key = buildStockKey(stock);

        if (previous == 0 && current > 0) {
            activeOutOfStockKeys.remove(key);
            return;
        }

        if (previous > 0 && current == 0) {
            if (Boolean.TRUE.equals(activeOutOfStockKeys.get(key))) {
                return;
            }

            boolean delivered = sendRealtimeOutOfStockAlert(stock, source);
            if (delivered) {
                activeOutOfStockKeys.put(key, true);
            }
        }
    }

    private boolean sendRealtimeOutOfStockAlert(InventoryStock stock, String source) {
        if (!isMailConfigValid()) {
            log.warn("Skip realtime out-of-stock alert because mail config is missing.");
            return false;
        }

        List<String> recipients = getRecipients();
        if (recipients.isEmpty()) {
            log.warn("Skip realtime out-of-stock alert because recipients are empty.");
            return false;
        }

        String productName = stock.getVariant() != null && stock.getVariant().getProduct() != null
                ? safe(stock.getVariant().getProduct().getName())
                : "N/A";
        String sku = stock.getVariant() != null ? safe(stock.getVariant().getSku()) : "N/A";
        String batchCode = stock.getBatch() != null ? safe(stock.getBatch().getBatchNumber()) : "N/A";
        String locationName = stock.getLocation() != null ? safe(stock.getLocation().getName()) : "N/A";

        String subject = "[SmallTrend] Cảnh báo hết hàng: " + productName + " (" + sku + ")";
        String html = "<div style='font-family:Arial,sans-serif;'>"
                + "<p><strong>Cảnh báo tồn kho theo thời gian thực</strong></p>"
                + "<p>Sản phẩm vừa chuyển về mức hết hàng (0).</p>"
                + "<ul>"
                + "<li>Sản phẩm: <strong>" + productName + "</strong></li>"
                + "<li>SKU: <strong>" + sku + "</strong></li>"
                + "<li>Lô: <strong>" + batchCode + "</strong></li>"
                + "<li>Vị trí: <strong>" + locationName + "</strong></li>"
                + "<li>Nguồn cập nhật: <strong>" + safe(source) + "</strong></li>"
                + "<li>Thời gian: <strong>" + LocalDateTime.now() + "</strong></li>"
                + "</ul>"
                + "</div>";

        for (String recipient : recipients) {
            CompletableFuture.runAsync(() -> {
                try {
                    sendEmail(recipient, subject, html);
                } catch (Exception ex) {
                    log.error("Failed to send realtime out-of-stock alert to {}", recipient, ex);
                }
            });
        }

        return true; // dispatch async send to avoid blocking stock update request
    }


    private String buildDailySummaryHtml(List<InventoryStock> outOfStockItems) {
        String rows = outOfStockItems.stream()
                .map(item -> {
                    String productName = item.getVariant() != null && item.getVariant().getProduct() != null
                            ? safe(item.getVariant().getProduct().getName())
                            : "N/A";
                    String sku = item.getVariant() != null ? safe(item.getVariant().getSku()) : "N/A";
                    String batchCode = item.getBatch() != null ? safe(item.getBatch().getBatchNumber()) : "N/A";
                    String locationName = item.getLocation() != null ? safe(item.getLocation().getName()) : "N/A";
                    return "<tr>"
                            + "<td style='padding:8px;border:1px solid #ddd;'>" + productName + "</td>"
                            + "<td style='padding:8px;border:1px solid #ddd;'>" + sku + "</td>"
                            + "<td style='padding:8px;border:1px solid #ddd;'>" + batchCode + "</td>"
                            + "<td style='padding:8px;border:1px solid #ddd;'>" + locationName + "</td>"
                            + "<td style='padding:8px;border:1px solid #ddd;text-align:right;'>0</td>"
                            + "</tr>";
                })
                .collect(Collectors.joining());

        return "<div style='font-family:Arial,sans-serif;'>"
                + "<p><strong>Tổng hợp sản phẩm hết hàng trong kho</strong></p>"
                + "<p>Số dòng hết hàng: <strong>" + outOfStockItems.size() + "</strong></p>"
                + "<table style='border-collapse:collapse;width:100%;'>"
                + "<thead><tr>"
                + "<th style='padding:8px;border:1px solid #ddd;background:#f7f7f7;'>Sản phẩm</th>"
                + "<th style='padding:8px;border:1px solid #ddd;background:#f7f7f7;'>SKU</th>"
                + "<th style='padding:8px;border:1px solid #ddd;background:#f7f7f7;'>Lô</th>"
                + "<th style='padding:8px;border:1px solid #ddd;background:#f7f7f7;'>Vị trí</th>"
                + "<th style='padding:8px;border:1px solid #ddd;background:#f7f7f7;'>Số lượng</th>"
                + "</tr></thead><tbody>"
                + rows
                + "</tbody></table>"
                + "</div>";
    }

    private String buildDailyExpiredBatchSummaryHtml(List<ProductBatch> expiredBatches) {
        LocalDate today = LocalDate.now();

        String rows = expiredBatches.stream()
                .map(batch -> {
                    String productName = batch.getVariant() != null && batch.getVariant().getProduct() != null
                            ? safe(batch.getVariant().getProduct().getName())
                            : "N/A";
                    String sku = batch.getVariant() != null ? safe(batch.getVariant().getSku()) : "N/A";
                    String batchCode = safe(batch.getBatchNumber());
                    String expiryDate = batch.getExpiryDate() != null ? batch.getExpiryDate().toString() : "N/A";
                    String daysExpired = batch.getExpiryDate() != null
                            ? String.valueOf(ChronoUnit.DAYS.between(batch.getExpiryDate(), today))
                            : "N/A";
                    return "<tr>"
                            + "<td style='padding:8px;border:1px solid #ddd;'>" + productName + "</td>"
                            + "<td style='padding:8px;border:1px solid #ddd;'>" + sku + "</td>"
                            + "<td style='padding:8px;border:1px solid #ddd;'>" + batchCode + "</td>"
                            + "<td style='padding:8px;border:1px solid #ddd;'>" + expiryDate + "</td>"
                            + "<td style='padding:8px;border:1px solid #ddd;text-align:right;'>" + daysExpired + "</td>"
                            + "</tr>";
                })
                .collect(Collectors.joining());

        return "<div style='font-family:Arial,sans-serif;'>"
                + "<p><strong>Tổng hợp lô đã hết hạn</strong></p>"
                + "<p>Số lô hết hạn: <strong>" + expiredBatches.size() + "</strong></p>"
                + "<table style='border-collapse:collapse;width:100%;'>"
                + "<thead><tr>"
                + "<th style='padding:8px;border:1px solid #ddd;background:#f7f7f7;'>Sản phẩm</th>"
                + "<th style='padding:8px;border:1px solid #ddd;background:#f7f7f7;'>SKU</th>"
                + "<th style='padding:8px;border:1px solid #ddd;background:#f7f7f7;'>Mã lô</th>"
                + "<th style='padding:8px;border:1px solid #ddd;background:#f7f7f7;'>Ngày hết hạn</th>"
                + "<th style='padding:8px;border:1px solid #ddd;background:#f7f7f7;'>Số ngày quá hạn</th>"
                + "</tr></thead><tbody>"
                + rows
                + "</tbody></table>"
                + "</div>";
    }

    private void sendEmail(String recipient, String subject, String htmlContent) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

        helper.setTo(recipient);
        helper.setFrom(senderEmail);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    private List<String> getRecipients() {
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

    private boolean isMailConfigValid() {
        return senderEmail != null && !senderEmail.isBlank()
                && senderPassword != null && !senderPassword.isBlank();
    }

    private String buildStockKey(InventoryStock stock) {
        Integer variantId = stock.getVariant() != null ? stock.getVariant().getId() : null;
        Integer batchId = stock.getBatch() != null ? stock.getBatch().getId() : null;
        Integer locationId = stock.getLocation() != null ? stock.getLocation().getId() : null;
        return String.valueOf(variantId) + ":" + batchId + ":" + locationId;
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
