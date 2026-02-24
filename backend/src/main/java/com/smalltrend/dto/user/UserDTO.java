package com.smalltrend.dto.user;

import com.smalltrend.entity.User;
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

        String username = null;
        if (user.getUserCredential() != null) {
            username = user.getUserCredential().getUsername();
        }

        return UserDTO.builder()
                .id(user.getId())
                .username(username)
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .status(user.getStatus())
                .role(roleDTO)
                .build();
    }
}
