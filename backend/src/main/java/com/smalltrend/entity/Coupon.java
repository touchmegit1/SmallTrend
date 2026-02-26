package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * Mã giảm giá / Coupon / Voucher nâng cao
 */
@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String couponCode; // SUMMER2024, FREESHIP50K, WELCOME10

    @Column(nullable = false, length = 200)
    private String couponName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 30)
    private String couponType; // PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING, BUY_X_GET_Y, CASHBACK

    @ManyToOne
    @JoinColumn(name = "campaign_id")
    private Campaign campaign; // Thuộc chiến dịch nào

    // Giá trị giảm
    @Column(precision = 5, scale = 2)
    private BigDecimal discountPercent; // Giảm % (0-100)

    @Column(precision = 15, scale = 2)
    private BigDecimal discountAmount; // Giảm tiền cố định

    @Column(precision = 15, scale = 2)
    private BigDecimal maxDiscountAmount; // Giảm tối đa (cho % discount)

    // Điều kiện áp dụng
    @Column(precision = 15, scale = 2)
    private BigDecimal minPurchaseAmount; // Đơn hàng tối thiểu

    @Column
    private Integer minQuantity; // Số lượng sản phẩm tối thiểu

    @Column(columnDefinition = "LONGTEXT")
    private String allowedCategories; // [1, 2, 3]
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column
    private LocalDateTime startTime; // Thời điểm cụ thể

    @Column
    private LocalDateTime endTime;

    // Giới hạn sử dụng
    @Column
    private Integer totalUsageLimit; // Tổng số lần sử dụng

    @Column
    private Integer usagePerCustomer; // Số lần/khách

    @Column
    private Integer currentUsageCount; // Đã dùng bao nhiêu lần

    // Buy X Get Y
    @Column
    private Integer buyQuantity; // Mua X

    @Column
    private Integer getQuantity; // Được Y

    // Trạng thái
    @Column(length = 20)
    private String status; // DRAFT, ACTIVE, EXPIRED
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(columnDefinition = "TEXT")
    private String internalNotes;

    @Column
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "DRAFT";
        }
        if (currentUsageCount == null) {
            currentUsageCount = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        // Tự động cập nhật status khi hết hạn
        if (status != null && status.equals("ACTIVE") && LocalDate.now().isAfter(endDate)) {
            status = "EXPIRED";
        }
    }
}
