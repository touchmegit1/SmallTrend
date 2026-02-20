package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * Giao dịch điểm tích lũy
 */
@Entity
@Table(name = "loyalty_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String transactionCode; // POINT-EARN-001, POINT-REDEEM-002

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false, length = 20)
    private String transactionType; // EARN, REDEEM, EXPIRE, ADJUST, REFUND, BONUS

    @Column(nullable = false)
    private Integer points; // Số điểm (+/-)

    @Column
    private Integer balanceBefore; // Điểm trước giao dịch

    @Column
    private Integer balanceAfter; // Điểm sau giao dịch

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order relatedOrder; // Nếu liên quan đơn hàng

    @Column(precision = 15, scale = 2)
    private BigDecimal orderAmount; // Giá trị đơn hàng

    @Column(precision = 10, scale = 2)
    private BigDecimal pointsMultiplier; // Hệ số nhân điểm (từ tier)

    @Column(length = 100)
    private String reason; // PURCHASE, BIRTHDAY, REFERRAL, REVIEW, EVENT, MANUAL_ADJUSTMENT

    @Column(length = 500)
    private String description;

    @Column
    private LocalDateTime expiryDate; // Điểm có thời hạn

    @ManyToOne
    @JoinColumn(name = "performed_by")
    private User performedBy; // Nhân viên thực hiện (cho ADJUST)

    @Column(length = 20)
    private String status; // PENDING, COMPLETED, CANCELLED, EXPIRED

    @Column
    private LocalDateTime transactionTime;

    @Column
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (transactionTime == null) {
            transactionTime = LocalDateTime.now();
        }
        if (status == null) {
            status = "PENDING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
