package com.smalltrend.dto.CRM;

import lombok.Data;

@Data
public class CustomerResponse {
    private Integer id;
    private String name;
    private String phone;
    private long spentAmount;
    private long loyaltyPoints;
}