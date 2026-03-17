package com.smalltrend.dto.inventory.purchaseorder;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderRequest {
    private String orderNumber;
    private Integer supplierId;
    private Long contractId;
    private Integer createdBy;
    private Integer locationId;
    private LocalDate expectedDeliveryDate;
    private String status;

    // Financials
    @DecimalMin(value = "0", message = "Giảm giá không được âm")
    private BigDecimal discountAmount;

    @DecimalMin(value = "0", message = "Tiền thuế không được âm")
    private BigDecimal taxAmount;

    @DecimalMin(value = "0", message = "Thuế VAT (%) không được âm")
    private BigDecimal taxPercent;

    @DecimalMin(value = "0", message = "Tạm tính không được âm")
    private BigDecimal subtotal;

    @DecimalMin(value = "0", message = "Tổng tiền không được âm")
    private BigDecimal totalAmount;

    @DecimalMin(value = "0", message = "Phí vận chuyển không được âm")
    private BigDecimal shippingFee;

    @DecimalMin(value = "0", message = "Số tiền đã thanh toán không được âm")
    private BigDecimal paidAmount;

    @Size(max = 1000, message = "Ghi chú không được vượt quá 1000 ký tự")
    private String notes;

    @Size(max = 1000, message = "Lý do từ chối không được vượt quá 1000 ký tự")
    private String rejectionReason;

    // Items
    @NotEmpty(message = "Phiếu nhập phải có ít nhất 1 sản phẩm")
    private List<@Valid PurchaseOrderItemRequest> items;
}
