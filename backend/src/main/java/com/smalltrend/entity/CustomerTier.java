package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * Xếp hạng khách hàng dựa trên tổng chi tiêu (spent_amount)
 */
@Entity
@Table(name = "customer_tiers", uniqueConstraints = {
    @UniqueConstraint(columnNames = "tier_code", name = "uk_tier_code")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "tier_code", nullable = false, length = 50, unique = true)
    private String tierCode; // BRONZE, SILVER, GOLD, PLATINUM, DIAMOND

    @Column(nullable = false, length = 100)
    private String tierName; // Đồng, Bạc, Vàng, Bạch kim, Kim cương

    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal minSpending; // Tổng chi tiêu tối thiểu (VNĐ) để đạt hạng

    @Column(precision = 5, scale = 2, nullable = false)
    private BigDecimal pointsMultiplier; // Hệ số nhân điểm (1.0, 1.5, 2.0)

    @Column(precision = 5, scale = 2)
    private BigDecimal discountRate; // % chiết khấu cố định cho hạng này

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
    private Integer priority; // Thứ tự ưu tiên (1 = thấp nhất → cao nhất)

    @Column
    private Boolean isActive; // Trạng thái kích hoạt của hạng

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
