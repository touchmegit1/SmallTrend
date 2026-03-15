package com.smalltrend.validation.product;

import com.smalltrend.entity.Product;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.Unit;
import com.smalltrend.repository.ProductRepository;
import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class ProductVariantValidator {

    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final UnitRepository unitRepository;

    public Product requireExistingProduct(Integer productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + productId));
    }

    public Unit requireExistingUnit(Integer unitId) {
        return unitRepository.findById(unitId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn vị tính với id: " + unitId));
    }

    public ProductVariant requireExistingVariant(Integer variantId) {
        return productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biến thể với id: " + variantId));
    }

    public void validateCanCreateActiveVariant(Product product, Boolean requestedIsActive) {
        boolean isVariantActive = requestedIsActive != null ? requestedIsActive : true;
        if (isVariantActive && product.getIsActive() != null && !product.getIsActive()) {
            throw new RuntimeException("Không thể tạo biến thể đang bán vì sản phẩm gốc đang ngừng bán!");
        }
    }

    public void validateSkuRequired(String sku) {
        if (sku == null || sku.trim().isEmpty()) {
            throw new RuntimeException("SKU là bắt buộc. Vui lòng nhập mã SKU.");
        }
    }

    public void validateSkuUniqueForCreate(String sku) {
        if (productVariantRepository.existsBySku(sku)) {
            throw new RuntimeException("Mã SKU đã tồn tại trong hệ thống. Vui lòng nhập mã khác.");
        }
    }

    public void validateSkuUniqueForUpdate(String sku, Integer variantId) {
        if (productVariantRepository.existsBySkuAndIdNot(sku, variantId)) {
            throw new RuntimeException("Mã SKU đã tồn tại trong hệ thống. Vui lòng nhập mã khác.");
        }
    }

    public void validateBarcodeFormat(String barcode) {
        if (barcode != null && !barcode.trim().isEmpty() && !barcode.trim().matches("^\\d{12,13}$")) {
            throw new RuntimeException("Barcode phải gồm 12-13 chữ số.");
        }
    }

    public void validateBarcodeUniqueForCreate(String barcode) {
        if (barcode != null && !barcode.trim().isEmpty() && productVariantRepository.existsByBarcode(barcode)) {
            throw new RuntimeException("Mã Barcode đã tồn tại trong hệ thống. Vui lòng nhập mã khác.");
        }
    }

    public void validateBarcodeUniqueForUpdate(String barcode, Integer variantId) {
        if (barcode != null && !barcode.trim().isEmpty()
                && productVariantRepository.existsByBarcodeAndIdNot(barcode, variantId)) {
            throw new RuntimeException("Mã Barcode đã tồn tại trong hệ thống. Vui lòng nhập mã khác.");
        }
    }

    public void validatePluCodeFormat(String pluCode) {
        if (pluCode != null && !pluCode.trim().isEmpty() && !pluCode.trim().matches("^\\d{4,5}$")) {
            throw new RuntimeException("Mã PLU phải gồm 4-5 chữ số.");
        }
    }

    public void validateCanActivateOnUpdate(ProductVariant variant, Boolean requestedIsActive) {
        if (requestedIsActive != null && requestedIsActive
                && variant.getProduct().getIsActive() != null
                && !variant.getProduct().getIsActive()) {
            throw new RuntimeException("Không thể bật trạng thái hoạt động vì sản phẩm gốc đang ngừng bán!");
        }
    }

    public void validateCanActivateOnToggle(ProductVariant variant) {
        boolean willBeActive = !variant.isActive();
        if (willBeActive && variant.getProduct().getIsActive() != null && !variant.getProduct().getIsActive()) {
            throw new RuntimeException("Không thể bật trạng thái hoạt động vì sản phẩm gốc đang ngừng bán!");
        }
    }

    public void validateDeletableWithinTwoMinutes(ProductVariant variant) {
        LocalDateTime createdAt = variant.getCreatedAt();
        if (createdAt == null) {
            return;
        }

        long minutes = Duration.between(createdAt, LocalDateTime.now()).toMinutes();
        if (minutes >= 2) {
            throw new RuntimeException("Biến thể đã tạo quá 2 phút, bạn không thể xoá biến thể này nữa!");
        }
    }
}
