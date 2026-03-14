package com.smalltrend.service.products;

import com.smalltrend.dto.products.UnitConversionRequest;
import com.smalltrend.dto.products.UnitConversionResponse;
import com.smalltrend.entity.Product;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.ProductBatch;
import com.smalltrend.entity.InventoryStock;
import com.smalltrend.entity.Unit;
import com.smalltrend.entity.UnitConversion;
import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.repository.UnitConversionRepository;
import com.smalltrend.repository.UnitRepository;
import com.smalltrend.repository.InventoryStockRepository;
import com.smalltrend.repository.ProductBatchRepository;
import com.smalltrend.service.ProductVariantService;
import com.smalltrend.service.UnitConversionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UnitConversionServiceTest {

    @Mock
    private UnitConversionRepository unitConversionRepository;
    @Mock
    private ProductVariantRepository productVariantRepository;
    @Mock
    private UnitRepository unitRepository;
    @Mock
    private ProductVariantService productVariantService;
    @Mock
    private InventoryStockRepository inventoryStockRepository;
    @Mock
    private ProductBatchRepository productBatchRepository;

    @InjectMocks
    private UnitConversionService unitConversionService;

    private ProductVariant baseVariant;
    private Unit toUnit;
    private UnitConversion testConversion;
    private UnitConversionRequest request;
    private Product product;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setId(10);
        product.setName("Coca");

        baseVariant = new ProductVariant();
        baseVariant.setId(1);
        baseVariant.setProduct(product);
        baseVariant.setSku("BEV-COCA");
        baseVariant.setActive(true);

        toUnit = new Unit();
        toUnit.setId(2);
        toUnit.setName("Thùng");
        toUnit.setCode("BOX");

        testConversion = new UnitConversion();
        testConversion.setId(100);
        testConversion.setVariant(baseVariant);
        testConversion.setToUnit(toUnit);
        testConversion.setConversionFactor(BigDecimal.valueOf(24));
        testConversion.setActive(true);

        request = new UnitConversionRequest();
        request.setToUnitId(2);
        request.setConversionFactor(BigDecimal.valueOf(24));
        request.setSellPrice(BigDecimal.valueOf(240000));
    }

    @Test
    void getConversionsByVariantId_returnMapping() {
        when(unitConversionRepository.findByVariantId(1)).thenReturn(List.of(testConversion));
        List<UnitConversionResponse> result = unitConversionService.getConversionsByVariantId(1);
        assertEquals(1, result.size());
        assertEquals(2, result.get(0).getToUnitId());
    }

    @Test
    void addConversion_VariantNotFound_ThrowException() {
        when(productVariantRepository.findById(99)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> unitConversionService.addConversion(99, request));
         assertEquals("Không tìm thấy biến thể với ID: 99", ex.getMessage());
    }

    @Test
    void addConversion_UnitNotFound_ThrowException() {
        when(productVariantRepository.findById(1)).thenReturn(Optional.of(baseVariant));
        when(unitRepository.findById(2)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> unitConversionService.addConversion(1, request));
        assertEquals("Không tìm thấy đơn vị với ID: 2", ex.getMessage());
    }

    @Test
    void addConversion_AlreadyExists_ThrowException() {
        when(productVariantRepository.findById(1)).thenReturn(Optional.of(baseVariant));
        when(unitRepository.findById(2)).thenReturn(Optional.of(toUnit));
        when(unitConversionRepository.existsByVariantIdAndToUnitId(1, 2)).thenReturn(true);
        
        RuntimeException ex = assertThrows(RuntimeException.class, () -> unitConversionService.addConversion(1, request));
        assertEquals("Quy đổi sang đơn vị 'Thùng' đã tồn tại cho biến thể này!", ex.getMessage());
    }

    @Test
    void addConversion_Success_CopyStock() {
        when(productVariantRepository.findById(1)).thenReturn(Optional.of(baseVariant));
        when(unitRepository.findById(2)).thenReturn(Optional.of(toUnit));
        when(unitConversionRepository.existsByVariantIdAndToUnitId(1, 2)).thenReturn(false);

        // Mock saving conversion
        when(unitConversionRepository.save(any(UnitConversion.class))).thenReturn(testConversion);

        // Mock auto generate SKU & Barcode
        when(productVariantService.generateSkuForConversion(eq(baseVariant), eq(toUnit), any(BigDecimal.class)))
                .thenReturn("BEV-COCA-BOX24");
        when(productVariantService.generateInternalBarcodeForPackaging(10, 500))
                .thenReturn("2010100500123");

        // Mock saving packaging variant
        ProductVariant savedVariant = new ProductVariant();
        savedVariant.setId(500);
        savedVariant.setSku("BEV-COCA-BOX24");
        savedVariant.setBarcode("2010100500123");
        savedVariant.setAttributes(new java.util.HashMap<String, String>());
        when(productVariantRepository.saveAndFlush(any(ProductVariant.class))).thenReturn(savedVariant);

        // Mock Inventory share
        ProductBatch baseBatch = new ProductBatch();
        baseBatch.setCostPrice(BigDecimal.valueOf(8000));
        baseBatch.setMfgDate(LocalDate.now());
        baseBatch.setExpiryDate(LocalDate.now().plusMonths(6));

        InventoryStock baseStock = new InventoryStock();
        baseStock.setQuantity(48); // Tồn kho gốc 48 lon
        baseStock.setBatch(baseBatch);
        
        when(inventoryStockRepository.findByVariantId(1)).thenReturn(List.of(baseStock));
        
        ProductBatch savedBatch = new ProductBatch();
        when(productBatchRepository.save(any(ProductBatch.class))).thenReturn(savedBatch);

        UnitConversionResponse result = unitConversionService.addConversion(1, request);

        assertNotNull(result);
        assertEquals(500, result.getAutoCreatedVariantId());
        assertEquals("BEV-COCA-BOX24", result.getAutoCreatedSku());
        
        // Verify 1 conversion saved
        verify(unitConversionRepository).save(any(UnitConversion.class));
        // Verify packaging variant saved twice (init + barcode)
        verify(productVariantRepository, times(1)).saveAndFlush(any(ProductVariant.class));
        // Verify inventory copy: 48 / 24 = 2 Thùng
        verify(inventoryStockRepository).save(argThat(stock -> stock.getQuantity() == 2));
    }

    @Test
    void updateConversion_NotFound() {
        when(unitConversionRepository.findById(99)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> unitConversionService.updateConversion(99, request));
    }

    @Test
    void updateConversion_Duplicate_Throws() {
        when(unitConversionRepository.findById(100)).thenReturn(Optional.of(testConversion));
        when(unitRepository.findById(2)).thenReturn(Optional.of(toUnit));
        when(unitConversionRepository.existsByVariantIdAndToUnitIdAndIdNot(1, 2, 100)).thenReturn(true);
        
        assertThrows(RuntimeException.class, () -> unitConversionService.updateConversion(100, request));
    }

    @Test
    void updateConversion_Success() {
        when(unitConversionRepository.findById(100)).thenReturn(Optional.of(testConversion));
        when(unitRepository.findById(2)).thenReturn(Optional.of(toUnit));
        when(unitConversionRepository.existsByVariantIdAndToUnitIdAndIdNot(1, 2, 100)).thenReturn(false);
        when(unitConversionRepository.save(testConversion)).thenReturn(testConversion);

        request.setIsActive(false);
        UnitConversionResponse res = unitConversionService.updateConversion(100, request);
        assertNotNull(res);
        assertFalse(testConversion.isActive());
    }

    @Test
    void deleteConversion_Success() {
        when(unitConversionRepository.findById(100)).thenReturn(Optional.of(testConversion));
        ProductVariant autoVariant = new ProductVariant();
        autoVariant.setId(500);
        when(productVariantRepository.findByProductIdAndUnitId(10, 2)).thenReturn(List.of(autoVariant));
        doNothing().when(productVariantService).deleteVariant(500);

        unitConversionService.deleteConversion(100);

        verify(unitConversionRepository).deleteById(100);
        verify(productVariantService).deleteVariant(500);
    }
    
    @Test
    void deleteConversion_NotFound() {
        when(unitConversionRepository.findById(99)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> unitConversionService.deleteConversion(99));
    }
}
