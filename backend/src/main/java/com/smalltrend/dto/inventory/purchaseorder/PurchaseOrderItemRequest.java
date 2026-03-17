package com.smalltrend.dto.inventory.purchaseorder;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderItemRequest {

    @NotNull(message = "Biến thể sản phẩm là bắt buộc")
    private Integer variantId;

    private Integer productId;
    private String sku;
    private String name;

    @NotNull(message = "Số lượng là bắt buộc")
    @Positive(message = "Số lượng sản phẩm phải > 0")
    private Integer quantity;

    @NotNull(message = "Đơn giá nhập là bắt buộc")
    @DecimalMin(value = "0", message = "Đơn giá nhập không được âm")
    private BigDecimal unitCost;

    @DecimalMin(value = "0", message = "Thành tiền không được âm")
    private BigDecimal totalCost;

    @Min(value = 0, message = "Số lượng đã nhận không được âm")
    private Integer receivedQuantity;

    @Size(max = 1000, message = "Ghi chú sản phẩm không được vượt quá 1000 ký tự")
    private String notes;

    private java.time.LocalDate expiryDate;

    @jakarta.validation.constraints.AssertTrue(message = "Hạn sử dụng phải còn ít nhất 6 tháng")
    public boolean isExpiryDateAtLeastSixMonths() {
        return expiryDate == null || !expiryDate.isBefore(LocalDate.now().plusMonths(6));
    }
}
