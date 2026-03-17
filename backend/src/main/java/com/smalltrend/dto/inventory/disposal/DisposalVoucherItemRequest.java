package com.smalltrend.dto.inventory.disposal;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisposalVoucherItemRequest {
    @NotNull(message = "Lô hàng là bắt buộc")
    private Long batchId;

    private Long productId;

    @NotNull(message = "Số lượng hủy là bắt buộc")
    @Min(value = 1, message = "Số lượng hủy phải lớn hơn 0")
    private Integer quantity;
}
