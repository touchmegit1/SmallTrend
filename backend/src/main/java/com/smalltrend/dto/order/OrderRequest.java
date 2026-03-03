package com.smalltrend.dto.order;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequest {

    private String orderCode;
    private Integer customerId;
    private Integer cashierId;
    private Integer cashRegisterId;
    private LocalDateTime orderDate;
    private String paymentMethod;
    private String status;
    private String notes;
    private List<OrderItemRequest> items;
}
