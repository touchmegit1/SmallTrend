package com.smalltrend.service.products;

import com.smalltrend.dto.products.CreateProductRequest;
import com.smalltrend.dto.products.ProductResponse;
import com.smalltrend.entity.Product;
import com.smalltrend.repository.ProductRepository;
import com.smalltrend.validation.product.ProductValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation xử lý các logic nghiệp vụ cho Product (Sản phẩm)
 */
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    // REVIEW FLOW: validate dữ liệu product -> map request vào entity -> lưu DB -> map response trả về.
    private final ProductRepository productRepository;
    private final ProductValidator productValidator;

    // Chuyển đổi Entity Product trong DB sang DTO Response để trả về cho Frontend
    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .image_url(product.getImageUrl())
                .description(product.getDescription())
                .brand_id(product.getBrand() != null ? product.getBrand().getId() : null)
                .brand_name(product.getBrand() != null ? product.getBrand().getName() : null)
                .category_id(product.getCategory() != null ? product.getCategory().getId() : null)
                .category_name(product.getCategory() != null ? product.getCategory().getName() : null)
                .tax_rate_id(product.getTaxRate() != null ? product.getTaxRate().getId() : null)
                .tax_rate_name(product.getTaxRate() != null ? product.getTaxRate().getName() : null)
                .tax_rate_value(product.getTaxRate() != null ? product.getTaxRate().getRate() : null)
                .is_active(product.getIsActive())
                .created_at(product.getCreatedAt())
                .updated_at(product.getUpdatedAt())
                .variant_count(product.getVariants() != null ? product.getVariants().size() : 0)
                .supplier_name(product.getBrand() != null && product.getBrand().getSupplier() != null
                        ? product.getBrand().getSupplier().getName()
                        : null)
                .build();
    }

    // Lấy toàn bộ danh sách sản phẩm và map sang DTO
    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAll() {
        return productRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Tìm kiếm và lấy chi tiết một sản phẩm theo khóa chính (ID)
    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Integer id) {
        Product product = productValidator.requireExistingProduct(id);
        return mapToResponse(product);
    }

    // Tạo mới một bản ghi Sản phẩm vào cơ sở dữ liệu
    @Override
    @Transactional
    public ProductResponse create(CreateProductRequest request) {
        productValidator.validateNameForCreate(request.getName());

        Product product = new Product();
        applyRequestToProduct(request, product);
        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    // Sửa thông tin Sản phẩm đã tồn tại. Nếu cập nhật trạng thái (Active)
    // thì thay đổi sẽ áp dụng lan truyền xuống các Biến thể (Variants) con
    // REVIEW FLOW (UPDATE): lấy product cũ -> validate tên mới -> apply request -> nếu đổi trạng thái thì propagate xuống variant -> save.
    @Override
    @Transactional
    public ProductResponse update(Integer id, CreateProductRequest request) {
        Product existing = productValidator.requireExistingProduct(id);
        productValidator.validateNameForUpdate(request.getName(), id);

        boolean oldStatus = existing.getIsActive() != null ? existing.getIsActive() : true;
        applyRequestToProduct(request, existing);
        boolean newStatus = existing.getIsActive() != null ? existing.getIsActive() : true;

        if (oldStatus != newStatus && existing.getVariants() != null) {
            existing.getVariants().forEach(variant -> variant.setActive(newStatus));
        }

        Product saved = productRepository.save(existing);
        return mapToResponse(saved);
    }

    // Hàm tiện ích map các trường từ Request form sang Entity để lưu
    private void applyRequestToProduct(CreateProductRequest request, Product product) {
        product.setName(request.getName() != null ? request.getName().trim() : null);
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());
        product.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        product.setCategory(productValidator.resolveCategory(request.getCategoryId()));
        product.setBrand(productValidator.resolveBrand(request.getBrandId()));
        product.setTaxRate(productValidator.resolveTaxRate(request.getTaxRateId()));
    }

    // Xóa một Sản phẩm. Quy định: Chỉ được phép xóa bản ghi vừa tạo trong vòng 2
    // phút.
    // Nếu quá 2 phút, ném ra ngoại lệ và chặn việc xoá
    @Override
    @Transactional
    public void delete(Integer id) {
        Product product = productValidator.requireExistingProduct(id);
        productValidator.validateDeletableWithinTwoMinutes(product);
        productRepository.deleteById(id);
    }

    // Đảo ngược trạng thái Active/Inactive của Sản phẩm, và áp dụng lây lan xuống
    // các Biến thể con
    @Override
    @Transactional
    public void toggleStatus(Integer id) {
        Product product = productValidator.requireExistingProduct(id);

        boolean newStatus = !product.getIsActive();
        product.setIsActive(newStatus);

        if (product.getVariants() != null) {
            product.getVariants().forEach(variant -> variant.setActive(newStatus));
        }

        productRepository.save(product);
    }
}
