package com.smalltrend.dto.Module1;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductVariantRespone {
    private String name;
    private String sku;
    private BigDecimal sellPrice;
}