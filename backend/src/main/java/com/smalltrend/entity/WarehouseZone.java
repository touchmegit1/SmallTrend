package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

/**
 * Kho bãi chi tiết - mở rộng từ Location để quản lý chi tiết hơn
 */
@Entity
@Table(name = "warehouse_zones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WarehouseZone {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;
    
    @Column(nullable = false, length = 50)
    private String zoneCode; // A, B, C
    
    @Column(length = 100)
    private String zoneName; // Kho lạnh, Kho khô, Khu vực trưng bày
    
    @Column(length = 50)
    private String zoneType; // COLD, DRY, FROZEN, DISPLAY, STORAGE
    
    @Column(precision = 5, scale = 2)
    private BigDecimal temperature; // Nhiệt độ lưu trữ
    
    @Column(precision = 5, scale = 2)  
    private BigDecimal humidity; // Độ ẩm
    
    @Column
    private Integer maxCapacity; // Sức chứa tối đa (số item)
    
    @Column
    private Integer currentCapacity; // Đang chứa
    
    @Column(length = 20)
    private String status; // ACTIVE, MAINTENANCE, INACTIVE
    
    @Column
    private Boolean isAccessControlled; // Có kiểm soát việc truy cập không
    
    @Column(length = 1000)
    private String accessRoles; // JSON: ["ADMIN", "INVENTORY_STAFF"]
    
    @Column(length = 500)
    private String notes;
    
    @Column
    private LocalDateTime createdAt;
    
    @Column  
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}