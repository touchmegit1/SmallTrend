package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * Quản lý quầy thu ngân - POS / Cash Register
 */
@Entity
@Table(name = "cash_registers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CashRegister {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String registerCode; // POS-001, POS-002

    @Column(nullable = false, length = 100)
    private String registerName; // Quầy 1, Quầy VIP, Quầy Express

    @Column(length = 100)
    private String storeName; // Tên cửa hàng

    @Column(length = 100)
    private String location; // Vị trí cụ thể trong cửa hàng

    @Column(length = 20)
    private String registerType; // MAIN, EXPRESS, SELF_CHECKOUT, MOBILE

    @Column(length = 20)
    private String status; // ACTIVE, INACTIVE, MAINTENANCE

    @Column(length = 100)
    private String deviceId; // Device ID của máy POS
    // Tiền mặt hiện tại
    @Column(precision = 15, scale = 2)
    private BigDecimal currentCash; // Tiền mặt trong ngăn kéo

    @Column(precision = 15, scale = 2)
    private BigDecimal openingBalance; // Số dư đầu ca

    @Column(precision = 15, scale = 2)
    private BigDecimal expectedBalance; // Số dư kỳ vọng

    @Column(precision = 15, scale = 2)
    private BigDecimal variance; // Chênh lệch
    @Column
    private Integer totalTransactionsToday; // Tổng số giao dịch hôm nay

    @Column(precision = 15, scale = 2)
    private BigDecimal totalSalesToday; // Tổng doanh thu hôm nay

    @Column(precision = 15, scale = 2)
    private BigDecimal totalCashToday; // Tổng tiền mặt

    @Column(precision = 15, scale = 2)
    private BigDecimal totalCardToday; // Tổng thẻ

    // Nhân viên hiện tại
    @ManyToOne
    @JoinColumn(name = "current_operator_id")
    private User currentOperator; // Nhân viên đang sử dụng

    @Column
    private LocalDateTime sessionStartTime; // Thời gian bắt đầu ca

    @Column
    private LocalDateTime lastTransactionTime; // Giao dịch cuối cùng

    // Cài đặt
    @Column(precision = 15, scale = 2)
    private BigDecimal maxCashLimit; // Giới hạn tiền mặt tối đa

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "ACTIVE";
        }
        if (currentCash == null) {
            currentCash = BigDecimal.ZERO;
        }
        if (totalTransactionsToday == null) {
            totalTransactionsToday = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (expectedBalance != null && currentCash != null) {
            variance = currentCash.subtract(expectedBalance);
        }
    }
}
