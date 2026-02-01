package com.smalltrend.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatusRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(active|inactive|ACTIVE|INACTIVE)$", message = "Status must be 'active' or 'inactive'")
    private String status;
}
