package com.smalltrend.controller;

import com.smalltrend.entity.*;
import com.smalltrend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserCredentialsRepository userCredentialsRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getUsers() {
        Map<String, Object> result = new HashMap<>();
        try {
            List<User> users = userRepository.findAll();
            List<UserCredential> credentials = userCredentialsRepository.findAll();
            List<Role> roles = roleRepository.findAll();
            
            result.put("users", users);
            result.put("credentials", credentials);
            result.put("roles", roles);
            result.put("status", "success");
            result.put("userCount", users.size());
            result.put("credentialCount", credentials.size());
        } catch (Exception e) {
            result.put("error", e.getMessage());
            result.put("status", "error");
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/seed-users")
    public ResponseEntity<Map<String, Object>> seedUsers() {
        Map<String, Object> result = new HashMap<>();
        try {
            // Create admin user with all required fields
            User adminUser = new User();
            adminUser.setFullName("Admin User");
            adminUser.setEmail("admin@smalltrend.com");
            adminUser.setPhone("0901234567");
            adminUser.setAddress("123 Admin Street");
            adminUser.setStatus("ACTIVE");
            adminUser.setUsername("admin"); // Required by User entity
            adminUser.setPassword("dummy"); // Required by User entity, not used for auth
            adminUser.setActive(true);
            
            // Try to find admin role or create if doesn't exist
            Role adminRole = roleRepository.findById(1).orElse(null);
            if (adminRole == null) {
                adminRole = new Role();
                adminRole.setName("ADMIN");
                adminRole.setDescription("Administrator");
                adminRole = roleRepository.save(adminRole);
            }
            adminUser.setRole(adminRole);
            
            // Save user first
            User savedUser = userRepository.save(adminUser);
            
            // Create credentials
            UserCredential adminCredential = new UserCredential();
            adminCredential.setUser(savedUser);
            adminCredential.setUsername("admin");
            adminCredential.setPasswordHash(passwordEncoder.encode("password"));
            userCredentialsRepository.save(adminCredential);
            
            result.put("status", "success");
            result.put("message", "Admin user created successfully");
            result.put("userId", savedUser.getId());
            result.put("passwordHash", adminCredential.getPasswordHash());
            
            // Test password encoding
            boolean matches = passwordEncoder.matches("password", adminCredential.getPasswordHash());
            result.put("passwordTest", matches);
            
        } catch (Exception e) {
            result.put("status", "error");
            result.put("error", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/test-password")
    public ResponseEntity<Map<String, Object>> testPassword(@RequestBody Map<String, String> request) {
        Map<String, Object> result = new HashMap<>();
        try {
            String username = request.get("username");
            String password = request.get("password");
            
            UserCredential credential = userCredentialsRepository.findByUsername(username).orElse(null);
            if (credential == null) {
                result.put("status", "user_not_found");
                return ResponseEntity.ok(result);
            }
            
            boolean matches = passwordEncoder.matches(password, credential.getPasswordHash());
            result.put("status", "success");
            result.put("username", username);
            result.put("passwordMatches", matches);
            result.put("storedHash", credential.getPasswordHash());
            
        } catch (Exception e) {
            result.put("status", "error");
            result.put("error", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }
}