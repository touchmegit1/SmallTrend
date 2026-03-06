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
public class UserProfileDTO {

    private Integer id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String avatarUrl;
    private String role;
    private String status;

    public static UserProfileDTO fromEntity(User user) {
        if (user == null) {
            return null;
        }

        return UserProfileDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole() != null ? user.getRole().getName() : "ROLE_USER")
                .status(user.getStatus())
                .build();
    }
}
