package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * Xếp hạng khách hàng dựa trên điểm tích lũy
 */
@Entity
@Table(name = "customer_tiers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 50)
    private String tierCode; // BRONZE, SILVER, GOLD, PLATINUM, DIAMOND

    @Column(nullable = false, length = 100)
    private String tierName; // Đồng, Bạc, Vàng, Bạch kim, Kim cương

    @Column(nullable = false)
    private Integer minPoints; // Điểm tối thiểu để đạt hạng

    @Column
    private Integer maxPoints; // Điểm tối đa của hạng này

    @Column(precision = 15, scale = 2)
    private BigDecimal minSpending; // Tổng chi tiêu tối thiểu để đạt hạng

    @Column(precision = 5, scale = 2, nullable = false)
    private BigDecimal pointsMultiplier; // Hệ số nhân điểm (1.0, 1.5, 2.0)

    @Column(precision = 5, scale = 2)
    private BigDecimal discountRate; // % chiết khấu cho hạng này

    @Column(precision = 10, scale = 2)
    private BigDecimal bonusPoints; // Điểm thưởng khi lên hạng

    @Column(length = 10)
    private String color; // #FFD700 (màu hiển thị)

    @Column(length = 100)
    private String iconUrl; // URL icon hạng thành viên

    // Quyền lợi của hạng
    @Column
    private Boolean freeShipping; // Miễn phí vận chuyển

    @Column
    private Boolean prioritySupport; // Hỗ trợ ưu tiên

    @Column
    private Boolean earlyAccess; // Truy cập sớm chương trình khuyến mãi

    @Column
    private Boolean birthdayBonus; // Quà sinh nhật

    @Column(precision = 5, scale = 2)
    private BigDecimal birthdayBonusPoints; // Điểm thưởng sinh nhật

    @Column
    private Integer expiryMonths; // Thời gian điểm hết hạn (tháng)

    @Column(length = 2000)
    private String benefits; // JSON: ["free_gift", "exclusive_deals"]

    @Column
    private Integer priority; // Thứ tự ưu tiên (1 = cao nhất)

    @Column
    private Boolean isActive;

    @Column(length = 1000)
    private String description;

    @Column
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
