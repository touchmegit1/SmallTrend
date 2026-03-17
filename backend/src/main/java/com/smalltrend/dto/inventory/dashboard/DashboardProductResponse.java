package com.smalltrend.dto.inventory.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Flat product shape that matches what the frontend Dashboard expects.
 * Aggregates fields from Product, ProductVariant, InventoryStock, etc.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardProductResponse {
    private Integer id;
    private String sku;
    private String name;
    private String description;
    private String imageUrl;
    private String unit;
    private Boolean isActive;

    // Pricing
    private BigDecimal purchasePrice;
    private BigDecimal retailPrice;

    // Stock
    private Integer stockQuantity;
    private Integer minStock;

    // Relations (IDs for frontend filter)
    private Integer categoryId;
    private String categoryName;
    private Integer brandId;
    private String brandName;
    private Map<String, String> attributes;
}
