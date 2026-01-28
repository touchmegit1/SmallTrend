package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String status;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    @OneToMany(mappedBy = "user")
    private List<Attendance> attendances;

    @OneToMany(mappedBy = "user")
    private List<ShiftAssignment> shiftAssignments;

    @OneToOne(mappedBy = "user")
    private UserCredential userCredential;

    @OneToOne(mappedBy = "user")
    private SalaryConfig salaryConfig;

    @OneToMany(mappedBy = "user")
    private List<SalaryPayout> salaryPayouts;
}
