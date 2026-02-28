package com.smalltrend.dto.inventory.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Integer id;
    private String name;
    private String description;
}
