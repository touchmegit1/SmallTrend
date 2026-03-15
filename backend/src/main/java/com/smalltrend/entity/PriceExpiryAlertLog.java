package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Lưu lịch sử đã gửi email cảnh báo giá sắp hết hiệu lực.
 * Unique key giúp chống gửi trùng cho cùng variant_price + ngày + email nhận.
 */
@Entity
@Table(
        name = "price_expiry_alert_logs",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_price_expiry_alert", columnNames = { "variant_price_id", "alert_date", "recipient_email" })
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceExpiryAlertLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "variant_price_id", nullable = false)
    private Integer variantPriceId;

    @Column(name = "alert_date", nullable = false)
    private LocalDate alertDate;

    @Column(name = "recipient_email", nullable = false, length = 255)
    private String recipientEmail;

    @CreationTimestamp
    @Column(name = "sent_at", updatable = false, columnDefinition = "DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6)")
    private LocalDateTime sentAt;
}
