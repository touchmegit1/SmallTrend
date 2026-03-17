package com.smalltrend.dto.inventory.purchaseorder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotifyManagerEmailRequest {

    @NotBlank(message = "Tiêu đề thông báo không được để trống")
    @Size(max = 150, message = "Tiêu đề thông báo không được vượt quá 150 ký tự")
    private String subject;

    @NotBlank(message = "Nội dung thông báo không được để trống")
    @Size(max = 2000, message = "Nội dung thông báo không được vượt quá 2000 ký tự")
    private String message;
}
