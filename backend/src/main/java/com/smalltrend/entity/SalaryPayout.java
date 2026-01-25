package com.smalltrend.entity;

import lombok.*;
import jakarta.persistence.*;
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
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "config_id")
    private SalaryConfig config;

    private int month;
    private int year;

    @Column(name = "total_payout")
    private BigDecimal totalPayout;

    @Column(name = "payment_date")
    private LocalDate paymentDate;
}
