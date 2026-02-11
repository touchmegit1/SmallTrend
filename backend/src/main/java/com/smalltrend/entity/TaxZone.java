package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tax_zones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxZone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(length = 2)
    private String countryCode;

    private String stateRegion;
    private String city;
    private String postalCodeFrom;
    private String postalCodeTo;
    private boolean isActive;
}
