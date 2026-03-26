package com.smalltrend.dto.products;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BarcodeLookupResponse {
    private ProductVariantRespone variant; // Trả về variant gốc (lấy theo base_unit_id nếu là packaging unit)
    private Integer scannedVariantId; // ID của variant chứa barcode đã quét (base hoặc packaging)
    private String unitName; // Tên đơn vị quét (VD: Thùng)
    private BigDecimal unitPrice; // Giá bán (lấy từ UnitConversion hoặc variant)
    private BigDecimal conversionFactor; // Hệ số quy đổi ra base_unit (VD: 48)
    private boolean isBaseUnit; // Có phải là đơn vị gốc hay không?
    private Integer stockAvailable; // Lượng tồn kho khả dụng (tính theo đơn vị base unit)
}
