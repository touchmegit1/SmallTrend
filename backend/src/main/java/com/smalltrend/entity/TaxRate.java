package com.smalltrend.entity;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "tax_rates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxRate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g. VAT 8%, VAT 10%

    @Column(nullable = false)
    private double rate; // 0.08, 0.10

    @Column(name = "is_active")
    @Builder.Default
    private boolean isActive = true;
}
