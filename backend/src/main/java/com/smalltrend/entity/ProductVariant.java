package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "product_variants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private String sku;
    private String barcode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "unit_id", nullable = false)
    private Unit unit;

    @Column(name = "image_url")
    private String imageUrl;
    private BigDecimal sellPrice;
    private boolean isActive;

    @OneToMany(mappedBy = "variant")
    private List<ProductBatch> productBatches;

    @OneToMany(mappedBy = "variant")
    private List<InventoryStock> inventoryStocks;
}
