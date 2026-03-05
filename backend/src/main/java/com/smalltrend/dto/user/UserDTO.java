package com.smalltrend.dto.user;

import com.smalltrend.entity.User;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Integer id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String status;
    private String salaryType;
    private BigDecimal baseSalary;
    private BigDecimal hourlyRate;
    private Integer minRequiredShifts;
    private Boolean countLateAsPresent;
    private BigDecimal workingHoursPerMonth;
    private RoleDTO role;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoleDTO {

        private Integer id;
        private String name;
        private String description;
    }

    // Static factory method to convert User entity to DTO
    public static UserDTO fromEntity(User user) {
        if (user == null) {
            return null;
        }

        RoleDTO roleDTO = null;
        if (user.getRole() != null) {
            roleDTO = RoleDTO.builder()
                    .id(user.getRole().getId())
                    .name(user.getRole().getName())
                    .description(user.getRole().getDescription())
                    .build();
        }

        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .status(user.getStatus())
                .salaryType(user.getSalaryType() != null ? user.getSalaryType().name() : null)
                .baseSalary(user.getBaseSalary())
                .hourlyRate(user.getHourlyRate())
                .minRequiredShifts(user.getMinRequiredShifts())
                .countLateAsPresent(user.getCountLateAsPresent())
                .workingHoursPerMonth(user.getWorkingHoursPerMonth())
                .role(roleDTO)
                .build();
    }
}
