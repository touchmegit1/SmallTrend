package com.smalltrend.dto.products;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CategoriesResponse {
    private Integer id;
    private String code;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
