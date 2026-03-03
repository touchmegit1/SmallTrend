package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "inventory_counts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryCount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true)
    private String code;

    private String status; // DRAFT, COUNTING, CONFIRMED, CANCELLED

    @ManyToOne
    @JoinColumn(name = "location_id")
    private Location location;

    private String notes;

    private BigDecimal totalShortageValue;
    private BigDecimal totalOverageValue;
    private BigDecimal totalDifferenceValue;

    private Integer createdBy;
    private Integer confirmedBy;

    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;

    @OneToMany(mappedBy = "inventoryCount", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InventoryCountItem> items;
}
