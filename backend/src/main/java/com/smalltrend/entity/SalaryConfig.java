package com.smalltrend.entity;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "salary_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", unique = true)
    private Roles role;

    @Column(name = "base_salary")
    private BigDecimal baseSalary;

    @Column(name = "hourly_rate")
    private BigDecimal hourlyRate;
}
