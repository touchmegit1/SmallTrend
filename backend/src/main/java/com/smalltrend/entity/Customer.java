package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    private String phone;

    @Builder.Default
    @Column(name = "loyalty_points")
    private Integer loyaltyPoints = 0;

    @Builder.Default
    @Column(name = "spent_amount")
    private Long spentAmount = 0L;
}
