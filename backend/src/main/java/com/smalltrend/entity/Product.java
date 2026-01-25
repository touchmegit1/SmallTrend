package com.smalltrend.entity;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String sku; // Stock Keeping Unit - Barcode often

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "purchase_price")
    private BigDecimal purchasePrice; // Giá vốn

    @Column(name = "retail_price")
    private BigDecimal retailPrice; // Giá bán lẻ

    @Column(name = "wholesale_price")
    private BigDecimal wholesalePrice; // Giá bán buôn

    private int stockQuantity;

    private String unit; // e.g: Cái, Hộp, Chai

    private String imageUrl;

    @Column(name = "is_active")
    @Builder.Default
    private boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
