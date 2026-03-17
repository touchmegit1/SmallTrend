package com.smalltrend.dto.inventory.purchaseorder;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
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
public class GoodsReceiptRequest {
    @Size(max = 1000, message = "Ghi chú không được vượt quá 1000 ký tự")
    private String notes;

    private Integer supplierId;
    private Integer locationId;

    @DecimalMin(value = "0", message = "Thuế VAT (%) không được âm")
    private BigDecimal taxPercent;

    @DecimalMin(value = "0", message = "Phí vận chuyển không được âm")
    private BigDecimal shippingFee;

    @DecimalMin(value = "0", message = "Tạm tính không được âm")
    private BigDecimal subtotal;

    @DecimalMin(value = "0", message = "Tiền thuế không được âm")
    private BigDecimal taxAmount;

    @DecimalMin(value = "0", message = "Tổng tiền không được âm")
    private BigDecimal totalAmount;

    @Size(max = 1000, message = "Lý do thiếu hàng không được vượt quá 1000 ký tự")
    private String shortageReason;

    @NotEmpty(message = "Phiếu nhập phải có ít nhất 1 sản phẩm")
    private List<@Valid GoodsReceiptItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoodsReceiptItemRequest {
        @NotNull(message = "ID dòng phiếu nhập là bắt buộc")
        private Integer itemId;       // PurchaseOrderItem id

        private Integer variantId;

        @NotNull(message = "Số lượng thực nhận là bắt buộc")
        @Min(value = 0, message = "Số lượng thực nhận không hợp lệ")
        private Integer receivedQuantity;

        @NotNull(message = "Đơn giá nhập là bắt buộc")
        @DecimalMin(value = "0", message = "Đơn giá nhập không được âm")
        private java.math.BigDecimal unitCost;

        private java.time.LocalDate expiryDate;

        @AssertTrue(message = "Hạn sử dụng phải còn ít nhất 6 tháng")
        public boolean isExpiryDateAtLeastSixMonths() {
            return expiryDate == null || !expiryDate.isBefore(LocalDate.now().plusMonths(6));
        }

        @Size(max = 1000, message = "Ghi chú kiểm kê không được vượt quá 1000 ký tự")
        private String notes;         // Ghi chú kiểm kê
    }
}
