package com.smalltrend.dto.inventory.location;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationResponse {
    private Integer id;
    private String name;
    private String type;
}
