package com.smalltrend.service;

import com.smalltrend.dto.auth.AuthResponse;
import com.smalltrend.dto.auth.RegisterRequest;
import com.smalltrend.dto.user.UserDTO;
import com.smalltrend.dto.user.UserUpdateRequest;
import com.smalltrend.entity.Role;
import com.smalltrend.entity.User;
import com.smalltrend.entity.UserCredential;
import com.smalltrend.exception.UserException;
import com.smalltrend.repository.RoleRepository;
import com.smalltrend.repository.UserCredentialsRepository;
import com.smalltrend.repository.UserRepository;
import com.smalltrend.util.JwtUtil;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
            JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.userCredentialsRepository = userCredentialsRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userCredentialsRepository.findByUsername(username)
                .map(UserCredential::getUser)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username)));
        String roleName = user.getRole() != null ? user.getRole().getName() : "ROLE_USER";

        // Ensure role has ROLE_ prefix for Spring Security
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }

        // Check if user is active from original JWT logic
        boolean isEnabled = "ACTIVE".equals(user.getStatus()) && (user.getActive() == null || user.getActive());

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority(roleName)))
                .disabled(!isEnabled)
                .accountLocked(!"ACTIVE".equals(user.getStatus()))
                .accountExpired(false)
                .credentialsExpired(false)
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())
                || userCredentialsRepository.findByUsername(request.getUsername()).isPresent()) {
            throw UserException.usernameExists();
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw UserException.emailExists();
        }

        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw UserException.phoneExists();
        }

        // Get or create default role
        Role role;
        if (request.getRoleId() != null) {
            role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(UserException::roleNotFound);
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

        // Create consolidated user with JWT authentication
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .status(request.getStatus() != null ? request.getStatus().toUpperCase() : "ACTIVE")
                .active(true)
                .role(role)
                .build();

        User savedUser = userRepository.save(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(savedUser.getUsername());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .role(role.getName())
                .build();
    }

    public AuthResponse login(String username) {
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userCredentialsRepository.findByUsername(username)
                .map(UserCredential::getUser)
                .orElseThrow(() -> new UsernameNotFoundException("User not found")));
        String token = jwtUtil.generateToken(username);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().getName() : "ROLE_USER")
                .build();
    }

    public User getCurrentUser(String username) {
        return userRepository.findByUsername(username)
                .orElseGet(() -> userCredentialsRepository.findByUsername(username)
                .map(UserCredential::getUser)
                .orElseThrow(() -> new UsernameNotFoundException("User not found")));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Admin creates employee account - không có đăng ký tự do
     */
    @Transactional
    public UserDTO createEmployee(RegisterRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())
                || userCredentialsRepository.findByUsername(request.getUsername()).isPresent()) {
            throw UserException.usernameExists();
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw UserException.emailExists();
        }

        if (request.getPhone() != null && userRepository.existsByPhone(request.getPhone())) {
            throw UserException.phoneExists();
        }

        // Get role - must be valid employee role
        Role role;
        if (request.getRoleId() != null) {
            role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(UserException::roleNotFound);
        } else {
            // Default to SALES_STAFF if no role specified
            role = roleRepository.findByName("SALES_STAFF")
                    .orElseThrow(UserException::defaultRoleNotFound);
        }

        // Create user
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .status("ACTIVE")
                .role(role)
                .build();

        User savedUser = userRepository.save(user);

        // Create credentials
        UserCredential credential = UserCredential.builder()
                .user(savedUser)
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();

        userCredentialsRepository.save(credential);

        return UserDTO.fromEntity(savedUser);
    }

    /**
     * Get all users with pagination
     */
    public Page<User> getAllUsers(Integer page, Integer size) {
        if (size > 100) {
            size = 100; // Max 100 per page

        }
        if (size <= 0) {
            size = 10; // Default 10 per page

        }
        if (page < 0) {
            page = 0; // Default first page
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return userRepository.findAll(pageable);
    }

    /**
     * Search users by name or email
     */
    public Page<User> searchUsers(String query, Integer page, Integer size) {
        if (size > 100) {
            size = 100;
        }
        if (size <= 0) {
            size = 10;
        }
        if (page < 0) {
            page = 0;
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                query, query, pageable);
    }

    /**
     * Get user by ID
     */
    public User getUserById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> UserException.userNotFound(id));
    }

    public User updateUser(Integer id, UserUpdateRequest request) {
        User user = getUserById(id);

        if (request.getEmail() != null
                && userRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw UserException.emailUsedByOther();
        }

        if (request.getPhone() != null
                && userRepository.existsByPhoneAndIdNot(request.getPhone(), id)) {
            throw UserException.phoneUsedByOther();
        }

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
                    .orElseThrow(UserException::roleNotFound);
            user.setRole(role);
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus().toUpperCase());
        }

        return userRepository.save(user);
    }

    public void deleteUser(Integer id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    public User updateUserStatus(Integer id, String status) {
        User user = getUserById(id);
        user.setStatus(status != null ? status.toUpperCase() : user.getStatus());
        return userRepository.save(user);
    }
}
