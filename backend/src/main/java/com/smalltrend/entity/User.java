package com.smalltrend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.smalltrend.entity.enums.SalaryType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // JWT Authentication fields (from old schema)
    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    // Core user info  
    private String fullName;

    @Column(unique = true, length = 100)
    private String email;

    private String phone;
    private String address;
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "salary_type", length = 30)
    @Builder.Default
    private SalaryType salaryType = SalaryType.MONTHLY;

    @Column(name = "base_salary", precision = 12, scale = 2)
    private BigDecimal baseSalary;

    @Column(name = "hourly_rate", precision = 8, scale = 2)
    private BigDecimal hourlyRate;

    @Column(name = "min_required_shifts")
    private Integer minRequiredShifts;

    @Column(name = "count_late_as_present", nullable = false)
    @Builder.Default
    private Boolean countLateAsPresent = true;

    @Column(name = "working_hours_per_month", precision = 6, scale = 2)
    @Builder.Default
    private BigDecimal workingHoursPerMonth = BigDecimal.valueOf(208);

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Status for HR management
    @Builder.Default
    private String status = "ACTIVE";

    // Role relationship 
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;

    // Relationships
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Attendance> attendances;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<SalaryConfig> salaryConfigs;

    // Helper methods for JWT integration
    public boolean isActive() {
        return active != null ? active : false;
    }

    public boolean isAccountNonExpired() {
        return true;
    }

    public boolean isAccountNonLocked() {
        return !"LOCKED".equals(status);
    }

    public boolean isCredentialsNonExpired() {
        return true;
    }

    public String getAuthority() {
        return role != null ? role.getName() : "ROLE_USER";
    }
}
