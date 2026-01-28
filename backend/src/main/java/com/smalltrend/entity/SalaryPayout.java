package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "salary_payout")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryPayout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDate payPeriodStart;
    private LocalDate payPeriodEnd;
    private BigDecimal baseAmount;
    private BigDecimal overtimeAmount;
    private BigDecimal totalAmount;
    private LocalDate payDate;
}
