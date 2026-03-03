package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * Bàn giao ca - Shift Handover
 */
@Entity
@Table(name = "shift_handovers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftHandover {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String handoverCode; // HANDOVER-001

    @ManyToOne
    @JoinColumn(name = "shift_id", nullable = false)
    private WorkShift shift;

    @ManyToOne
    @JoinColumn(name = "from_user_id", nullable = false)
    private User fromUser; // Người bàn giao

    @ManyToOne
    @JoinColumn(name = "to_user_id", nullable = false)
    private User toUser; // Người nhận bàn giao

    @ManyToOne
    @JoinColumn(name = "cash_register_id")
    private CashRegister cashRegister;

    @Column(nullable = false)
    private LocalDateTime handoverTime;

    // Tiền mặt
    @Column(precision = 15, scale = 2)
    private BigDecimal cashAmount; // Số tiền bàn giao

    @Column(precision = 15, scale = 2)
    private BigDecimal expectedCash; // Tiền kỳ vọng

    @Column(precision = 15, scale = 2)
    private BigDecimal actualCash; // Tiền thực tế đếm được

    @Column(precision = 15, scale = 2)
    private BigDecimal variance; // Chênh lệch

    // Chi tiết mệnh giá
    @Column(columnDefinition = "LONGTEXT")
    private String cashBreakdown; // {"500k": 10, "200k": 5, "100k": 20}

    // Thống kê ca làm việc
    @Column
    private Integer totalTransactions; // Tổng số giao dịch trong ca

    @Column(precision = 15, scale = 2)
    private BigDecimal totalSales; // Tổng doanh thu

    @Column(precision = 15, scale = 2)
    private BigDecimal totalRefunds; // Tổng hoàn tiền

    @Column
    private Integer totalCustomers; // Tổng khách hàng

    // Tình trạng thiết bị
    @Column(columnDefinition = "LONGTEXT")
    private String equipmentStatus; // {"printer": "OK", "scanner": "ERROR"}

    // Hàng hóa
    @Column(columnDefinition = "LONGTEXT")
    private String inventoryNotes; // Ghi chú về hàng hóa

    @Column(columnDefinition = "LONGTEXT")
    private String lowStockItems; // Sản phẩm sắp hết: [item_id1, item_id2]

    // Vấn đề phát sinh
    @Column(columnDefinition = "TEXT")
    private String issuesReported; // Vấn đề trong ca

    @Column(columnDefinition = "TEXT")
    private String importantNotes; // Ghi chú quan trọng

    @Column
    private Boolean confirmed; // Đã xác nhận

    @Column
    private LocalDateTime confirmedAt;
    @Column(length = 20)
    private String status; // PENDING, CONFIRMED, DISPUTED, RESOLVED

    @Column(columnDefinition = "TEXT")
    private String disputeReason; // Lý do tranh chấp

    @Column(length = 255)
    private String attachmentUrl; // File đính kèm (Cloudinary)

    @Column
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (handoverTime == null) {
            handoverTime = LocalDateTime.now();
        }
        if (status == null) {
            status = "PENDING";
        }
        if (confirmed == null) {
            confirmed = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        calculateVariance();
    }

    private void calculateVariance() {
        if (actualCash != null && expectedCash != null) {
            variance = actualCash.subtract(expectedCash);
        }
    }
}
