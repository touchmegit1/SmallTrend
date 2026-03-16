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
import com.smalltrend.validation.product.ProductComboValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductComboServiceImpl implements ProductComboService {

    private final ProductComboRepository productComboRepository;
    private final ProductComboItemRepository productComboItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductComboValidator productComboValidator;

    @Override
    public List<ProductComboResponse> getAllCombos() {
        return productComboRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProductComboResponse getComboById(Integer id) {
        ProductCombo combo = productComboValidator.requireExistingCombo(id);
        return mapToResponse(combo);
    }

    /**
     * Tự sinh mã combo duy nhất theo format: COMBO-yyyyMMdd-XXX
     */
    private String generateComboCode() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "COMBO-" + datePart + "-";

        // Tìm combo code lớn nhất theo prefix hiện tại
        List<ProductCombo> allCombos = productComboRepository.findAll();
        int maxSeq = 0;
        for (ProductCombo c : allCombos) {
            if (c.getComboCode() != null && c.getComboCode().startsWith(prefix)) {
                try {
                    int seq = Integer.parseInt(c.getComboCode().substring(prefix.length()));
                    if (seq > maxSeq) {
                        maxSeq = seq;
                    }
                } catch (NumberFormatException ignored) {
                }
            }
        }
        return prefix + String.format("%03d", maxSeq + 1);
    }

    @Override
    @Transactional
    public ProductComboResponse createCombo(CreateProductComboRequest request) {
        // Tự sinh comboCode nếu frontend không gửi
        String comboCode = request.getComboCode();
        if (comboCode == null || comboCode.trim().isEmpty()) {
            comboCode = generateComboCode();
            request.setComboCode(comboCode);
        } else {
            // Chỉ kiểm tra trùng khi user tự nhập comboCode
            productComboValidator.validateComboCodeUniqueForCreate(comboCode);
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
                ProductVariant variant = productComboValidator.requireExistingVariant(itemReq.getProductVariantId());

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
        return mapToResponse(savedCombo);
    }

    @Override
    @Transactional
    public ProductComboResponse updateCombo(Integer id, CreateProductComboRequest request) {
        ProductCombo combo = productComboValidator.requireExistingCombo(id);

        // Check if combo code changing and existing
        productComboValidator.validateComboCodeUniqueForUpdate(combo, request.getComboCode());

        applyRequestToCombo(request, combo);

        BigDecimal originalPrice = calculateOriginalPrice(request.getItems());
        combo.setOriginalPrice(originalPrice != null ? originalPrice : BigDecimal.ZERO);

        ProductCombo savedCombo = productComboRepository.save(combo);

        // Replace all items
        productComboItemRepository.deleteByComboId(savedCombo.getId());

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (CreateProductComboItemRequest itemReq : request.getItems()) {
                ProductVariant variant = productComboValidator.requireExistingVariant(itemReq.getProductVariantId());

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

        return mapToResponse(savedCombo);
    }

    @Override
    @Transactional
    public void deleteCombo(Integer id) {
        ProductCombo combo = productComboValidator.requireExistingCombo(id);
        productComboItemRepository.deleteByComboId(combo.getId());
        productComboRepository.delete(combo);
    }

    @Override
    @Transactional
    public void toggleStatus(Integer id) {
        ProductCombo combo = productComboValidator.requireExistingCombo(id);
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
        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal total = BigDecimal.ZERO;
        for (CreateProductComboItemRequest itemReq : items) {
            ProductVariant variant = productComboValidator.requireExistingVariant(itemReq.getProductVariantId());

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
            // Build variant name consistent with ProductVariantService
            String productName = item.getProductVariant().getProduct().getName();
            String unitName = item.getProductVariant().getUnit() != null ? item.getProductVariant().getUnit().getName()
                    : null;

            StringBuilder nameBuilder = new StringBuilder(productName != null ? productName : "");
            if (unitName != null && !unitName.isEmpty()) {
                nameBuilder.append(" - ").append(unitName.trim());
            }

            java.util.Map<String, String> attributes = item.getProductVariant().getAttributes();
            if (attributes != null && !attributes.isEmpty()) {
                for (String value : attributes.values()) {
                    if (value != null && !value.trim().isEmpty()) {
                        nameBuilder.append(" - ").append(value.trim());
                    }
                }
            }
            resp.setProductVariantName(nameBuilder.toString());
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
