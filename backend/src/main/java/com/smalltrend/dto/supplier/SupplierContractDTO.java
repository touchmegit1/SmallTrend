package com.smalltrend.dto.supplier;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.smalltrend.entity.enums.ContractStatus;

import lombok.Data;

@Data
public class SupplierContractDTO {

    private Long id;
    private Long supplierId;
    private String supplierName;
    private String contractNumber;
    private String title;
    private String description;
    private ContractStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalValue;
    private String currency;
    private String paymentTerms;
    private String deliveryTerms;
    private String signedBySupplier;
    private String signedByCompany;
    private LocalDate signedDate;
    private String notes;
}
