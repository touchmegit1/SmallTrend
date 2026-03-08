package com.smalltrend.dto.inventory.location;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FullLocationResponse {
    private Integer id;
    private String locationName;
    private String locationCode;
    private String locationType;
    private String address;
    private Integer capacity;
    private String description;
    private String status;
    private String createdAt;
    private Integer totalProducts;
    private List<LocationStockItemResponse> stockItems;
}
