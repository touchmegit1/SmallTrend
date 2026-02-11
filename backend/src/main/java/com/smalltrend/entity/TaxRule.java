package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "tax_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "zone_id", nullable = false)
    private TaxZone zone;

    @ManyToOne
    @JoinColumn(name = "class_id", nullable = false)
    private TaxClass taxClass;

    @ManyToOne
    @JoinColumn(name = "tax_rate_id", nullable = false)
    private TaxRate taxRate;

    private Integer priority;
    private boolean compound;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isActive;
}
