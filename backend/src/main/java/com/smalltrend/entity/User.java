package com.smalltrend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @Column(name = "search_vector", columnDefinition = "tsvector")
    private String searchVector;
}
