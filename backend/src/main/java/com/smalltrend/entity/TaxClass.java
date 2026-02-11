package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tax_classes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 100)
    private String code;

    @Column(nullable = false)
    private String name;

    private String description;
}
