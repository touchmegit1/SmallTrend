package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "catalog_rule_brands")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CatalogRuleBrand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "rule_id", nullable = false)
    private CatalogPriceRule rule;

    @ManyToOne
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;
}
