package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "salary_payouts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryPayout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "config_id", nullable = false)
    private SalaryConfig config;

    private Integer month;
    private Integer year;
    private BigDecimal totalPayout;
    private LocalDate paymentDate;
}
