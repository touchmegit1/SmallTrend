package com.smalltrend.dto.inventory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAdjustRequest {
    @NotNull(message = "Biến thể sản phẩm là bắt buộc")
    private Integer variantId;

    @NotNull(message = "Lô hàng là bắt buộc")
    private Integer batchId;

    @NotNull(message = "Vị trí điều chỉnh là bắt buộc")
    private Integer locationId;

    @NotNull(message = "Số lượng điều chỉnh là bắt buộc")
    private Integer adjustQuantity; // the difference (+/-)

    @NotBlank(message = "Lý do điều chỉnh không được để trống")
    @Size(max = 1000, message = "Lý do điều chỉnh không được vượt quá 1000 ký tự")
    private String reason;
}
