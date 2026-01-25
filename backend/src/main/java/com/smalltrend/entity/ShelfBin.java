package com.smalltrend.entity;

import lombok.*;
import jakarta.persistence.*;

@Entity
@Table(name = "shelves_bins")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShelfBin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(name = "bin_code", nullable = false)
    private String binCode; // A-01-01
}
