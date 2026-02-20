package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * Lịch sử sử dụng coupon của khách hàng
 */
@Entity
@Table(name = "coupon_usage")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "coupon_id", nullable = false)
    private Coupon coupon;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(nullable = false, length = 50)
    private String usageCode; // USAGE-001

    @Column(precision = 15, scale = 2)
    private BigDecimal orderAmount; // Giá trị đơn hàng

    @Column(precision = 15, scale = 2)
    private BigDecimal discountAmount; // Số tiền được giảm

    @Column(length = 20)
    private String status; // APPLIED, REDEEMED, CANCELLED, REFUNDED

    @Column
    private LocalDateTime appliedAt; // Thời điểm áp dụng

    @Column
    private LocalDateTime redeemedAt; // Thời điểm sử dụng thành công

    @Column(length = 255)
    private String cancelReason; // Lý do hủy

    @Column
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (appliedAt == null) {
            appliedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
