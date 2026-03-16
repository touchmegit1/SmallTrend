package com.smalltrend.dto.inventory.location;

import jakarta.validation.constraints.Min;
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
public class LocationRequest {
    @NotBlank(message = "Tên vị trí không được để trống")
    @Size(max = 100, message = "Tên vị trí không được vượt quá 100 ký tự")
    private String locationName;

    @NotBlank(message = "Mã vị trí không được để trống")
    @Size(max = 50, message = "Mã vị trí không được vượt quá 50 ký tự")
    private String locationCode;

    @NotBlank(message = "Loại vị trí không được để trống")
    @Size(max = 30, message = "Loại vị trí không được vượt quá 30 ký tự")
    private String locationType;

    @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
    private String address;

    @Min(value = 0, message = "Sức chứa phải lớn hơn hoặc bằng 0")
    private Integer capacity;

    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    private String description;
}
