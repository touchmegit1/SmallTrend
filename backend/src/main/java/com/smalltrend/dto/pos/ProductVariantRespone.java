package com.smalltrend.dto.pos;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductVariantRespone {
    private Integer id;
    private String name;
    private String sku;
    private String barcode;
    private BigDecimal sellPrice;
    private Integer stockQuantity;
    private String categoryName;
    private String brandName;
}