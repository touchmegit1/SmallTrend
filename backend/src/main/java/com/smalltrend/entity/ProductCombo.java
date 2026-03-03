package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * Combo sản phẩm - khuyến mãi mua kèm
 */
@Entity
@Table(name = "product_combos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductCombo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String comboCode; // COMBO-202402-001

    @Column(nullable = false, length = 200)
    private String comboName; // Combo tiết kiệm cuối tuần

    @Column(length = 1000)
    private String description;

    @Column(length = 255)
    private String imageUrl; // Ảnh combo (sẽ upload lên Cloudinary)

    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal originalPrice; // Tổng giá gốc các sản phẩm

    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal comboPrice; // Giá combo (đã giảm)

    @Column(precision = 15, scale = 2)
    private BigDecimal savedAmount; // Tiết kiệm được

    @Column(precision = 5, scale = 2)
    private BigDecimal discountPercent; // % giảm giá

    @Column
    private LocalDate validFrom; // Có hiệu lực từ ngày

    @Column
    private LocalDate validTo; // Đến ngày

    @Column
    private Boolean isActive;

    @Column
    private Integer maxQuantityPerOrder; // Tối đa mua bao nhiêu combo/đơn

    @Column
    private Integer totalSold; // Đã bán được bao nhiêu combo

    @Column
    private Integer stockLimit; // Giới hạn số lượng combo có thể bán

    @Column(length = 50)
    private String comboType; // BUNDLE, BUY_X_GET_Y, MIX_AND_MATCH

    @Column
    private Boolean isFeatured; // Hiển thị nổi bật

    @Column
    private Integer displayOrder; // Thứ tự hiển thị

    @Column(length = 100)
    private String tags; // summer,drinks,snacks (phân cách bởi dấu phẩy)

    @Column(length = 20)
    private String status; // ACTIVE, PAUSED, EXPIRED, DRAFT

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        calculateSavings();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        calculateSavings();
    }

    private void calculateSavings() {
        if (originalPrice != null && comboPrice != null) {
            savedAmount = originalPrice.subtract(comboPrice);
            if (originalPrice.compareTo(BigDecimal.ZERO) > 0) {
                discountPercent = savedAmount.multiply(BigDecimal.valueOf(100))
                        .divide(originalPrice, 2, java.math.RoundingMode.HALF_UP);
            }
        }
    }
}
