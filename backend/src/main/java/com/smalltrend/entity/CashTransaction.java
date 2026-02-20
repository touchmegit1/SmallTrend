package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * Giao dịch tiền mặt tại quầy - Cash movements
 */
@Entity
@Table(name = "cash_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CashTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String transactionCode; // CASH-IN-001, CASH-OUT-002

    @ManyToOne
    @JoinColumn(name = "register_id", nullable = false)
    private CashRegister cashRegister;

    @Column(nullable = false, length = 20)
    private String transactionType; // CASH_IN, CASH_OUT, OPENING, CLOSING, ADJUSTMENT, TRANSFER

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(precision = 15, scale = 2)
    private BigDecimal balanceBefore; // Số dư trước giao dịch

    @Column(precision = 15, scale = 2)
    private BigDecimal balanceAfter; // Số dư sau giao dịch

    @Column(length = 50)
    private String reason; // SALE, REFUND, CHANGE_FUND, BANK_DEPOSIT, EXPENSE, PETTY_CASH

    @Column(length = 500)
    private String description;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order relatedOrder; // Nếu liên quan đến đơn hàng

    @ManyToOne
    @JoinColumn(name = "performed_by", nullable = false)
    private User performedBy; // Người thực hiện

    @ManyToOne
    @JoinColumn(name = "approved_by")
    private User approvedBy; // Người phê duyệt (cho cash out lớn)

    @Column
    private LocalDateTime approvedAt;

    @Column(length = 20)
    private String status; // PENDING, APPROVED, REJECTED, COMPLETED

    @Column(length = 255)
    private String receiptImageUrl; // Ảnh chứng từ (upload Cloudinary)

    @Column(columnDefinition = "TEXT")
    private String notes;

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
