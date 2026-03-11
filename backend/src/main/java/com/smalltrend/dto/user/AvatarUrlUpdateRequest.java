package com.smalltrend.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvatarUrlUpdateRequest {

    @NotBlank(message = "Avatar URL is required")
    private String avatarUrl;
}
