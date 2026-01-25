package com.smalltrend;

import com.smalltrend.entity.Roles;
import com.smalltrend.entity.Users;
import com.smalltrend.repository.RoleRepository;
import com.smalltrend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Set;

@SpringBootApplication
public class SmallTrendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmallTrendApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(UserRepository userRepository,
									  RoleRepository roleRepository,
									  PasswordEncoder passwordEncoder) {
		return args -> {
			// 1. Tạo Role ADMIN và USER nếu chưa có
			Roles adminRole = roleRepository.findByName("ROLE_ADMIN").orElseGet(() -> {
				Roles role = new Roles();
				role.setName("ROLE_ADMIN");
				role.setDescription("Administrator role");
				return roleRepository.save(role);
			});

			Roles userRole = roleRepository.findByName("ROLE_USER").orElseGet(() -> {
				Roles role = new Roles();
				role.setName("ROLE_USER");
				role.setDescription("Standard user role");
				return roleRepository.save(role);
			});

			// 2. Tạo hoặc Cập nhật User Admin
			Users admin = userRepository.findByUsername("admin").orElse(new Users());

			if (admin.getId() == null) {
				// User chưa tồn tại -> Tạo mới
				admin.setUsername("admin");
				admin.setEmail("admin@gmail.com");
			}

			// LUÔN LUÔN Reset mật khẩu về giá trị mặc định để đảm bảo đăng nhập được
			admin.setPassword(passwordEncoder.encode("password123"));

			if (admin.getRoles() == null || admin.getRoles().isEmpty()) {
				Set<Roles> roles = new HashSet<>();
				roles.add(adminRole);
				roles.add(userRole);
				admin.setRoles(roles);
			}

			userRepository.save(admin);
			System.out.println(">>> Admin user updated/created: admin / password123");
		};
	}
}