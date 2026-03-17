package com.smalltrend.service;

import com.smalltrend.dto.auth.AuthResponse;
import com.smalltrend.dto.auth.RegisterRequest;
import com.smalltrend.dto.user.UserProfileDTO;
import com.smalltrend.dto.user.UserDTO;
import com.smalltrend.dto.user.UserUpdateRequest;
import com.smalltrend.entity.Role;
import com.smalltrend.entity.User;
import com.smalltrend.entity.UserCredential;
import com.smalltrend.entity.enums.SalaryType;
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
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    private static final long USER_DELETE_WINDOW_MINUTES = 20;

    private final UserRepository userRepository;
    private final UserCredentialsRepository userCredentialsRepository;
    private final RoleRepository roleRepository;
    private final CloudinaryService cloudinaryService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserService(
            UserRepository userRepository,
            UserCredentialsRepository userCredentialsRepository,
            RoleRepository roleRepository,
            CloudinaryService cloudinaryService,
            @Lazy PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.userCredentialsRepository = userCredentialsRepository;
        this.roleRepository = roleRepository;
        this.cloudinaryService = cloudinaryService;
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
        roleName = roleName.toUpperCase();

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

        applySalaryFields(user,
                request.getSalaryType(),
                request.getBaseSalary(),
                request.getHourlyRate(),
                request.getMinRequiredShifts(),
                request.getCountLateAsPresent(),
                request.getWorkingHoursPerMonth());

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
                .avatarUrl(savedUser.getAvatarUrl())
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
                .role(user.getRole() != null ? user.getRole().getName().toUpperCase() : "ROLE_USER")
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    public User getCurrentUser(String username) {
        return userRepository.findByUsername(username)
                .orElseGet(() -> userCredentialsRepository.findByUsername(username)
                .map(UserCredential::getUser)
                .orElseThrow(() -> new UsernameNotFoundException("User not found")));
    }

    public UserProfileDTO getCurrentUserProfile(String username) {
        return UserProfileDTO.fromEntity(getCurrentUser(username));
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
                .active(true)
                .role(role)
                .build();

        applySalaryFields(user,
                request.getSalaryType(),
                request.getBaseSalary(),
                request.getHourlyRate(),
                request.getMinRequiredShifts(),
                request.getCountLateAsPresent(),
                request.getWorkingHoursPerMonth());

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

        applySalaryFields(user,
                request.getSalaryType(),
                request.getBaseSalary(),
                request.getHourlyRate(),
                request.getMinRequiredShifts(),
                request.getCountLateAsPresent(),
                request.getWorkingHoursPerMonth());

        return userRepository.save(user);
    }

    public void deleteUser(Integer id) {
        User user = getUserById(id);

        LocalDateTime createdAt = user.getCreatedAt();
        if (createdAt == null) {
            throw new RuntimeException("Không thể xóa người dùng do thiếu thời điểm tạo tài khoản");
        }

        LocalDateTime deleteDeadline = createdAt.plusMinutes(USER_DELETE_WINDOW_MINUTES);
        if (LocalDateTime.now().isAfter(deleteDeadline)) {
            throw new RuntimeException("Chỉ có thể xóa người dùng trong vòng 20 phút kể từ lúc tạo");
        }

        userRepository.delete(user);
    }

    public User updateUserStatus(Integer id, String status) {
        User user = getUserById(id);
        user.setStatus(status != null ? status.toUpperCase() : user.getStatus());
        return userRepository.save(user);
    }

    @Transactional
    public void changeCurrentUserPassword(String username, String currentPassword, String newPassword,
            String confirmPassword) {
        if (newPassword == null || !newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("Xác nhận mật khẩu mới không khớp");
        }

        User user = getCurrentUser(username);
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không đúng");
        }

        String encodedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedPassword);
        userRepository.save(user);

        Optional<UserCredential> credentials = userCredentialsRepository.findByUserId(user.getId());
        if (credentials.isPresent()) {
            UserCredential credential = credentials.get();
            credential.setPasswordHash(encodedPassword);
            userCredentialsRepository.save(credential);
        }
    }

    @Transactional
    public UserDTO updateUserAvatar(Integer userId, MultipartFile file) {
        User user = getUserById(userId);
        user.setAvatarUrl(storeAvatarFile(file));
        return UserDTO.fromEntity(userRepository.save(user));
    }

    @Transactional
    public UserProfileDTO updateCurrentUserAvatar(String username, MultipartFile file) {
        User user = getCurrentUser(username);
        user.setAvatarUrl(storeAvatarFile(file));
        return UserProfileDTO.fromEntity(userRepository.save(user));
    }

    private String storeAvatarFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn ảnh đại diện");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new IllegalArgumentException("File tải lên phải là hình ảnh");
        }

        Map<String, Object> uploadResult = cloudinaryService.uploadFile(file, "avatars");
        Object secureUrl = uploadResult.get("secure_url");
        if (secureUrl == null || String.valueOf(secureUrl).isBlank()) {
            throw new RuntimeException("Không thể lưu ảnh đại diện");
        }
        return String.valueOf(secureUrl);
    }

    private void applySalaryFields(User user,
            String salaryType,
            BigDecimal baseSalary,
            BigDecimal hourlyRate,
            Integer minRequiredShifts,
            Boolean countLateAsPresent,
            BigDecimal workingHoursPerMonth) {
        SalaryType parsedSalaryType = parseSalaryType(salaryType);
        if (parsedSalaryType != null) {
            user.setSalaryType(parsedSalaryType);
        } else if (user.getSalaryType() == null) {
            user.setSalaryType(SalaryType.MONTHLY);
        }

        if (baseSalary != null) {
            user.setBaseSalary(baseSalary);
        }
        if (hourlyRate != null) {
            user.setHourlyRate(hourlyRate);
        }
        if (minRequiredShifts != null) {
            user.setMinRequiredShifts(minRequiredShifts);
        }
        if (countLateAsPresent != null) {
            user.setCountLateAsPresent(countLateAsPresent);
        } else if (user.getCountLateAsPresent() == null) {
            user.setCountLateAsPresent(true);
        }
        if (workingHoursPerMonth != null && workingHoursPerMonth.compareTo(BigDecimal.ZERO) > 0) {
            user.setWorkingHoursPerMonth(workingHoursPerMonth);
        } else if (user.getWorkingHoursPerMonth() == null) {
            user.setWorkingHoursPerMonth(BigDecimal.valueOf(208));
        }
    }

    private SalaryType parseSalaryType(String salaryType) {
        if (salaryType == null || salaryType.isBlank()) {
            return null;
        }
        try {
            return SalaryType.valueOf(salaryType.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
