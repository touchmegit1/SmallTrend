package com.smalltrend.dto.inventory.count;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryCountItemRequest {
    private Integer productId;

    @NotNull(message = "Biến thể sản phẩm là bắt buộc")
    private Integer variantId;

    @Min(value = 0, message = "Số lượng hệ thống không được âm")
    private Integer systemQuantity;

    @NotNull(message = "Số lượng thực tế là bắt buộc")
    @Min(value = 0, message = "Số lượng thực tế không được âm")
    private Integer actualQuantity;

    private Integer differenceQuantity;

    private BigDecimal differenceValue;

    @Size(max = 1000, message = "Lý do chênh lệch không được vượt quá 1000 ký tự")
    private String reason;

    public Integer getDifferenceQuantity() {
        return differenceQuantity;
    }

    public BigDecimal getDifferenceValue() {
        return differenceValue;
    }
}
