package com.smalltrend.service.products;

import com.smalltrend.dto.products.CreateProductComboItemRequest;
import com.smalltrend.dto.products.CreateProductComboRequest;
import com.smalltrend.dto.products.ProductComboItemResponse;
import com.smalltrend.dto.products.ProductComboResponse;
import com.smalltrend.entity.ProductCombo;
import com.smalltrend.entity.ProductComboItem;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.repository.ProductComboItemRepository;
import com.smalltrend.repository.ProductComboRepository;
import com.smalltrend.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductComboServiceImpl implements ProductComboService {

    private final ProductComboRepository productComboRepository;
    private final ProductComboItemRepository productComboItemRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    public List<ProductComboResponse> getAllCombos() {
        return productComboRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProductComboResponse getComboById(Integer id) {
        ProductCombo combo = productComboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Combo not found with id: " + id));
        return mapToResponse(combo);
    }

    @Override
    @Transactional
    public ProductComboResponse createCombo(CreateProductComboRequest request) {
        if (productComboRepository.findByComboCode(request.getComboCode()).isPresent()) {
            throw new RuntimeException("Combo Code already exists: " + request.getComboCode());
        }

        ProductCombo combo = new ProductCombo();
        // Base mapping
        applyRequestToCombo(request, combo);

        // Before saving combo, calculate Original Price
        BigDecimal originalPrice = calculateOriginalPrice(request.getItems());
        combo.setOriginalPrice(originalPrice != null ? originalPrice : BigDecimal.ZERO);

        ProductCombo savedCombo = productComboRepository.save(combo);

        // Save Items
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (CreateProductComboItemRequest itemReq : request.getItems()) {
                ProductVariant variant = productVariantRepository.findById(itemReq.getProductVariantId())
                        .orElseThrow(() -> new RuntimeException("Variant not found: " + itemReq.getProductVariantId()));

                ProductComboItem item = new ProductComboItem();
                item.setCombo(savedCombo);
                item.setProductVariant(variant);
                item.setQuantity(itemReq.getQuantity() != null ? itemReq.getQuantity() : 1);
                item.setMinQuantity(itemReq.getMinQuantity() != null ? itemReq.getMinQuantity() : 1);
                item.setMaxQuantity(
                        itemReq.getMaxQuantity() != null ? itemReq.getMaxQuantity() : itemReq.getQuantity());
                item.setIsOptional(itemReq.getIsOptional() != null ? itemReq.getIsOptional() : false);
                item.setCanSubstitute(itemReq.getCanSubstitute() != null ? itemReq.getCanSubstitute() : false);
                item.setDisplayOrder(itemReq.getDisplayOrder() != null ? itemReq.getDisplayOrder() : 0);
                item.setNotes(itemReq.getNotes());

                productComboItemRepository.save(item);
            }
        }

        // Force reload and map
        ProductCombo reloaded = productComboRepository.findById(savedCombo.getId()).get();
        return mapToResponse(reloaded);
    }

    @Override
    @Transactional
    public ProductComboResponse updateCombo(Integer id, CreateProductComboRequest request) {
        ProductCombo combo = productComboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Combo not found with id: " + id));

        // Check if combo code changing and existing
        if (!combo.getComboCode().equals(request.getComboCode()) &&
                productComboRepository.findByComboCode(request.getComboCode()).isPresent()) {
            throw new RuntimeException("Combo Code already exists: " + request.getComboCode());
        }

        applyRequestToCombo(request, combo);

        BigDecimal originalPrice = calculateOriginalPrice(request.getItems());
        combo.setOriginalPrice(originalPrice != null ? originalPrice : BigDecimal.ZERO);

        ProductCombo savedCombo = productComboRepository.save(combo);

        // Replace all items
        productComboItemRepository.deleteByComboId(savedCombo.getId());

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (CreateProductComboItemRequest itemReq : request.getItems()) {
                ProductVariant variant = productVariantRepository.findById(itemReq.getProductVariantId())
                        .orElseThrow(() -> new RuntimeException("Variant not found: " + itemReq.getProductVariantId()));

                ProductComboItem item = new ProductComboItem();
                item.setCombo(savedCombo);
                item.setProductVariant(variant);
                item.setQuantity(itemReq.getQuantity() != null ? itemReq.getQuantity() : 1);
                item.setMinQuantity(itemReq.getMinQuantity() != null ? itemReq.getMinQuantity() : 1);
                item.setMaxQuantity(
                        itemReq.getMaxQuantity() != null ? itemReq.getMaxQuantity() : itemReq.getQuantity());
                item.setIsOptional(itemReq.getIsOptional() != null ? itemReq.getIsOptional() : false);
                item.setCanSubstitute(itemReq.getCanSubstitute() != null ? itemReq.getCanSubstitute() : false);
                item.setDisplayOrder(itemReq.getDisplayOrder() != null ? itemReq.getDisplayOrder() : 0);
                item.setNotes(itemReq.getNotes());

                productComboItemRepository.save(item);
            }
        }

        ProductCombo reloaded = productComboRepository.findById(savedCombo.getId()).get();
        return mapToResponse(reloaded);
    }

    @Override
    @Transactional
    public void deleteCombo(Integer id) {
        ProductCombo combo = productComboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Combo not found with id: " + id));
        productComboItemRepository.deleteByComboId(combo.getId());
        productComboRepository.delete(combo);
    }

    @Override
    @Transactional
    public void toggleStatus(Integer id) {
        ProductCombo combo = productComboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Combo not found with id: " + id));
        combo.setIsActive(combo.getIsActive() != null ? !combo.getIsActive() : false);
        productComboRepository.save(combo);
    }

    private void applyRequestToCombo(CreateProductComboRequest request, ProductCombo combo) {
        combo.setComboCode(request.getComboCode());
        combo.setComboName(request.getComboName());
        combo.setDescription(request.getDescription());
        if (request.getImageUrl() != null) {
            combo.setImageUrl(request.getImageUrl());
        }
        combo.setComboPrice(request.getComboPrice() != null ? request.getComboPrice() : BigDecimal.ZERO);
        combo.setValidFrom(request.getValidFrom());
        combo.setValidTo(request.getValidTo());
        combo.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        combo.setMaxQuantityPerOrder(request.getMaxQuantityPerOrder());
        combo.setStockLimit(request.getStockLimit());
        combo.setComboType(request.getComboType());
        combo.setIsFeatured(request.getIsFeatured());
        combo.setDisplayOrder(request.getDisplayOrder());
        combo.setTags(request.getTags());
        combo.setStatus(request.getStatus());
    }

    private BigDecimal calculateOriginalPrice(List<CreateProductComboItemRequest> items) {
        if (items == null || items.isEmpty())
            return BigDecimal.ZERO;

        BigDecimal total = BigDecimal.ZERO;
        for (CreateProductComboItemRequest itemReq : items) {
            ProductVariant variant = productVariantRepository.findById(itemReq.getProductVariantId())
                    .orElseThrow(() -> new RuntimeException("Variant not found: " + itemReq.getProductVariantId()));

            BigDecimal variantPrice = variant.getSellPrice() != null ? variant.getSellPrice() : BigDecimal.ZERO;
            int qty = itemReq.getQuantity() != null ? itemReq.getQuantity() : 1;
            total = total.add(variantPrice.multiply(BigDecimal.valueOf(qty)));
        }
        return total;
    }

    private ProductComboResponse mapToResponse(ProductCombo combo) {
        List<ProductComboItem> rawItems = productComboItemRepository.findByComboId(combo.getId());

        List<ProductComboItemResponse> mappedItems = rawItems.stream().map(item -> {
            ProductComboItemResponse resp = new ProductComboItemResponse();
            resp.setId(item.getId());
            resp.setComboId(combo.getId());
            resp.setProductVariantId(item.getProductVariant().getId());
            resp.setProductVariantName(item.getProductVariant().getProduct().getName() +
                    (item.getProductVariant().getUnit() != null ? " - " + item.getProductVariant().getUnit().getName()
                            : ""));
            resp.setSku(item.getProductVariant().getSku());
            resp.setBarcode(item.getProductVariant().getBarcode());
            resp.setSellPrice(item.getProductVariant().getSellPrice());
            resp.setImageUrl(item.getProductVariant().getImageUrl());

            resp.setQuantity(item.getQuantity());
            resp.setMinQuantity(item.getMinQuantity());
            resp.setMaxQuantity(item.getMaxQuantity());
            resp.setIsOptional(item.getIsOptional());
            resp.setCanSubstitute(item.getCanSubstitute());
            resp.setDisplayOrder(item.getDisplayOrder());
            resp.setNotes(item.getNotes());
            return resp;
        }).collect(Collectors.toList());

        return ProductComboResponse.builder()
                .id(combo.getId())
                .comboCode(combo.getComboCode())
                .comboName(combo.getComboName())
                .description(combo.getDescription())
                .imageUrl(combo.getImageUrl())
                .originalPrice(combo.getOriginalPrice())
                .comboPrice(combo.getComboPrice())
                .savedAmount(combo.getSavedAmount())
                .discountPercent(combo.getDiscountPercent())
                .validFrom(combo.getValidFrom())
                .validTo(combo.getValidTo())
                .isActive(combo.getIsActive())
                .maxQuantityPerOrder(combo.getMaxQuantityPerOrder())
                .totalSold(combo.getTotalSold())
                .stockLimit(combo.getStockLimit())
                .comboType(combo.getComboType())
                .isFeatured(combo.getIsFeatured())
                .displayOrder(combo.getDisplayOrder())
                .tags(combo.getTags())
                .status(combo.getStatus())
                .createdById(combo.getCreatedBy() != null ? combo.getCreatedBy().getId() : null)
                .createdAt(combo.getCreatedAt())
                .updatedAt(combo.getUpdatedAt())
                .items(mappedItems)
                .build();
    }
}
