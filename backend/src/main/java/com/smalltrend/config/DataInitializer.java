package com.smalltrend.config;

import com.smalltrend.entity.*;
import com.smalltrend.repository.*;
import lombok.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final TaxRateRepository taxRateRepository;
    private final LocationRepository locationRepository;
    private final ShiftRepository shiftRepository;

    @Override
    public void run(String... args) {
        try {
            seedRoles();
            seedPermissions();
            seedRolePermissions();
            seedBusinessData();
        } catch (Exception e) {
            System.err.println("⚠️ Lỗi khởi tạo dữ liệu: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void seedRoles() {
        try {
            if (roleRepository.count() == 0) {
                roleRepository.save(Roles.builder().name("Admin").description("Quản trị viên hệ thống").build());
                roleRepository.save(Roles.builder().name("Manager").description("Quản lý cửa hàng").build());
                roleRepository.save(Roles.builder().name("Cashier Staff").description("Nhân viên thu ngân").build());
                roleRepository.save(Roles.builder().name("Inventory Staff").description("Nhân viên kho").build());
                System.out.println("✅ Đã insert 4 roles vào database");
            }
        } catch (Exception e) {
            System.err.println("❌ Lỗi khi seed roles: " + e.getMessage());
        }
    }

    private void seedPermissions() {
        try {
            List<String> perms = Arrays.asList(
                    "USER_READ", "USER_WRITE",
                    "PRODUCT_READ", "PRODUCT_WRITE",
                    "ORDER_READ", "ORDER_WRITE"
            );

            for (String p : perms) {
                if (!permissionRepository.findByName(p).isPresent()) {
                    permissionRepository.save(Permission.builder().name(p).description(p + " permission").build());
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Lỗi khi seed permissions: " + e.getMessage());
        }
    }

    private void seedRolePermissions() {
        try {
            Optional<Roles> adminOpt = roleRepository.findAll().stream().filter(r -> "Admin".equals(r.getName())).findFirst();
            if (adminOpt.isPresent()) {
                Roles admin = adminOpt.get();
                List<Permission> allPerms = permissionRepository.findAll();
                for (Permission perm : allPerms) {
                    boolean exists = rolePermissionRepository.findAll().stream()
                            .anyMatch(rp -> rp.getRole().getId().equals(admin.getId()) && rp.getPermission().getId().equals(perm.getId()));
                    if (!exists) {
                        rolePermissionRepository.save(RolePermission.builder().role(admin).permission(perm).build());
                    }
                }
                System.out.println("✅ Đã gán permissions cho role Admin");
            }
        } catch (Exception e) {
            System.err.println("❌ Lỗi khi seed role permissions: " + e.getMessage());
        }
    }

    private void seedBusinessData() {
        try {
            if (categoryRepository.count() == 0) {
                Category cat1 = Category.builder().name("Electronics").description("Electronic items").build();
                Category cat2 = Category.builder().name("Groceries").description("Daily needs").build();
                categoryRepository.saveAll(Arrays.asList(cat1, cat2));
                System.out.println("✅ Seeded Categories");

                Brand brand1 = Brand.builder().name("Samsung").description("Electronics Brand").build();
                Brand brand2 = Brand.builder().name("Vinamilk").description("Dairy Brand").build();
                brandRepository.saveAll(Arrays.asList(brand1, brand2));
                System.out.println("✅ Seeded Brands");

                TaxRate vat8 = TaxRate.builder().name("VAT 8%").rate(0.08).build();
                TaxRate vat10 = TaxRate.builder().name("VAT 10%").rate(0.10).build();
                taxRateRepository.saveAll(Arrays.asList(vat8, vat10));
                System.out.println("✅ Seeded Tax Rates");

                Product p1 = Product.builder()
                        .sku("SAMSUNG-TV-55")
                        .name("Samsung TV 55 Inch")
                        .description("Smart TV 4K")
                        .category(cat1)
                        .brand(brand1)
                        .purchasePrice(new BigDecimal("8000000"))
                        .retailPrice(new BigDecimal("12000000"))
                        .wholesalePrice(new BigDecimal("10000000"))
                        .stockQuantity(10)
                        .unit("Piece")
                        .isActive(true)
                        .build();

                Product p2 = Product.builder()
                        .sku("VINA-MILK-1L")
                        .name("Fresh Milk 1L")
                        .description("Fresh Milk without sugar")
                        .category(cat2)
                        .brand(brand2)
                        .purchasePrice(new BigDecimal("25000"))
                        .retailPrice(new BigDecimal("35000"))
                        .wholesalePrice(new BigDecimal("30000"))
                        .stockQuantity(100)
                        .unit("Bottle")
                        .isActive(true)
                        .build();

                productRepository.saveAll(Arrays.asList(p1, p2));
                System.out.println("✅ Seeded Products");

                Customer cust1 = Customer.builder().name("Nguyen Van A").phone("0901234567").email("vana@example.com").loyaltyPoints(100).build();
                customerRepository.save(cust1);
                System.out.println("✅ Seeded Customers");

                Location loc1 = Location.builder().name("Warehouse A").type("Warehouse").build();
                locationRepository.save(loc1);
                System.out.println("✅ Seeded Locations");

                // Seed Shifts
                shiftRepository.save(Shift.builder().name("Morning Shift").description("6AM - 2PM").build());
                shiftRepository.save(Shift.builder().name("Evening Shift").description("2PM - 10PM").build());
                System.out.println("✅ Seeded Shifts");
            }
        } catch (Exception e) {
            System.err.println("❌ Lỗi khi seed business data: " + e.getMessage());
        }
    }
}
