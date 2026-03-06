package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Hợp đồng quảng cáo — quản lý 2 slot quảng cáo 2 bên trang chủ.
 */
@Entity
@Table(name = "advertisements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Advertisement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** LEFT | RIGHT — chỉ 1 bản ghi active mỗi slot tại một thời điểm */
    @Column(name = "slot", nullable = false, length = 10)
    private String slot;

    @Column(name = "sponsor_name", nullable = false, length = 200)
    private String sponsorName;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "subtitle", length = 300)
    private String subtitle;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "link_url", length = 500)
    private String linkUrl;

    @Column(name = "cta_text", length = 100)
    private String ctaText;

    @Column(name = "cta_color", length = 10)
    private String ctaColor;

    @Column(name = "bg_color", length = 10)
    private String bgColor;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    // ─── Hợp đồng ────────────────────────────────────────────────────────────

    @Column(name = "contract_number", length = 100)
    private String contractNumber;

    @Column(name = "contract_value", precision = 15, scale = 2)
    private BigDecimal contractValue;

    @Column(name = "contract_start")
    private LocalDate contractStart;

    @Column(name = "contract_end")
    private LocalDate contractEnd;

    @Column(name = "payment_terms", length = 500)
    private String paymentTerms;

    @Column(name = "contact_person", length = 200)
    private String contactPerson;

    @Column(name = "contact_email", length = 200)
    private String contactEmail;

    @Column(name = "contact_phone", length = 50)
    private String contactPhone;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // ─── Timestamps ───────────────────────────────────────────────────────────

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
