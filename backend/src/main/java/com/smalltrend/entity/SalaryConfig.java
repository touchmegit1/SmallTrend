package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "salary_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private BigDecimal baseSalary;
    private BigDecimal hourlyRate;
    private BigDecimal overtimeRate;
}
