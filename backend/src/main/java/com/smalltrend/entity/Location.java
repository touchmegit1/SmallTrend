package com.smalltrend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name")
    private String name;

    @Column(name = "type", nullable = false, length = 30)
    private String warehouseType;

    @Column(name = "zone", nullable = false, length = 30)
    @Builder.Default
    private String zone = "A";

    @Column(name = "grid_row", nullable = false)
    @Builder.Default
    private Integer gridRow = 1;

    @Column(name = "grid_col", nullable = false)
    @Builder.Default
    private Integer gridCol = 1;

    @Column(name = "grid_level", nullable = false)
    @Builder.Default
    private Integer gridLevel = 1;

    @Column(name = "location_code")
    private String locationCode;

    @Column(name = "address")
    private String address;

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "description")
    private String description;

    @Column(name = "status")
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @JsonIgnore
    @OneToMany(mappedBy = "location")
    private List<InventoryStock> stocks;

    @Transient
    public String getType() {
        return warehouseType;
    }

    public void setType(String type) {
        this.warehouseType = type;
    }

    @Transient
    public String getMatrixCoordinate() {
        return String.format("%s-%02d-%02d-L%s", zone, gridRow, gridCol, gridLevel);
    }
}
