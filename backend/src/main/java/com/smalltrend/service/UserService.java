package com.smalltrend.service;

import com.smalltrend.dto.auth.AuthResponse;
import com.smalltrend.dto.auth.RegisterRequest;
import com.smalltrend.dto.user.UserUpdateRequest;
import com.smalltrend.entity.Role;
import com.smalltrend.entity.User;
import com.smalltrend.entity.UserCredential;
import com.smalltrend.repository.RoleRepository;
import com.smalltrend.repository.UserCredentialsRepository;
import com.smalltrend.repository.UserRepository;
import com.smalltrend.util.JwtUtil;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserCredentialsRepository userCredentialsRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserService(
            UserRepository userRepository,
            UserCredentialsRepository userCredentialsRepository,
            RoleRepository roleRepository,
            @Lazy PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil
    ) {
        this.userRepository = userRepository;
        this.userCredentialsRepository = userCredentialsRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserCredential userCredential = userCredentialsRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        User user = userCredential.getUser();
        String roleName = user.getRole() != null ? user.getRole().getName() : "ROLE_USER";

        // Ensure role has ROLE_ prefix for Spring Security
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }

        return org.springframework.security.core.userdetails.User.builder()
                .username(userCredential.getUsername())
                .password(userCredential.getPasswordHash())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority(roleName)))
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userCredentialsRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username is already taken");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered");
        }

        Role role;
        if (request.getRoleId() != null) {
            role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Role not found"));
        } else {
            role = roleRepository.findByName("ROLE_USER")
                    .orElseGet(() -> {
                        Role newRole = Role.builder()
                                .name("ROLE_USER")
                                .description("Default user role")
                                .build();
                        return roleRepository.save(newRole);
                    });
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .status(request.getStatus() != null ? request.getStatus().toUpperCase() : "PENDING")
                .role(role)
                .build();

        user = userRepository.save(user);

        UserCredential credential = UserCredential.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .user(user)
                .build();

        userCredentialsRepository.save(credential);

        String token = jwtUtil.generateToken(request.getUsername());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .username(request.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(role.getName())
                .build();
    }

    public AuthResponse login(String username) {
        UserCredential userCredential = userCredentialsRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        User user = userCredential.getUser();
        String token = jwtUtil.generateToken(username);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .username(userCredential.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().getName() : "ROLE_USER")
                .build();
    }

    public User getCurrentUser(String username) {
        UserCredential userCredential = userCredentialsRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return userCredential.getUser();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User updateUser(Integer id, UserUpdateRequest request) {
        User user = getUserById(id);

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getRoleId() != null) {
            Role role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Role not found"));
            user.setRole(role);
        }

        return userRepository.save(user);
    }

    public void deleteUser(Integer id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    public User updateUserStatus(Integer id, String status) {
        User user = getUserById(id);
        user.setStatus(status);
        return userRepository.save(user);
    }
}
