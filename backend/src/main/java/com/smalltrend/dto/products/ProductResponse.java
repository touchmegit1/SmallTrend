package com.smalltrend.dto.products;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private Integer id;
    private String name;
    private String image_url;
    private String description;
    private Integer brand_id;
    private String brand_name;
    private Integer category_id;
    private String category_name;
    private Integer tax_rate_id;
    private String tax_rate_name;
    private Boolean is_active;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;
    private Integer variant_count;
}
