package com.smalltrend.dto.inventory.disposal;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisposalVoucherRequest {
    private Long id;

    @NotNull(message = "Vị trí xử lý là bắt buộc")
    private Long locationId;

    @Size(max = 30, message = "Loại lý do không được vượt quá 30 ký tự")
    private String reasonType;

    @Size(max = 1000, message = "Ghi chú không được vượt quá 1000 ký tự")
    private String notes;

    @NotEmpty(message = "Phiếu hủy phải có ít nhất 1 sản phẩm")
    private List<@Valid DisposalVoucherItemRequest> items;
}
