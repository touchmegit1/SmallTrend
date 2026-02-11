package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "catalog_rule_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CatalogRuleCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "rule_id", nullable = false)
    private CatalogPriceRule rule;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}
