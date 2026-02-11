package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "catalog_rule_products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CatalogRuleProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "rule_id", nullable = false)
    private CatalogPriceRule rule;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
}
