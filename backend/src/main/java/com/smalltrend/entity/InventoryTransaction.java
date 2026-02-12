package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * Giao dịch kho hàng - tracking mọi hoạt động nhập/xuất/chuyển kho
 */
@Entity
@Table(name = "inventory_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false, length = 50, unique = true)
    private String transactionCode; // TX-202402120001
    
    @Column(length = 30, nullable = false)
    private String transactionType; // IN, OUT, TRANSFER, ADJUSTMENT, RETURN, WASTE
    
    @ManyToOne
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;
    
    @ManyToOne
    @JoinColumn(name = "batch_id")
    private ProductBatch batch;
    
    @ManyToOne
    @JoinColumn(name = "from_bin_id")
    private ShelfBin fromBin; // Từ vị trí nào
    
    @ManyToOne
    @JoinColumn(name = "to_bin_id")
    private ShelfBin toBin; // Đến vị trí nào
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(precision = 12, scale = 2)
    private BigDecimal unitPrice; // Giá tại thời điểm giao dịch
    
    @Column(precision = 15, scale = 2)
    private BigDecimal totalValue; // quantity * unitPrice
    
    @Column(length = 50)
    private String referenceType; // PURCHASE_ORDER, SALES_ORDER, MANUAL_ADJUSTMENT
    
    @Column
    private Integer referenceId; // ID của đơn hàng liên quan
    
    @Column(length = 50)
    private String reason; // Lý do điều chỉnh, chuyển kho
    
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy; // Ai thực hiện
    
    @ManyToOne
    @JoinColumn(name = "approved_by")  
    private User approvedBy; // Ai duyệt
    
    @Column
    private LocalDateTime approvedAt;
    
    @Column(length = 20)
    private String status; // PENDING, APPROVED, REJECTED, COMPLETED
    
    @Column(length = 1000)
    private String notes;
    
    @Column
    private LocalDateTime transactionDate;
    
    @Column
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (transactionDate == null) {
            transactionDate = LocalDateTime.now();
        }
        // Auto calculate total value
        if (quantity != null && unitPrice != null) {
            totalValue = unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        // Recalculate total value if changed
        if (quantity != null && unitPrice != null) {
            totalValue = unitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }
}