package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Đơn hàng
 */
@Entity
@Table(name = "sale_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String orderCode; // ORD-202602-0001

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "cashier_id")
    private User cashier; // Nhân viên thu ngân

    @ManyToOne
    @JoinColumn(name = "cash_register_id")
    private CashRegister cashRegister;

    @Column(nullable = false)
    private LocalDateTime orderDate;

    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal subtotal; // Tổng phụ (trước thuế và giảm giá)

    @Column(precision = 15, scale = 2)
    private BigDecimal taxAmount; // Thuế

    @Column(precision = 15, scale = 2)
    private BigDecimal discountAmount; // Giảm giá

    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal totalAmount; // Tổng cộng

    @Column(length = 20)
    private String paymentMethod; // CASH, CARD, MOMO, BANK_TRANSFER

    @Column(length = 20)
    private String status; // PENDING, COMPLETED, CANCELLED, REFUNDED

    @Column(columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderStatusHistory> statusHistories = new ArrayList<>();

    @Column
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
        if (orderDate == null) {
            orderDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
