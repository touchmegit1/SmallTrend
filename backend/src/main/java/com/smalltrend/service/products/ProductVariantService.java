package com.smalltrend.service.products;

import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.repository.UnitRepository;
import com.smalltrend.repository.InventoryStockRepository;
import com.smalltrend.repository.ProductBatchRepository;
import com.smalltrend.repository.UnitConversionRepository;
import com.smalltrend.repository.VariantPriceRepository;
import com.smalltrend.entity.enums.VariantPriceStatus;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.Product;
import com.smalltrend.entity.Unit;
import com.smalltrend.entity.ProductBatch;
import com.smalltrend.entity.InventoryStock;
import com.smalltrend.dto.pos.ProductVariantRespone;
import com.smalltrend.dto.products.CreateVariantRequest;
import com.smalltrend.dto.products.UnitConversionResponse;
import com.smalltrend.entity.UnitConversion;
import com.smalltrend.validation.product.ProductVariantValidator;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Random;
import java.util.stream.Collectors;
import java.time.LocalDate;

/**
 * Service xử lý nghiệp vụ cho Product Variant.
 * Bao gồm: CRUD variant, sinh SKU/Barcode nội bộ, đồng bộ dữ liệu liên quan (batch, tồn kho, quy đổi đơn vị, giá active).
 */
@Service
@RequiredArgsConstructor
public class ProductVariantService {

    private final ProductVariantRepository productVariantRepository;
    private final UnitRepository unitRepository;
    private final InventoryStockRepository inventoryStockRepository;
    private final ProductBatchRepository productBatchRepository;
    private final UnitConversionRepository unitConversionRepository;
    private final VariantPriceRepository variantPriceRepository;
    private final ProductVariantValidator productVariantValidator;

    /**
     * Lấy danh sách variant theo điều kiện tìm kiếm.
     * Ưu tiên lọc theo barcode, nếu không có barcode thì lọc theo search text.
     */
    public List<ProductVariantRespone> getAllProductVariants(String search, String barcode) {
        List<ProductVariant> variants;

        if (barcode != null && !barcode.isEmpty()) {
            variants = productVariantRepository.findAll().stream()
                    .filter(v -> v.getBarcode() != null && v.getBarcode().contains(barcode))
                    .collect(Collectors.toList());
        } else if (search != null && !search.isEmpty()) {
            String searchLower = search.toLowerCase();
            variants = productVariantRepository.findAll().stream()
                    .filter(v -> ((v.getProduct() != null && v.getProduct().getName() != null)
                    && v.getProduct().getName().toLowerCase().contains(searchLower))
                    || (v.getSku() != null && v.getSku().toLowerCase().contains(searchLower))
                    || (v.getBarcode() != null && v.getBarcode().contains(search)))
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

    /**
     * Tạo mới một variant cho product.
     * Thực hiện đầy đủ validate nghiệp vụ trước khi lưu.
     */
    public ProductVariantRespone createVariant(Integer productId, CreateVariantRequest request) {
        Product product = productVariantValidator.requireExistingProduct(productId);
        Unit unit = productVariantValidator.requireExistingUnit(request.getUnitId());

        productVariantValidator.validateCanCreateActiveVariant(product, request.getIsActive());
        productVariantValidator.validateSkuRequired(request.getSku());
        productVariantValidator.validateSkuUniqueForCreate(request.getSku());
        productVariantValidator.validateBarcodeFormat(request.getBarcode());
        productVariantValidator.validateBarcodeUniqueForCreate(request.getBarcode());
        productVariantValidator.validatePluCodeFormat(request.getPluCode());

        boolean isVariantActive = request.getIsActive() != null ? request.getIsActive() : true;

        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .sku(request.getSku().toUpperCase().replaceAll("\\s+", ""))
                .barcode(request.getBarcode())
                .pluCode(request.getPluCode())
                .unit(unit)
                .sellPrice(request.getSellPrice())
                .imageUrl(request.getImageUrl())
                .isActive(isVariantActive)
                .attributes(normalizeAttributesForPersistence(request.getAttributes()))
                .build();

        ProductVariant saved = productVariantRepository.save(variant);

        if (request.getCostPrice() != null) {
            ProductBatch batch = ProductBatch.builder()
                    .variant(saved)
                    .batchNumber("AUTO-" + System.currentTimeMillis())
                    .mfgDate(LocalDate.now())
                    .expiryDate(LocalDate.now().plusYears(1))
                    .costPrice(request.getCostPrice())
                    .build();
            productBatchRepository.save(batch);
        }

        return mapToResponse(saved);
    }

    /**
     * Cập nhật thông tin variant hiện có.
     * Nếu có costPrice thì cập nhật batch mới nhất hoặc tạo batch mới khi chưa có dữ liệu batch.
     */
    public ProductVariantRespone updateVariant(Integer variantId, CreateVariantRequest request) {
        ProductVariant variant = productVariantValidator.requireExistingVariant(variantId);
        Unit unit = productVariantValidator.requireExistingUnit(request.getUnitId());

        productVariantValidator.validateSkuRequired(request.getSku());
        productVariantValidator.validateSkuUniqueForUpdate(request.getSku(), variantId);
        productVariantValidator.validateBarcodeFormat(request.getBarcode());
        productVariantValidator.validateBarcodeUniqueForUpdate(request.getBarcode(), variantId);
        productVariantValidator.validatePluCodeFormat(request.getPluCode());

        variant.setSku(request.getSku().toUpperCase().replaceAll("\\s+", ""));
        variant.setBarcode(request.getBarcode());
        variant.setPluCode(request.getPluCode());
        variant.setUnit(unit);

        variant.setSellPrice(request.getSellPrice());
        if (request.getImageUrl() != null) {
            variant.setImageUrl(request.getImageUrl());
        }
        if (request.getIsActive() != null) {
            productVariantValidator.validateCanActivateOnUpdate(variant, request.getIsActive());
            variant.setActive(request.getIsActive());
        }
        if (request.getAttributes() != null) {
            Map<String, String> normalized = normalizeAttributesForPersistence(request.getAttributes());
            if (variant.getAttributes() == null) {
                variant.setAttributes(normalized);
            } else {
                variant.getAttributes().clear();
                variant.getAttributes().putAll(normalized);
            }
        }

        if (request.getCostPrice() != null) {
            ProductBatch latestBatch = productBatchRepository.findFirstByVariantIdOrderByIdDesc(variantId).orElse(null);
            if (latestBatch != null) {
                latestBatch.setCostPrice(request.getCostPrice());
                productBatchRepository.save(latestBatch);
            } else {
                ProductBatch newBatch = ProductBatch.builder()
                        .variant(variant)
                        .batchNumber("AUTO-" + System.currentTimeMillis())
                        .mfgDate(LocalDate.now())
                        .expiryDate(LocalDate.now().plusYears(1))
                        .costPrice(request.getCostPrice())
                        .build();
                productBatchRepository.save(newBatch);
            }
        }

        ProductVariant saved = productVariantRepository.save(variant);
        return mapToResponse(saved);
    }

    /**
     * Generate SKU based on product data. Format:
     * {CATEGORY_CODE}-{BRAND_SHORT}-{PRODUCT_SHORT}-{UNIT_CODE}
     */
    public String generateSku(Integer productId, Integer unitId) {
        Product product = productVariantValidator.requireExistingProduct(productId);

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
     * Generate internal barcode for store-created products using EAN-13
     * standard. Format: 893 (Country) + 00001 (Company) + XXXX (Product) + C
     * (Check Digit) Total: 13 digits Used by the manual "Generate Barcode"
     * button.
     */
    public String generateInternalBarcode(Integer productId) {
        String countryCode = "893"; // Việt Nam
        String companyCode = "00001"; // Mã công ty (giả định cửa hàng dùng mã 00001)

        Random random = new Random();
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

    /**
     * Generate internal barcode for packaging units (unit conversions). Format:
     * 20 + ProductID(4 digits) + VariantID(4 digits) + Random(3 digits) Total:
     * 13 digits Prefix 20 = store-created product (EAN-13 internal use range
     * 20-29).
     */
    public String generateInternalBarcodeForPackaging(Integer productId, Integer variantId) {
        String prefix = "20";
        String prodPart = String.format("%04d", productId % 10000);
        String varPart = String.format("%04d", variantId % 10000);

        Random random = new Random();
        String randomPart = String.format("%03d", random.nextInt(1000));

        String barcode = prefix + prodPart + varPart + randomPart;

        // Ensure uniqueness
        while (productVariantRepository.existsByBarcode(barcode)) {
            randomPart = String.format("%03d", random.nextInt(1000));
            barcode = prefix + prodPart + varPart + randomPart;
        }

        return barcode;
    }

    /**
     * Generate SKU for a packaging variant created via unit conversion. Appends
     * the unit abbreviation + conversion factor to the base variant's SKU.
     * Example: BEV-COCA-COLA-LON → BEV-COCA-COLA-LOC6
     */
    public String generateSkuForConversion(ProductVariant baseVariant, Unit toUnit,
            java.math.BigDecimal conversionFactor) {
        String unitAbbr = abbreviate(toUnit.getName(), 5);
        int factor = conversionFactor.intValue();

        // Build base: take the base variant's SKU and replace the last segment (unit
        // part)
        String baseSku = baseVariant.getSku();
        String skuPrefix;
        int lastDash = baseSku.lastIndexOf('-');
        if (lastDash > 0) {
            skuPrefix = baseSku.substring(0, lastDash);
        } else {
            skuPrefix = baseSku;
        }

        String newSku = skuPrefix + "-" + unitAbbr + factor;

        // Ensure uniqueness
        String finalSku = newSku;
        int suffix = 1;
        while (productVariantRepository.existsBySku(finalSku)) {
            finalSku = newSku + "-" + suffix;
            suffix++;
        }

        return finalSku;
    }

    private int calculateEan13CheckDigit(String barcode12) {
        int sum = 0;
        for (int i = 0; i < 12; i++) {
            int digit = Character.getNumericValue(barcode12.charAt(i));
            sum += (i % 2 == 0) ? digit : digit * 3;
        }
        int checkDigit = 10 - (sum % 10);
        return (checkDigit == 10) ? 0 : checkDigit;
    }

    private Map<String, String> normalizeAttributesForPersistence(Map<String, String> rawAttributes) {
        if (rawAttributes == null || rawAttributes.isEmpty()) {
            return new java.util.HashMap<>();
        }

        Map<String, String> normalizedAttributes = new LinkedHashMap<>();
        Set<String> normalizedKeys = new HashSet<>();

        for (Map.Entry<String, String> entry : rawAttributes.entrySet()) {
            String rawKey = entry.getKey();
            if (rawKey == null || rawKey.isBlank()) {
                continue;
            }

            String trimmedKey = rawKey.trim();
            String normalizedKey = java.text.Normalizer.normalize(trimmedKey, java.text.Normalizer.Form.NFD)
                    .replaceAll("\\p{M}", "")
                    .replaceAll("[đĐ]", "d")
                    .toLowerCase(Locale.ROOT)
                    .replaceAll("\\s+", " ");

            if (normalizedKeys.add(normalizedKey)) {
                normalizedAttributes.put(trimmedKey, entry.getValue());
            }
        }

        return new java.util.HashMap<>(normalizedAttributes);
    }

    public void toggleVariantStatus(Integer variantId) {
        ProductVariant variant = productVariantValidator.requireExistingVariant(variantId);
        productVariantValidator.validateCanActivateOnToggle(variant);

        boolean willBeActive = !variant.isActive();
        variant.setActive(willBeActive);
        productVariantRepository.save(variant);
    }

    public void deleteVariant(Integer variantId) {
        ProductVariant variant = productVariantValidator.requireExistingVariant(variantId);
        productVariantValidator.validateDeletableWithinTwoMinutes(variant);

        List<InventoryStock> stocks = inventoryStockRepository.findByVariantId(variantId);
        if (stocks != null && !stocks.isEmpty()) {
            inventoryStockRepository.deleteAll(stocks);
        }

        List<ProductBatch> batches = productBatchRepository.findByVariantId(variantId);
        if (batches != null && !batches.isEmpty()) {
            productBatchRepository.deleteAll(batches);
        }

        if (variant.getProduct() != null && variant.getUnit() != null) {
            List<UnitConversion> conversions = unitConversionRepository.findByProductIdAndToUnitId(
                    variant.getProduct().getId(),
                    variant.getUnit().getId());
            unitConversionRepository.deleteByVariantId(variantId);
            if (conversions != null && !conversions.isEmpty()) {
                unitConversionRepository.deleteAll(conversions);
            }
        } else {
            unitConversionRepository.deleteByVariantId(variantId);
        }

        productVariantRepository.deleteById(variantId);
    }

    /**
     * Create an abbreviation from a string: take first N consonants/chars,
     * uppercase, no spaces.
     */
    private String abbreviate(String input, int maxLen) {
        if (input == null || input.isEmpty()) {
            return "";
        }
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
        Product product = variant.getProduct();
        String productName = product != null ? product.getName() : "";
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

        if (product != null && product.getId() != null && variant.getUnit() != null && variant.getUnit().getId() != null) {
            List<UnitConversion> conversions = unitConversionRepository.findByProductIdAndToUnitId(
                    product.getId(),
                    variant.getUnit().getId());

            UnitConversion matchedConversion = conversions.stream()
                    .filter(conversion -> conversion != null
                    && conversion.getVariant() != null
                    && conversion.getVariant().getId() != null
                    && !conversion.getVariant().getId().equals(variant.getId())
                    && conversion.getConversionFactor() != null
                    && conversion.getConversionFactor().intValue() > 0)
                    .findFirst()
                    .orElse(null);

            if (matchedConversion != null) {
                Integer baseVariantId = matchedConversion.getVariant().getId();
                int conversionFactor = matchedConversion.getConversionFactor().intValue();
                int baseStockQty = inventoryStockRepository.findByVariantId(baseVariantId)
                        .stream()
                        .mapToInt(stock -> stock.getQuantity() != null ? stock.getQuantity() : 0)
                        .sum();
                stockQty = baseStockQty / conversionFactor;
            }
        }

        response.setStockQuantity(stockQty);

        // Get cost price from latest batch
        productBatchRepository.findFirstByVariantIdOrderByIdDesc(variant.getId())
                .ifPresent(latestBatch -> response.setCostPrice(latestBatch.getCostPrice()));

        // Get category and brand names
        if (product != null && product.getCategory() != null) {
            response.setCategoryName(product.getCategory().getName());
        }
        if (product != null && product.getBrand() != null) {
            response.setBrandName(product.getBrand().getName());
        }

        // Unit Conversions (inline mapping to avoid circular dependency)
        List<UnitConversionResponse> conversions = unitConversionRepository.findByVariantId(variant.getId())
                .stream()
                .map(this::mapConversionToResponse)
                .collect(Collectors.toList());
        response.setUnitConversions(conversions);

        // Active Variant Price
        variantPriceRepository.findFirstByVariantIdAndStatus(variant.getId(), VariantPriceStatus.ACTIVE)
                .ifPresent(activePrice -> {
                    response.setActivePurchasePrice(activePrice.getPurchasePrice());
                    if (activePrice.getPurchasePrice() != null) {
                        response.setCostPrice(activePrice.getPurchasePrice());
                    }
                    response.setActiveSellingPrice(activePrice.getSellingPrice());
                    response.setActiveTaxPercent(activePrice.getTaxPercent());
                    response.setActiveEffectiveDate(activePrice.getEffectiveDate());
                    response.setActiveExpiryDate(activePrice.getExpiryDate());
                });

        return response;
    }

    private UnitConversionResponse mapConversionToResponse(UnitConversion entity) {
        UnitConversionResponse response = new UnitConversionResponse();
        response.setId(entity.getId());
        response.setVariantId(entity.getVariant().getId());
        response.setToUnitId(entity.getToUnit().getId());
        response.setToUnitName(entity.getToUnit().getName());
        response.setToUnitCode(entity.getToUnit().getCode());
        response.setConversionFactor(entity.getConversionFactor());
        response.setSellPrice(entity.getSellPrice());
        response.setDescription(entity.getDescription());
        response.setIsActive(entity.isActive());
        return response;
    }
}
