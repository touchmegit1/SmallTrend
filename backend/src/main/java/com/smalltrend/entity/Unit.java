package com.smalltrend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "units")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Unit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "material_type", nullable = false, length = 20)
    private String materialType;

    @Column(length = 20)
    private String symbol;

    @Column(name = "default_sell_price", precision = 12, scale = 2)
    private BigDecimal defaultSellPrice;

    @Column(name = "default_cost_price", precision = 12, scale = 2)
    private BigDecimal defaultCostPrice;

    @OneToMany(mappedBy = "unit")
    @JsonIgnore
    private List<ProductVariant> variants;
}
