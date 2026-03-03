package com.smalltrend.entity;

import com.smalltrend.entity.enums.DisposalReason;
import com.smalltrend.entity.enums.DisposalStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "disposal_vouchers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisposalVoucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DisposalStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "reason_type", nullable = false, length = 20)
    private DisposalReason reasonType;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "total_items", nullable = false)
    private Integer totalItems = 0;

    @Column(name = "total_quantity", nullable = false)
    private Integer totalQuantity = 0;

    @Column(name = "total_value", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalValue = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "confirmed_by")
    private User confirmedBy;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Version
    private Long version; // Optimistic locking

    @OneToMany(mappedBy = "disposalVoucher", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DisposalVoucherItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = DisposalStatus.DRAFT;
        }
    }

    public void addItem(DisposalVoucherItem item) {
        items.add(item);
        item.setDisposalVoucher(this);
    }

    public void removeItem(DisposalVoucherItem item) {
        items.remove(item);
        item.setDisposalVoucher(null);
    }

    public void recalculateTotals() {
        this.totalItems = items.size();
        this.totalQuantity = items.stream().mapToInt(DisposalVoucherItem::getQuantity).sum();
        this.totalValue = items.stream()
                .map(DisposalVoucherItem::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
