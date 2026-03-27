package com.smalltrend.validation.product;

import com.smalltrend.dto.products.CreateProductComboItemRequest;
import com.smalltrend.dto.products.CreateProductComboRequest;
import com.smalltrend.entity.ProductCombo;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.repository.ProductComboRepository;
import com.smalltrend.repository.ProductVariantRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class ProductComboValidator {

    // REVIEW FLOW: validate tên/giá/items combo -> chặn trùng variant trong cùng combo -> kiểm tra unique tên và mã combo trước khi lưu.
    private final ProductComboRepository productComboRepository;
    private final ProductVariantRepository productVariantRepository;

    public ProductComboValidator(ProductComboRepository productComboRepository,
            ProductVariantRepository productVariantRepository) {
        this.productComboRepository = productComboRepository;
        this.productVariantRepository = productVariantRepository;
    }

    public ProductCombo requireExistingCombo(Integer id) {
        return productComboRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy combo với id: " + id));
    }

    public String validateAndNormalizeName(String comboName) {
        if (comboName == null || comboName.trim().isEmpty()) {
            throw new RuntimeException("Vui lòng nhập tên combo");
        }
        return comboName.trim();
    }

    public BigDecimal validateComboPrice(BigDecimal comboPrice) {
        if (comboPrice == null) {
            throw new RuntimeException("Vui lòng nhập giá combo");
        }
        if (comboPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Giá combo phải lớn hơn 0");
        }
        return comboPrice;
    }

    public void validateItems(List<CreateProductComboItemRequest> items) {
        if (items == null || items.isEmpty()) {
            throw new RuntimeException("Vui lòng chọn ít nhất 1 sản phẩm");
        }

        Set<Integer> variantIds = new HashSet<>();
        for (CreateProductComboItemRequest item : items) {
            if (item.getProductVariantId() == null) {
                throw new RuntimeException("Sản phẩm trong combo không hợp lệ");
            }
            if (item.getQuantity() != null && item.getQuantity() <= 0) {
                throw new RuntimeException("Số lượng sản phẩm trong combo phải lớn hơn 0");
            }
            if (!variantIds.add(item.getProductVariantId())) {
                throw new RuntimeException("Không được thêm trùng sản phẩm trong combo");
            }
        }
    }

    public void validateNameUniqueForCreate(String comboName) {
        if (productComboRepository.existsByComboNameIgnoreCase(comboName)) {
            throw new RuntimeException("Tên combo đã tồn tại");
        }
    }

    public void validateNameUniqueForUpdate(String comboName, Integer currentId) {
        if (productComboRepository.existsByComboNameIgnoreCaseAndIdNot(comboName, currentId)) {
            throw new RuntimeException("Tên combo đã tồn tại");
        }
    }

    public void validateComboCodeUniqueForCreate(String comboCode) {
        if (comboCode != null && !comboCode.trim().isEmpty()
                && productComboRepository.findByComboCode(comboCode.trim()).isPresent()) {
            throw new RuntimeException("Mã combo đã tồn tại: " + comboCode.trim());
        }
    }

    public void validateComboCodeUniqueForUpdate(ProductCombo combo, String requestComboCode) {
        if (requestComboCode == null || requestComboCode.trim().isEmpty()) {
            return;
        }

        String normalizedCode = requestComboCode.trim();
        if (!normalizedCode.equals(combo.getComboCode())
                && productComboRepository.findByComboCode(normalizedCode).isPresent()) {
            throw new RuntimeException("Mã combo đã tồn tại: " + normalizedCode);
        }
    }

    public void validateForCreate(CreateProductComboRequest request) {
        validateAndNormalizeName(request.getComboName());
        validateComboPrice(request.getComboPrice());
        validateItems(request.getItems());
        validateNameUniqueForCreate(request.getComboName().trim());
    }

    public void validateForUpdate(Integer comboId, CreateProductComboRequest request) {
        validateAndNormalizeName(request.getComboName());
        validateComboPrice(request.getComboPrice());
        validateItems(request.getItems());
        validateNameUniqueForUpdate(request.getComboName().trim(), comboId);
    }

    public ProductVariant requireExistingVariant(Integer variantId) {
        return productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biến thể với id: " + variantId));
    }
}
