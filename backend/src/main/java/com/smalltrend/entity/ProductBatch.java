package com.smalltrend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "product_batches")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "variant_id", nullable = false)
    @JsonIgnoreProperties({"productBatches", "inventoryStocks"})
    private ProductVariant variant;

    private String batchNumber;
    private LocalDate mfgDate;
    private LocalDate expiryDate;
    private BigDecimal costPrice;
    
    @OneToMany(mappedBy = "batch")
    @JsonIgnoreProperties({"batch", "variant"})
    private List<InventoryStock> inventoryStocks;
}
