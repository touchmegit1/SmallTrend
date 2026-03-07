package com.smalltrend.service;

import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.repository.ProductRepository;
import com.smalltrend.repository.UnitRepository;
import com.smalltrend.repository.InventoryStockRepository;
import com.smalltrend.repository.ProductBatchRepository;
import com.smalltrend.repository.UnitConversionRepository;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.Product;
import com.smalltrend.entity.Unit;
import com.smalltrend.entity.ProductBatch;
import com.smalltrend.dto.pos.ProductVariantRespone;
import com.smalltrend.dto.products.CreateVariantRequest;
import com.smalltrend.dto.products.UnitConversionResponse;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductVariantService {

    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;
    private final UnitRepository unitRepository;
    private final InventoryStockRepository inventoryStockRepository;
    private final ProductBatchRepository productBatchRepository;
    private final UnitConversionRepository unitConversionRepository;
    private final UnitConversionService unitConversionService;

    public List<ProductVariantRespone> getAllProductVariants(String search, String barcode) {
        List<ProductVariant> variants;

        if (barcode != null && !barcode.isEmpty()) {
            variants = productVariantRepository.findAll().stream()
                    .filter(v -> v.getBarcode() != null && v.getBarcode().contains(barcode))
                    .collect(Collectors.toList());
        } else if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            variants = productVariantRepository.findAll().stream()
                    .filter(v -> (v.getProduct().getName() != null
                            && v.getProduct().getName().toLowerCase().contains(searchLower)) ||
                            (v.getSku() != null && v.getSku().toLowerCase().contains(searchLower)) ||
                            (v.getBarcode() != null && v.getBarcode().contains(search)))
                    .collect(Collectors.toList());
        } else {
            variants = productVariantRepository.findAll();
        }

        return variants.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ProductVariantRespone> getVariantsByProductId(Integer productId) {
        List<ProductVariant> variants = productVariantRepository.findByProductId(productId);

        return variants.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProductVariantRespone createVariant(Integer productId, CreateVariantRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        Unit unit = unitRepository.findById(request.getUnitId())
                .orElseThrow(() -> new RuntimeException("Unit not found with id: " + request.getUnitId()));

        boolean isVariantActive = request.getIsActive() != null ? request.getIsActive() : true;
        if (isVariantActive && (product.getIsActive() != null && !product.getIsActive())) {
            throw new RuntimeException("Không thể tạo biến thể đang bán vì sản phẩm gốc đang ngừng bán!");
        }

        // SKU is required
        if (request.getSku() == null || request.getSku().trim().isEmpty()) {
            throw new RuntimeException("SKU là bắt buộc. Vui lòng nhập mã SKU.");
        }

        // SKU uniqueness check
        if (productVariantRepository.existsBySku(request.getSku())) {
            throw new RuntimeException("Mã SKU đã tồn tại trong hệ thống. Vui lòng nhập mã khác.");
        }

        // Barcode validation (optional, but must be 12-13 digits if provided)
        if (request.getBarcode() != null && !request.getBarcode().trim().isEmpty()) {
            validateBarcode(request.getBarcode().trim());
            if (productVariantRepository.existsByBarcode(request.getBarcode())) {
                throw new RuntimeException("Mã Barcode đã tồn tại trong hệ thống. Vui lòng nhập mã khác.");
            }
        }

        // PLU validation (optional, must be 4-5 digits if provided)
        if (request.getPluCode() != null && !request.getPluCode().trim().isEmpty()) {
            validatePluCode(request.getPluCode().trim());
        }

        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .sku(request.getSku().toUpperCase().replaceAll("\\s+", ""))
                .barcode(request.getBarcode())
                .pluCode(request.getPluCode())
                .unit(unit)
                .sellPrice(request.getSellPrice())
                .imageUrl(request.getImageUrl())
                .isActive(isVariantActive)
                .attributes(request.getAttributes())
                .build();

        ProductVariant saved = productVariantRepository.save(variant);
        return mapToResponse(saved);
    }

    public ProductVariantRespone updateVariant(Integer variantId, CreateVariantRequest request) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found with id: " + variantId));

        Unit unit = unitRepository.findById(request.getUnitId())
                .orElseThrow(() -> new RuntimeException("Unit not found with id: " + request.getUnitId()));

        // SKU is required
        if (request.getSku() == null || request.getSku().trim().isEmpty()) {
            throw new RuntimeException("SKU là bắt buộc. Vui lòng nhập mã SKU.");
        }

        // SKU uniqueness check (exclude current variant)
        if (productVariantRepository.existsBySkuAndIdNot(request.getSku(), variantId)) {
            throw new RuntimeException("Mã SKU đã tồn tại trong hệ thống. Vui lòng nhập mã khác.");
        }

        // Barcode validation
        if (request.getBarcode() != null && !request.getBarcode().trim().isEmpty()) {
            validateBarcode(request.getBarcode().trim());
            if (productVariantRepository.existsByBarcodeAndIdNot(request.getBarcode(), variantId)) {
                throw new RuntimeException("Mã Barcode đã tồn tại trong hệ thống. Vui lòng nhập mã khác.");
            }
        }

        // PLU validation
        if (request.getPluCode() != null && !request.getPluCode().trim().isEmpty()) {
            validatePluCode(request.getPluCode().trim());
        }

        variant.setSku(request.getSku().toUpperCase().replaceAll("\\s+", ""));
        variant.setBarcode(request.getBarcode());
        variant.setPluCode(request.getPluCode());
        variant.setUnit(unit);

        variant.setSellPrice(request.getSellPrice());
        if (request.getImageUrl() != null) {
            variant.setImageUrl(request.getImageUrl());
        }
        if (request.getIsActive() != null) {
            if (request.getIsActive()
                    && (variant.getProduct().getIsActive() != null && !variant.getProduct().getIsActive())) {
                throw new RuntimeException("Không thể bật trạng thái hoạt động vì sản phẩm gốc đang ngừng bán!");
            }
            variant.setActive(request.getIsActive());
        }
        if (request.getAttributes() != null) {
            variant.setAttributes(request.getAttributes());
        }

        ProductVariant saved = productVariantRepository.save(variant);
        return mapToResponse(saved);
    }

    /**
     * Generate SKU based on product data.
     * Format: {CATEGORY_CODE}-{BRAND_SHORT}-{PRODUCT_SHORT}-{UNIT_CODE}
     */
    public String generateSku(Integer productId, Integer unitId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        // Category code (use category code, or first 4 chars of name)
        String categoryPart = "GEN";
        if (product.getCategory() != null) {
            if (product.getCategory().getCode() != null && !product.getCategory().getCode().isEmpty()) {
                categoryPart = product.getCategory().getCode().toUpperCase();
            } else if (product.getCategory().getName() != null) {
                categoryPart = abbreviate(product.getCategory().getName(), 4);
            }
        }

        // Brand abbreviation (first 4 chars)
        String brandPart = "NOBR";
        if (product.getBrand() != null && product.getBrand().getName() != null) {
            brandPart = abbreviate(product.getBrand().getName(), 4);
        }

        // Product abbreviation (first 4 chars)
        String productPart = "PROD";
        if (product.getName() != null) {
            productPart = abbreviate(product.getName(), 6);
        }

        // Unit code
        String unitPart = "UN";
        if (unitId != null) {
            Unit unit = unitRepository.findById(unitId).orElse(null);
            if (unit != null && unit.getCode() != null) {
                unitPart = unit.getCode().toUpperCase();
            } else if (unit != null && unit.getName() != null) {
                unitPart = abbreviate(unit.getName(), 4);
            }
        }

        String baseSku = categoryPart + "-" + brandPart + "-" + productPart + "-" + unitPart;

        // Ensure uniqueness by adding a numeric suffix if needed
        String sku = baseSku;
        int suffix = 1;
        while (productVariantRepository.existsBySku(sku)) {
            sku = baseSku + "-" + suffix;
            suffix++;
        }

        return sku;
    }

    /**
     * Generate internal barcode for store-created products using EAN-13 standard.
     * Format: 893 (Country) + 00001 (Company) + XXXX (Product) + C (Check Digit)
     * Total: 13 digits
     */
    public String generateInternalBarcode(Integer productId) {
        String countryCode = "893"; // Việt Nam
        String companyCode = "00001"; // Mã công ty (giả định cửa hàng dùng mã 00001)

        Random random = new Random();
        // Cấu trúc: 893 + XXXXX (company) + XXXX (product)
        // Dùng random 4 số cho mã sản phẩm để đảm bảo ngẫu nhiên cho các biến thể
        String productCode = String.format("%04d", random.nextInt(10000));

        String withoutCheckDigit = countryCode + companyCode + productCode;
        String barcode = withoutCheckDigit + calculateEan13CheckDigit(withoutCheckDigit);

        // Ensure uniqueness
        while (productVariantRepository.existsByBarcode(barcode)) {
            productCode = String.format("%04d", random.nextInt(10000));
            withoutCheckDigit = countryCode + companyCode + productCode;
            barcode = withoutCheckDigit + calculateEan13CheckDigit(withoutCheckDigit);
        }

        return barcode;
    }

    private int calculateEan13CheckDigit(String barcode12) {
        int sum = 0;
        for (int i = 0; i < 12; i++) {
            int digit = Character.getNumericValue(barcode12.charAt(i));
            // EAN-13 quy tắc: Vị trí chẵn (index lẻ 1,3,5...) nhân 3, vị trí lẻ (index chẵn
            // 0,2,4...) nhân 1
            sum += (i % 2 == 0) ? digit : digit * 3;
        }
        int checkDigit = 10 - (sum % 10);
        return (checkDigit == 10) ? 0 : checkDigit;
    }

    public void toggleVariantStatus(Integer variantId) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found with id: " + variantId));

        boolean willBeActive = !variant.isActive();
        if (willBeActive && (variant.getProduct().getIsActive() != null && !variant.getProduct().getIsActive())) {
            throw new RuntimeException("Không thể bật trạng thái hoạt động vì sản phẩm gốc đang ngừng bán!");
        }

        variant.setActive(willBeActive);
        productVariantRepository.save(variant);
    }

    public void deleteVariant(Integer variantId) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found with id: " + variantId));

        java.time.LocalDateTime createdAt = variant.getCreatedAt();
        if (createdAt != null) {
            long minutes = java.time.Duration.between(createdAt, java.time.LocalDateTime.now()).toMinutes();
            if (minutes >= 2) {
                throw new RuntimeException("Biến thể đã tạo quá 2 phút, bạn không thể xoá biến thể này nữa!");
            }
        }

        productVariantRepository.deleteById(variantId);
    }

    // ─── Validation Helpers ──────────────────────────────────────────────────

    private void validateBarcode(String barcode) {
        if (!barcode.matches("^\\d{12,13}$")) {
            throw new RuntimeException("Barcode phải gồm 12-13 chữ số.");
        }
    }

    private void validatePluCode(String pluCode) {
        if (!pluCode.matches("^\\d{4,5}$")) {
            throw new RuntimeException("Mã PLU phải gồm 4-5 chữ số.");
        }
    }

    /**
     * Create an abbreviation from a string: take first N consonants/chars,
     * uppercase, no spaces.
     */
    private String abbreviate(String input, int maxLen) {
        if (input == null || input.isEmpty())
            return "";
        // Remove Vietnamese diacritics for cleaner codes
        String normalized = java.text.Normalizer.normalize(input, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[đĐ]", "D");
        // Remove non-alphanumeric, uppercase
        String clean = normalized.replaceAll("[^A-Za-z0-9]", "").toUpperCase();
        return clean.length() <= maxLen ? clean : clean.substring(0, maxLen);
    }

    // ─── Mapper ──────────────────────────────────────────────────────────────

    private ProductVariantRespone mapToResponse(ProductVariant variant) {
        ProductVariantRespone response = new ProductVariantRespone();
        response.setId(variant.getId());
        response.setSku(variant.getSku());
        response.setBarcode(variant.getBarcode());
        response.setPluCode(variant.getPluCode());
        String productName = variant.getProduct() != null ? variant.getProduct().getName() : "";
        StringBuilder nameBuilder = new StringBuilder(productName);

        String unitNameStr = variant.getUnit() != null ? variant.getUnit().getName() : "";

        if (unitNameStr != null && !unitNameStr.trim().isEmpty()) {
            nameBuilder.append(" ");
            nameBuilder.append(unitNameStr.trim());
        }

        java.util.Map<String, String> attributes = variant.getAttributes();
        if (attributes != null && !attributes.isEmpty()) {
            for (String value : attributes.values()) {
                if (value != null && !value.trim().isEmpty()) {
                    nameBuilder.append(" - ").append(value.trim());
                }
            }
        }

        response.setName(nameBuilder.toString());
        String unitName = variant.getUnit() != null ? variant.getUnit().getName() : null;
        response.setUnitName(unitName);
        if (variant.getUnit() != null) {
            response.setUnitId(variant.getUnit().getId());
        }

        response.setImageUrl(variant.getImageUrl());
        response.setSellPrice(variant.getSellPrice());
        response.setIsActive(variant.isActive());
        response.setAttributes(variant.getAttributes());
        response.setCreatedAt(variant.getCreatedAt());

        // Tax Info
        if (variant.getProduct() != null && variant.getProduct().getTaxRate() != null) {
            response.setTaxRate(variant.getProduct().getTaxRate().getRate());
            response.setTaxName(variant.getProduct().getTaxRate().getName());
        }

        // Get stock quantity
        Integer stockQty = inventoryStockRepository.findByVariantId(variant.getId())
                .stream()
                .mapToInt(stock -> stock.getQuantity() != null ? stock.getQuantity() : 0)
                .sum();
        response.setStockQuantity(stockQty);

        // Get cost price from latest batch
        List<ProductBatch> batches = productBatchRepository.findByVariantId(variant.getId());
        if (batches != null && !batches.isEmpty()) {
            // Get the latest batch's cost price
            ProductBatch latestBatch = batches.get(batches.size() - 1);
            response.setCostPrice(latestBatch.getCostPrice());
        }

        // Get category and brand names
        if (variant.getProduct().getCategory() != null) {
            response.setCategoryName(variant.getProduct().getCategory().getName());
        }
        if (variant.getProduct().getBrand() != null) {
            response.setBrandName(variant.getProduct().getBrand().getName());
        }

        // Unit Conversions
        List<UnitConversionResponse> conversions = unitConversionRepository.findByVariantId(variant.getId())
                .stream()
                .map(unitConversionService::mapToResponse)
                .collect(Collectors.toList());
        response.setUnitConversions(conversions);

        return response;
    }
}
