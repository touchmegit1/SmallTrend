package com.smalltrend.entity;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // DAILY_SALES, INVENTORY, etc.

    @Column(name = "report_date")
    private LocalDate reportDate;

    @Column(columnDefinition = "TEXT")
    private String data; // JSON string of report data

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private Users createdBy;
}
