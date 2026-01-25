package com.smalltrend.config;

import com.smalltrend.entity.Roles;
import com.smalltrend.repository.*;
import lombok.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        if (roleRepository.count() == 0) {
            roleRepository.save(Roles.builder().name("Admin").description("Quản trị viên hệ thống").build());
            roleRepository.save(Roles.builder().name("Manager").description("Quản lý cửa hàng").build());
            roleRepository.save(Roles.builder().name("Cashier Staff").description("Nhân viên thu ngân").build());
            roleRepository.save(Roles.builder().name("Inventory Staff").description("Nhân viên kho").build());
            System.out.println("✅ Đã insert 4 roles vào database");
        }
    }
}
