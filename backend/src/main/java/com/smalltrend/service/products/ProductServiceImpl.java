package com.smalltrend.service.products;

import com.smalltrend.dto.products.CreateProductRequest;
import com.smalltrend.dto.products.ProductResponse;
import com.smalltrend.entity.Brand;
import com.smalltrend.entity.Category;
import com.smalltrend.entity.Product;
import com.smalltrend.entity.TaxRate;
import com.smalltrend.repository.BrandRepository;
import com.smalltrend.repository.CategoryRepository;
import com.smalltrend.repository.ProductRepository;
import com.smalltrend.repository.TaxRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final TaxRateRepository taxRateRepository;

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
                .is_active(product.getIsActive())
                .created_at(product.getCreatedAt())
                .updated_at(product.getUpdatedAt())
                .variant_count(product.getVariants() != null ? product.getVariants().size() : 0)
                .build();
    }

    @Override
    public List<ProductResponse> getAll() {
        return productRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProductResponse getById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse create(CreateProductRequest request) {
        Product product = new Product();
        applyRequestToProduct(request, product);
        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ProductResponse update(Integer id, CreateProductRequest request) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        boolean oldStatus = existing.getIsActive() != null ? existing.getIsActive() : true;
        applyRequestToProduct(request, existing);
        boolean newStatus = existing.getIsActive() != null ? existing.getIsActive() : true;

        if (oldStatus != newStatus && existing.getVariants() != null) {
            existing.getVariants().forEach(variant -> variant.setActive(newStatus));
        }

        Product saved = productRepository.save(existing);
        return mapToResponse(saved);
    }

    private void applyRequestToProduct(CreateProductRequest request, Product product) {
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());
        product.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + request.getCategoryId()));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        if (request.getBrandId() != null) {
            Brand brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new RuntimeException("Brand not found with id: " + request.getBrandId()));
            product.setBrand(brand);
        } else {
            product.setBrand(null);
        }

        if (request.getTaxRateId() != null) {
            TaxRate taxRate = taxRateRepository.findById(request.getTaxRateId())
                    .orElseThrow(() -> new RuntimeException("TaxRate not found with id: " + request.getTaxRateId()));
            product.setTaxRate(taxRate);
        } else {
            product.setTaxRate(null);
        }
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        productRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void toggleStatus(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        boolean newStatus = !product.getIsActive();
        product.setIsActive(newStatus);

        if (product.getVariants() != null) {
            product.getVariants().forEach(variant -> variant.setActive(newStatus));
        }

        productRepository.save(product);
    }
}
