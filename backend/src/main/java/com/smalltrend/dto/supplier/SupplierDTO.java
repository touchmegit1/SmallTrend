package com.smalltrend.dto.supplier;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierDTO {
    private Integer id;
    private String name;

    @JsonProperty("contact_person")
    private String contactPerson;

    private String contact;
    private String phone;
    private String email;
    private String address;
    private String status;
}
