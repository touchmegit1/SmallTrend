package com.smalltrend.dto.inventory.location;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class LocationTransferRequest {
    @NotNull(message = "Vị trí nguồn không được để trống")
    private Integer fromLocationId;

    @NotNull(message = "Vị trí đích không được để trống")
    private Integer toLocationId;

    @NotNull(message = "Biến thể sản phẩm không được để trống")
    private Integer variantId;

    @NotNull(message = "Lô hàng không được để trống")
    private Integer batchId;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng chuyển phải lớn hơn 0")
    private Integer quantity;

    public Integer getFromLocationId() {
        return fromLocationId;
    }

    public void setFromLocationId(Integer fromLocationId) {
        this.fromLocationId = fromLocationId;
    }

    public Integer getToLocationId() {
        return toLocationId;
    }

    public void setToLocationId(Integer toLocationId) {
        this.toLocationId = toLocationId;
    }

    public Integer getVariantId() {
        return variantId;
    }

    public void setVariantId(Integer variantId) {
        this.variantId = variantId;
    }

    public Integer getBatchId() {
        return batchId;
    }

    public void setBatchId(Integer batchId) {
        this.batchId = batchId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
