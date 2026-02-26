package com.smalltrend.dto.inventory.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Batch response matching the frontend shape (product_id, batch_code, quantity, expiry_date).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductBatchResponse {
    private Integer id;
    private String batchCode;
    private Integer productId;
    private Integer quantity;
    private String expiryDate;
    private String receivedDate;
    private String createdAt;
}
