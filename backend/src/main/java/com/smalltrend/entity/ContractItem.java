package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

/**
 * Chi tiết sản phẩm trong hợp đồng với supplier
 */
@Entity
@Table(name = "contract_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "contract_id", nullable = false)
    private SupplierContract contract;
    
    @ManyToOne
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;
    
    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal unitPrice; // Giá đơn vị theo hợp đồng
    
    @Column
    private Integer minimumQuantity; // Số lượng tối thiểu phải đặt
    
    @Column
    private Integer maximumQuantity; // Số lượng tối đa được phép đặt
    
    @Column(precision = 15, scale = 2)
    private BigDecimal totalCommittedValue; // Tổng giá trị cam kết mua
    
    @Column
    private Integer currentOrderedQuantity; // Đã đặt hàng bao nhiêu
    
    @Column(precision = 15, scale = 2)
    private BigDecimal currentOrderedValue; // Giá trị đã đặt hàng
    
    @Column(length = 10)
    private String currency; // VND, USD
    
    @Column(precision = 5, scale = 2)
    private BigDecimal discountRate; // % chiết khấu theo volume
    
    @Column(length = 50)
    private String qualityGrade; // A, B, C - chất lượng sản phẩm
    
    @Column(length = 50)
    private String packagingType; // BULK, BOX, PALLET
    
    @Column
    private Integer unitsPerPackage; // Số đơn vị trong 1 gói
    
    @Column(length = 100)
    private String packagingSpecification; // Thông số đóng gói
    
    @Column
    private Integer warrantyPeriodDays; // Thời gian bảo hành (ngày)
    
    @Column(length = 50)
    private String returnPolicy; // RETURNABLE, NON_RETURNABLE, CONDITIONAL
    
    @Column(precision = 5, scale = 2)
    private BigDecimal defectAllowanceRate; // % lỗi cho phép
    
    @Column(length = 1000)
    private String qualityRequirements; // Yêu cầu chất lượng chi tiết
    
    @Column(length = 1000)
    private String notes;
}