package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_gifts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoyaltyGift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "required_points", nullable = false)
    private Integer requiredPoints;

    @Column(nullable = false)
    private Integer stock;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        isActive = true;
    }
}
