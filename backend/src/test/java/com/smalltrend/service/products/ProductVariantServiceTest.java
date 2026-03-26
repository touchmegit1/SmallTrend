package com.smalltrend.service.products;

import com.smalltrend.dto.products.CreateVariantRequest;
import com.smalltrend.dto.products.ProductVariantRespone;
import com.smalltrend.entity.*;
import com.smalltrend.repository.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import com.smalltrend.validation.product.ProductVariantValidator;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProductVariantServiceTest {

    @Mock
    private ProductVariantRepository productVariantRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UnitRepository unitRepository;
    @Mock
    private InventoryStockRepository inventoryStockRepository;
    @Mock
    private ProductBatchRepository productBatchRepository;
    @Mock
    private UnitConversionRepository unitConversionRepository;
    @Mock
    private VariantPriceRepository variantPriceRepository;
    @Mock
    private ProductVariantValidator productVariantValidator;

    @InjectMocks
    private ProductVariantService productVariantService;

    private Product testProduct;
    private Unit testUnit;
    private ProductVariant testVariant;
    private CreateVariantRequest request;

    @BeforeEach
    void setUp() {
        Category cat = new Category();
        cat.setCode("CAT");
        cat.setName("Category Name");

        Brand brand = new Brand();
        brand.setName("Brand Name");

        testProduct = new Product();
        testProduct.setId(10);
        testProduct.setName("Test Product");
        testProduct.setIsActive(true);
        testProduct.setCategory(cat);
        testProduct.setBrand(brand);

        TaxRate tax = new TaxRate();
        tax.setRate(BigDecimal.valueOf(10));
        tax.setName("VAT");
        testProduct.setTaxRate(tax);

        testUnit = new Unit();
        testUnit.setId(20);
        testUnit.setName("Box");
        testUnit.setCode("BOX");

        testVariant = new ProductVariant();
        testVariant.setId(1);
        testVariant.setProduct(testProduct);
        testVariant.setUnit(testUnit);
        testVariant.setSku("SKU-123");
        testVariant.setBarcode("8930000100010");
        testVariant.setPluCode("1234");
        testVariant.setSellPrice(BigDecimal.valueOf(100));
        testVariant.setActive(true);
        testVariant.setCreatedAt(LocalDateTime.now().minusMinutes(1));

        Map<String, String> attrs = new HashMap<>();
        attrs.put("Color", "Red");
        testVariant.setAttributes(attrs);

        request = new CreateVariantRequest();
        request.setUnitId(20);
        request.setSku("SKU-123");
        request.setBarcode("8930000100010");
        request.setPluCode("1234");
        request.setSellPrice(BigDecimal.valueOf(100));
        request.setCostPrice(BigDecimal.valueOf(80));
        request.setIsActive(true);
    }

    @Test
    void getAllProductVariants_EmptyParams() {
        when(productVariantRepository.findAll()).thenReturn(List.of(testVariant));
        when(inventoryStockRepository.findByVariantId(1)).thenReturn(Collections.emptyList());
        when(productBatchRepository.findFirstByVariantIdOrderByIdDesc(1)).thenReturn(Optional.empty());

        List<ProductVariantRespone> result = productVariantService.getAllProductVariants(null, null);
        assertEquals(1, result.size());
        assertEquals("Test Product Box - Red", result.get(0).getName());
        assertEquals(BigDecimal.valueOf(10), result.get(0).getTaxRate());
    }

    @Test
    void getAllProductVariants_WithBarcode() {
        when(productVariantRepository.findAll()).thenReturn(List.of(testVariant));
        List<ProductVariantRespone> result = productVariantService.getAllProductVariants(null, "893");
        assertEquals(1, result.size());
    }

    @Test
    void getAllProductVariants_WithSearch() {
        when(productVariantRepository.findAll()).thenReturn(List.of(testVariant));
        when(inventoryStockRepository.findByVariantId(1)).thenReturn(Collections.emptyList());
        when(productBatchRepository.findFirstByVariantIdOrderByIdDesc(1)).thenReturn(Optional.empty());
        when(unitConversionRepository.findByVariantId(1)).thenReturn(Collections.emptyList());
        when(variantPriceRepository.findFirstByVariantIdAndStatus(anyInt(), any())).thenReturn(Optional.empty());

        List<ProductVariantRespone> result = productVariantService.getAllProductVariants("SKU-123", null);
        assertEquals(1, result.size());
    }

    @Test
    void getAllProductVariants_WithSearchAndNullProduct_DoesNotThrow() {
        testVariant.setProduct(null);
        when(productVariantRepository.findAll()).thenReturn(List.of(testVariant));
        when(inventoryStockRepository.findByVariantId(1)).thenReturn(Collections.emptyList());
        when(productBatchRepository.findFirstByVariantIdOrderByIdDesc(1)).thenReturn(Optional.empty());
        when(unitConversionRepository.findByVariantId(1)).thenReturn(Collections.emptyList());
        when(variantPriceRepository.findFirstByVariantIdAndStatus(anyInt(), any())).thenReturn(Optional.empty());

        List<ProductVariantRespone> result = productVariantService.getAllProductVariants("SKU-123", null);

        assertEquals(1, result.size());
        assertNull(result.get(0).getCategoryName());
        assertNull(result.get(0).getBrandName());
        assertNull(result.get(0).getTaxRate());
    }

    @Test
    void getVariantsByProductId() {
        when(productVariantRepository.findByProductId(10)).thenReturn(List.of(testVariant));
        List<ProductVariantRespone> result = productVariantService.getVariantsByProductId(10);
        assertEquals(1, result.size());
    }

    @Test
    void createVariant_Success() {
        when(productRepository.findById(10)).thenReturn(Optional.of(testProduct));
        when(unitRepository.findById(20)).thenReturn(Optional.of(testUnit));
        when(productVariantRepository.existsBySku("SKU-123")).thenReturn(false);
        when(productVariantRepository.existsByBarcode("8930000100010")).thenReturn(false);
        when(productVariantRepository.save(any(ProductVariant.class))).thenReturn(testVariant);

        ProductVariantRespone res = productVariantService.createVariant(10, request);
        assertNotNull(res);
        verify(productBatchRepository).save(any(ProductBatch.class));
    }

    @Test
    void createVariant_InactiveProductValidationFails() {
        testProduct.setIsActive(false);
        when(productRepository.findById(10)).thenReturn(Optional.of(testProduct));
        when(unitRepository.findById(20)).thenReturn(Optional.of(testUnit));

        assertThrows(RuntimeException.class, () -> productVariantService.createVariant(10, request));
    }

    @Test
    void createVariant_NullSku() {
        request.setSku("  ");
        when(productRepository.findById(10)).thenReturn(Optional.of(testProduct));
        when(unitRepository.findById(20)).thenReturn(Optional.of(testUnit));

        assertThrows(RuntimeException.class, () -> productVariantService.createVariant(10, request));
    }

    @Test
    void createVariant_BarcodeValidation() {
        request.setBarcode("invalid");
        when(productVariantValidator.requireExistingProduct(10)).thenReturn(testProduct);
        when(productVariantValidator.requireExistingUnit(20)).thenReturn(testUnit);
        doThrow(new RuntimeException("Barcode phải gồm 12-13 chữ số."))
                .when(productVariantValidator).validateBarcodeFormat("invalid");

        RuntimeException ex = assertThrows(RuntimeException.class, () -> productVariantService.createVariant(10, request));
        assertEquals("Barcode phải gồm 12-13 chữ số.", ex.getMessage());
    }

    @Test
    void createVariant_BarcodeExists() {
        when(productVariantValidator.requireExistingProduct(10)).thenReturn(testProduct);
        when(productVariantValidator.requireExistingUnit(20)).thenReturn(testUnit);
        doThrow(new RuntimeException("Mã Barcode đã tồn tại trong hệ thống. Vui lòng nhập mã khác."))
                .when(productVariantValidator).validateBarcodeUniqueForCreate("8930000100010");

        RuntimeException ex = assertThrows(RuntimeException.class, () -> productVariantService.createVariant(10, request));
        assertEquals("Mã Barcode đã tồn tại trong hệ thống. Vui lòng nhập mã khác.", ex.getMessage());
    }

    @Test
    void createVariant_PluValidation() {
        request.setPluCode("12");
        when(productVariantValidator.requireExistingProduct(10)).thenReturn(testProduct);
        when(productVariantValidator.requireExistingUnit(20)).thenReturn(testUnit);
        doThrow(new RuntimeException("Mã PLU phải gồm 4-5 chữ số."))
                .when(productVariantValidator).validatePluCodeFormat("12");

        RuntimeException ex = assertThrows(RuntimeException.class, () -> productVariantService.createVariant(10, request));
        assertEquals("Mã PLU phải gồm 4-5 chữ số.", ex.getMessage());
    }

    @Test
    void updateVariant_Success_UpdatesLatestBatch() {
        when(productVariantValidator.requireExistingVariant(1)).thenReturn(testVariant);
        when(productVariantValidator.requireExistingUnit(20)).thenReturn(testUnit);

        ProductBatch oldBatch = new ProductBatch();
        oldBatch.setCostPrice(BigDecimal.valueOf(50));
        when(productBatchRepository.findFirstByVariantIdOrderByIdDesc(1)).thenReturn(Optional.of(oldBatch));

        when(productVariantRepository.save(testVariant)).thenReturn(testVariant);

        request.setCostPrice(BigDecimal.valueOf(90));
        request.setImageUrl("new.png");
        ProductVariantRespone res = productVariantService.updateVariant(1, request);

        assertEquals(BigDecimal.valueOf(90), oldBatch.getCostPrice());
        verify(productBatchRepository).save(oldBatch);
    }

    @Test
    void updateVariant_CreateNewBatchWhenNoneExist() {
        when(productVariantValidator.requireExistingVariant(1)).thenReturn(testVariant);
        when(productVariantValidator.requireExistingUnit(20)).thenReturn(testUnit);

        when(productBatchRepository.findFirstByVariantIdOrderByIdDesc(1)).thenReturn(Optional.empty());
        when(productVariantRepository.save(testVariant)).thenReturn(testVariant);

        request.setCostPrice(BigDecimal.valueOf(90));
        productVariantService.updateVariant(1, request);

        verify(productBatchRepository, times(1)).save(any(ProductBatch.class));
    }

    @Test
    void generateSku_BaseLogicAndCollision() {
        when(productVariantValidator.requireExistingProduct(10)).thenReturn(testProduct);
        when(unitRepository.findById(20)).thenReturn(Optional.of(testUnit));

        when(productVariantRepository.existsBySku("CAT-BRAN-TESTPR-BOX")).thenReturn(true);
        when(productVariantRepository.existsBySku("CAT-BRAN-TESTPR-BOX-1")).thenReturn(false);

        String sku = productVariantService.generateSku(10, 20);
        assertEquals("CAT-BRAN-TESTPR-BOX-1", sku);
    }

    @Test
    void generateInternalBarcode_FormatAndCollision() {
        when(productVariantRepository.existsByBarcode(anyString())).thenReturn(true).thenReturn(false);
        String barcode = productVariantService.generateInternalBarcode(10);
        assertEquals(13, barcode.length());
        assertTrue(barcode.startsWith("89300001"));
    }

    @Test
    void generateInternalBarcodeForPackaging_FormatAndCollision() {
        when(productVariantRepository.existsByBarcode(anyString())).thenReturn(true).thenReturn(false);
        String barcode = productVariantService.generateInternalBarcodeForPackaging(10, 1);
        assertEquals(13, barcode.length());
        assertTrue(barcode.startsWith("2000100001"));
    }

    @Test
    void generateSkuForConversion_Collision() {
        when(productVariantRepository.existsBySku("SKU-BOX24")).thenReturn(true);
        when(productVariantRepository.existsBySku("SKU-BOX24-1")).thenReturn(false);

        String sku = productVariantService.generateSkuForConversion(testVariant, testUnit, BigDecimal.valueOf(24));
        assertEquals("SKU-BOX24-1", sku);
    }

    @Test
    void toggleVariantStatus_Allowed() {
        when(productVariantValidator.requireExistingVariant(1)).thenReturn(testVariant);
        productVariantService.toggleVariantStatus(1);
        assertFalse(testVariant.isActive());
    }

    @Test
    void toggleVariantStatus_NotAllowedWhenProductInactive() {
        testVariant.setActive(false);
        testProduct.setIsActive(false);
        when(productVariantRepository.findById(1)).thenReturn(Optional.of(testVariant));

        assertThrows(RuntimeException.class, () -> productVariantService.toggleVariantStatus(1));
    }

    @Test
    void deleteVariant_Success_Within2Minutes() {
        when(productVariantValidator.requireExistingVariant(1)).thenReturn(testVariant);

        InventoryStock st = new InventoryStock();
        when(inventoryStockRepository.findByVariantId(1)).thenReturn(List.of(st));

        ProductBatch pb = new ProductBatch();
        when(productBatchRepository.findByVariantId(1)).thenReturn(List.of(pb));

        UnitConversion uc = new UnitConversion();
        when(unitConversionRepository.findByProductIdAndToUnitId(10, 20)).thenReturn(List.of(uc));

        productVariantService.deleteVariant(1);

        verify(inventoryStockRepository).deleteAll(anyList());
        verify(productBatchRepository).deleteAll(anyList());
        verify(unitConversionRepository).deleteByVariantId(1);
        verify(unitConversionRepository).deleteAll(anyList());
        verify(productVariantRepository).deleteById(1);
    }

    @Test
    void deleteVariant_Past2Minutes_ThrowsException() {
        testVariant.setCreatedAt(LocalDateTime.now().minusMinutes(5));
        when(productVariantValidator.requireExistingVariant(1)).thenReturn(testVariant);
        doThrow(new RuntimeException("Biến thể đã tạo quá 2 phút, bạn không thể xoá biến thể này nữa!"))
                .when(productVariantValidator).validateDeletableWithinTwoMinutes(testVariant);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> productVariantService.deleteVariant(1));
        assertEquals("Biến thể đã tạo quá 2 phút, bạn không thể xoá biến thể này nữa!", ex.getMessage());
    }
}
