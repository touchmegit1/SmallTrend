package com.smalltrend.dto.inventory;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockImportRequest {
    @NotNull(message = "Biến thể sản phẩm là bắt buộc")
    private Integer variantId;

    private Integer unitId;

    @NotNull(message = "Số lượng nhập là bắt buộc")
    @Positive(message = "Số lượng nhập phải lớn hơn 0")
    private Integer quantity;

    @NotNull(message = "Lô hàng là bắt buộc")
    private Integer batchId;

    @NotNull(message = "Vị trí nhập kho là bắt buộc")
    private Integer locationId;

    @Size(max = 1000, message = "Ghi chú không được vượt quá 1000 ký tự")
    private String notes;
}
