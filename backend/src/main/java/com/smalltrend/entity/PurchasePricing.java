package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * Quản lý giá nhập hàng từ nhiều supplier khác nhau theo thời gian
 */
@Entity
@Table(name = "purchase_pricing")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchasePricing {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;
    
    @ManyToOne
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;
    
    @ManyToOne
    @JoinColumn(name = "contract_id")
    private SupplierContract contract; // Hợp đồng áp dụng
    
    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal purchasePrice; // Giá nhập chưa bao gồm thuế
    
    @Column(precision = 12, scale = 2)
    private BigDecimal taxAmount; // Số tiền thuế
    
    @Column(precision = 12, scale = 2)  
    private BigDecimal totalPrice; // Giá cuối cùng bao gồm thuế
    
    @Column(precision = 5, scale = 2)
    private BigDecimal taxRate; // Thuế suất (%)
    
    @Column(length = 10)
    private String currency; // VND, USD
    
    @Column
    private Integer minimumOrderQuantity; // MOQ
    
    @Column  
    private Integer maximumOrderQuantity; // MOQ tối đa
    
    @Column(precision = 5, scale = 2)
    private BigDecimal discountRate; // % chiết khấu
    
    @Column(precision = 12, scale = 2)
    private BigDecimal discountAmount; // Số tiền chiết khấu
    
    @Column(length = 50)
    private String priceType; // FIXED, DISCOUNT_TIER, VOLUME_BASED
    
    @Column
    private LocalDate validFrom; // Có hiệu lực từ ngày
    
    @Column
    private LocalDate validTo; // Đến ngày
    
    @Column
    private Boolean isActive;
    
    @Column
    private Integer leadTimeDays; // Thời gian giao hàng (ngày)
    
    @Column(length = 50)
    private String paymentTerms; // COD, NET30, NET60
    
    @Column(length = 100)
    private String deliveryTerms; // FOB, CIF, EXW
    
    @Column(length = 1000)
    private String notes;
    
    @Column
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        // Tự động tính tổng giá nếu chưa có
        calculateTotalPrice();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        calculateTotalPrice();
    }
    
    private void calculateTotalPrice() {
        if (purchasePrice != null) {
            BigDecimal finalPrice = purchasePrice;
            
            // Trừ chiết khấu
            if (discountRate != null && discountRate.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal discount = purchasePrice.multiply(discountRate).divide(BigDecimal.valueOf(100));
                finalPrice = finalPrice.subtract(discount);
                discountAmount = discount;
            } else if (discountAmount != null) {
                finalPrice = finalPrice.subtract(discountAmount);
            }
            
            // Cộng thuế
            if (taxRate != null && taxRate.compareTo(BigDecimal.ZERO) > 0) {
                taxAmount = finalPrice.multiply(taxRate).divide(BigDecimal.valueOf(100));
                finalPrice = finalPrice.add(taxAmount);
            }
            
            totalPrice = finalPrice;
        }
    }
}