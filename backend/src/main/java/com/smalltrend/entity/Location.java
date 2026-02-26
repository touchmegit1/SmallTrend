package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @OneToMany(mappedBy = "location")
    private List<InventoryStock> stocks;

    @Transient
    public String getMatrixCoordinate() {
        return String.format("%s-%02d-%02d-L%s", zone, gridRow, gridCol, gridLevel);
    }
}
