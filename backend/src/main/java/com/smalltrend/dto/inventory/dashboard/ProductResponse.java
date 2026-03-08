package com.smalltrend.dto.inventory.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Integer id;
    private String name;
    private String imageUrl;
    private String sku;
    private java.math.BigDecimal purchasePrice;
    private Integer stockQuantity;  // Tổng tồn kho từ inventory_stock
    private String unit;            // Đơn vị tính
    private Integer productId;      // Id sản phẩm gốc
    private Integer variantId;      // Id phiên bản
}
