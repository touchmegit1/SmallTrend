package com.smalltrend.dto.inventory.count;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryCountRequest {
    @NotNull(message = "Vị trí kiểm kê là bắt buộc")
    private Integer locationId;

    @Size(max = 1000, message = "Ghi chú không được vượt quá 1000 ký tự")
    private String notes;

    @Size(max = 30, message = "Trạng thái không được vượt quá 30 ký tự")
    private String status; // DRAFT, COUNTING, PENDING, CONFIRMED, REJECTED, CANCELLED

    @Size(max = 1000, message = "Lý do từ chối không được vượt quá 1000 ký tự")
    private String rejectionReason;

    @NotEmpty(message = "Phiếu kiểm kê phải có ít nhất 1 sản phẩm")
    private List<@Valid InventoryCountItemRequest> items;

    public Integer getLocationId() {
        return locationId;
    }

    public List<InventoryCountItemRequest> getItems() {
        return items;
    }
}
