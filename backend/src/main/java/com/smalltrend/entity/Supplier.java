package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "suppliers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(name = "tax_code", unique = true)
    private String taxCode;

    private String address;
    private String email;
    private String phone;

    @Column(name = "contact_person")
    private String contactPerson;

    // Store contract file URLs as serialized JSON text from Cloudinary
    @Column(name = "contract_files", columnDefinition = "LONGTEXT")
    private String contractFiles;

    @Column(name = "contract_signed_date")
    private LocalDate contractSignedDate;

    @Column(name = "contract_expiry")
    private LocalDate contractExpiry;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    private void autoCalculate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();

        // Default active if not set
        if (active == null) {
            active = true;
        }
    }
}
