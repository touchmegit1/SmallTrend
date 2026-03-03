package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "disposal_voucher_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisposalVoucherItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disposal_voucher_id", nullable = false)
    private DisposalVoucher disposalVoucher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private ProductBatch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "batch_code", length = 100)
    private String batchCode;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_cost", precision = 15, scale = 2, nullable = false)
    private BigDecimal unitCost;

    @Column(name = "total_cost", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalCost;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @PrePersist
    @PreUpdate
    protected void calculateTotal() {
        if (quantity != null && unitCost != null) {
            totalCost = unitCost.multiply(BigDecimal.valueOf(quantity));
        }
    }
}
