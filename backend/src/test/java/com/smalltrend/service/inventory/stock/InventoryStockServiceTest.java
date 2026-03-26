package com.smalltrend.service.inventory.stock;

import com.smalltrend.dto.inventory.StockAdjustRequest;
import com.smalltrend.dto.inventory.StockImportRequest;
import com.smalltrend.entity.*;
import com.smalltrend.service.inventory.shared.InventoryOutOfStockNotificationService;
import com.smalltrend.service.inventory.shared.InventoryStockService;
import com.smalltrend.entity.enums.StockTransactionType;
import com.smalltrend.repository.*;
import com.smalltrend.validation.inventory.stock.InventoryStockRequestValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryStockServiceTest {

    @Mock
    private InventoryStockRepository inventoryStockRepository;
    @Mock
    private StockMovementRepository stockMovementRepository;
    @Mock
    private ProductVariantRepository productVariantRepository;
    @Mock
    private UnitConversionRepository unitConversionRepository;
    @Mock
    private ProductBatchRepository productBatchRepository;
    @Mock
    private LocationRepository locationRepository;
    @Mock
    private InventoryOutOfStockNotificationService outOfStockNotificationService;
    @Mock
    private InventoryStockRequestValidator inventoryStockRequestValidator;

    private InventoryStockService inventoryStockService;

    @Captor
    private ArgumentCaptor<InventoryStock> stockCaptor;
    
    @Captor
    private ArgumentCaptor<StockMovement> movementCaptor;

    @BeforeEach
    void setUp() {
        inventoryStockService = new InventoryStockService(
                inventoryStockRepository,
                stockMovementRepository,
                productVariantRepository,
                unitConversionRepository,
                productBatchRepository,
                locationRepository,
                outOfStockNotificationService,
                inventoryStockRequestValidator
        );
        lenient().when(inventoryStockRepository.save(any(InventoryStock.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    // ────────────────────────────────────────────────────────────────────────
    // getTotalStockForVariant
    // ────────────────────────────────────────────────────────────────────────

    @Test
    void getTotalStockForVariant_shouldReturnSum() {
        when(inventoryStockRepository.sumQuantityByVariantId(1)).thenReturn(100);

        int total = inventoryStockService.getTotalStockForVariant(1);

        assertEquals(100, total);
        verify(inventoryStockRepository).sumQuantityByVariantId(1);
    }

    // ────────────────────────────────────────────────────────────────────────
    // importStock
    // ────────────────────────────────────────────────────────────────────────

    @Test
    void importStock_shouldImportForBaseUnitVariant() {
        StockImportRequest request = new StockImportRequest();
        request.setVariantId(1);
        request.setBatchId(10);
        request.setLocationId(100);
        request.setQuantity(50);
        request.setNotes("Test import");

        Product product = Product.builder().id(2).build();
        ProductVariant variant = ProductVariant.builder().id(1).isBaseUnit(true).product(product).build();
        ProductBatch batch = ProductBatch.builder().id(10).build();
        Location location = Location.builder().id(100).build();

        when(productVariantRepository.findById(1)).thenReturn(Optional.of(variant));
        when(productBatchRepository.findById(10)).thenReturn(Optional.of(batch));
        when(locationRepository.findById(100)).thenReturn(Optional.of(location));

        InventoryStock existingStock = InventoryStock.builder().quantity(10).build();
        when(inventoryStockRepository.findByVariantIdAndBatchIdAndLocationId(1, 10, 100))
                .thenReturn(Optional.of(existingStock));

        inventoryStockService.importStock(request);

        verify(inventoryStockRepository).save(stockCaptor.capture());
        InventoryStock savedStock = stockCaptor.getValue();
        assertEquals(60, savedStock.getQuantity());

        verify(stockMovementRepository).save(movementCaptor.capture());
        StockMovement savedMovement = movementCaptor.getValue();
        assertEquals("IN", savedMovement.getType());
        assertEquals(50, savedMovement.getQuantity());
        assertEquals("Test import", savedMovement.getNotes());
    }

    @Test
    void importStock_shouldImportForPackagingUnitVariant() {
        StockImportRequest request = new StockImportRequest();
        request.setVariantId(2); // Non-base unit
        request.setBatchId(10);
        request.setLocationId(100);
        request.setQuantity(5);

        Product product = Product.builder().id(5).build();
        Unit pkgUnit = Unit.builder().id(20).build();
        ProductVariant pkgVariant = ProductVariant.builder().id(2).isBaseUnit(false).product(product).unit(pkgUnit).build();
        
        ProductVariant baseVariant = ProductVariant.builder().id(1).isBaseUnit(true).product(product).build();
        ProductBatch batch = ProductBatch.builder().id(10).build();
        Location location = Location.builder().id(100).build();
        
        UnitConversion unitConversion = UnitConversion.builder().conversionFactor(new BigDecimal("10")).build();

        when(productVariantRepository.findById(2)).thenReturn(Optional.of(pkgVariant));
        when(productBatchRepository.findById(10)).thenReturn(Optional.of(batch));
        when(locationRepository.findById(100)).thenReturn(Optional.of(location));
        when(productVariantRepository.findByProductIdAndIsBaseUnitTrue(5)).thenReturn(Optional.of(baseVariant));
        when(unitConversionRepository.findByVariantIdAndToUnitId(1, 20)).thenReturn(Optional.of(unitConversion));

        when(inventoryStockRepository.findByVariantIdAndBatchIdAndLocationId(1, 10, 100))
                .thenReturn(Optional.empty());

        inventoryStockService.importStock(request);

        verify(inventoryStockRepository).save(stockCaptor.capture());
        InventoryStock savedStock = stockCaptor.getValue();
        assertEquals(50, savedStock.getQuantity()); // 5 * 10 = 50

        verify(stockMovementRepository).save(movementCaptor.capture());
        StockMovement savedMovement = movementCaptor.getValue();
        assertEquals(50, savedMovement.getQuantity());
        assertEquals(baseVariant, savedMovement.getVariant());
    }

    @Test
    void importStock_shouldThrowException_whenVariantNotFound() {
        StockImportRequest request = new StockImportRequest();
        request.setVariantId(1);
        when(productVariantRepository.findById(1)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> inventoryStockService.importStock(request));
        assertEquals("Variant not found: 1", ex.getMessage());
    }

    @Test
    void importStock_shouldThrowException_whenBatchNotFound() {
        StockImportRequest request = new StockImportRequest();
        request.setVariantId(1);
        request.setBatchId(10);

        Product product = Product.builder().id(2).build();
        ProductVariant variant = ProductVariant.builder().id(1).isBaseUnit(true).product(product).build();

        when(productVariantRepository.findById(1)).thenReturn(Optional.of(variant));
        when(productBatchRepository.findById(10)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> inventoryStockService.importStock(request));
        assertEquals("Batch not found: 10", ex.getMessage());
    }

    @Test
    void importStock_shouldThrowException_whenLocationNotFound() {
        StockImportRequest request = new StockImportRequest();
        request.setVariantId(1);
        request.setBatchId(10);
        request.setLocationId(100);

        Product product = Product.builder().id(2).build();
        ProductVariant variant = ProductVariant.builder().id(1).isBaseUnit(true).product(product).build();
        ProductBatch batch = ProductBatch.builder().id(10).build();

        when(productVariantRepository.findById(1)).thenReturn(Optional.of(variant));
        when(productBatchRepository.findById(10)).thenReturn(Optional.of(batch));
        when(locationRepository.findById(100)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> inventoryStockService.importStock(request));
        assertEquals("Location not found: 100", ex.getMessage());
    }

    @Test
    void importStock_shouldThrowException_whenBaseVariantNotFoundForPackaging() {
        StockImportRequest request = new StockImportRequest();
        request.setVariantId(2);
        request.setBatchId(10);
        request.setLocationId(100);
        request.setQuantity(5);

        Product product = Product.builder().id(5).build();
        Unit pkgUnit = Unit.builder().id(20).build();
        ProductVariant pkgVariant = ProductVariant.builder().id(2).isBaseUnit(false).product(product).unit(pkgUnit).build();
        ProductBatch batch = ProductBatch.builder().id(10).build();
        Location location = Location.builder().id(100).build();

        when(productVariantRepository.findById(2)).thenReturn(Optional.of(pkgVariant));
        when(productBatchRepository.findById(10)).thenReturn(Optional.of(batch));
        when(locationRepository.findById(100)).thenReturn(Optional.of(location));
        when(productVariantRepository.findByProductIdAndIsBaseUnitTrue(5)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> inventoryStockService.importStock(request));
        assertEquals("Base unit variant not found for product: 5", ex.getMessage());
    }

    @Test
    void importStock_shouldThrowException_whenUnitConversionNotFound() {
        StockImportRequest request = new StockImportRequest();
        request.setVariantId(2);
        request.setBatchId(10);
        request.setLocationId(100);
        request.setQuantity(5);

        Product product = Product.builder().id(5).build();
        Unit pkgUnit = Unit.builder().id(20).build();
        ProductVariant pkgVariant = ProductVariant.builder().id(2).isBaseUnit(false).product(product).unit(pkgUnit).build();
        ProductVariant baseVariant = ProductVariant.builder().id(1).isBaseUnit(true).product(product).build();
        ProductBatch batch = ProductBatch.builder().id(10).build();
        Location location = Location.builder().id(100).build();

        when(productVariantRepository.findById(2)).thenReturn(Optional.of(pkgVariant));
        when(productBatchRepository.findById(10)).thenReturn(Optional.of(batch));
        when(locationRepository.findById(100)).thenReturn(Optional.of(location));
        when(productVariantRepository.findByProductIdAndIsBaseUnitTrue(5)).thenReturn(Optional.of(baseVariant));
        when(unitConversionRepository.findByVariantIdAndToUnitId(1, 20)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> inventoryStockService.importStock(request));
        assertEquals("Unit conversion not found", ex.getMessage());
    }

    @Test
    void importStock_shouldTreatNullStockQuantityAsZero() {
        StockImportRequest request = new StockImportRequest();
        request.setVariantId(1);
        request.setBatchId(10);
        request.setLocationId(100);
        request.setQuantity(5);

        Product product = Product.builder().id(2).build();
        ProductVariant variant = ProductVariant.builder().id(1).isBaseUnit(true).product(product).build();
        ProductBatch batch = ProductBatch.builder().id(10).build();
        Location location = Location.builder().id(100).build();

        when(productVariantRepository.findById(1)).thenReturn(Optional.of(variant));
        when(productBatchRepository.findById(10)).thenReturn(Optional.of(batch));
        when(locationRepository.findById(100)).thenReturn(Optional.of(location));

        InventoryStock existingStock = InventoryStock.builder().quantity(null).build();
        when(inventoryStockRepository.findByVariantIdAndBatchIdAndLocationId(1, 10, 100))
                .thenReturn(Optional.of(existingStock));

        inventoryStockService.importStock(request);

        verify(inventoryStockRepository).save(stockCaptor.capture());
        assertEquals(5, stockCaptor.getValue().getQuantity());
        verify(outOfStockNotificationService).handleStockTransition(any(InventoryStock.class), eq(0), eq(5), eq("IMPORT_STOCK"));
    }

    // ────────────────────────────────────────────────────────────────────────
    // deductStock
    // ────────────────────────────────────────────────────────────────────────

    @Test
    void deductStock_shouldDeductForBaseUnitVariant_whenSufficientStock() {
        Product product = Product.builder().id(5).build();
        ProductVariant variant = ProductVariant.builder().id(1).sku("SKU1").isBaseUnit(true).product(product).build();
        
        InventoryStock stock1 = InventoryStock.builder().quantity(5).build();
        InventoryStock stock2 = InventoryStock.builder().quantity(10).build();

        when(inventoryStockRepository.findByVariantId(1)).thenReturn(List.of(stock1, stock2));

        inventoryStockService.deductStock(variant, 12, 99L, "Sale deduction");

        verify(inventoryStockRepository, times(2)).save(stockCaptor.capture());
        List<InventoryStock> savedStocks = stockCaptor.getAllValues();
        assertEquals(0, savedStocks.get(0).getQuantity()); // Deduct 5 from first
        assertEquals(3, savedStocks.get(1).getQuantity()); // Deduct 7 from second

        verify(stockMovementRepository, times(2)).save(movementCaptor.capture());
        List<StockMovement> savedMovements = movementCaptor.getAllValues();
        assertEquals(-5, savedMovements.get(0).getQuantity());
        assertEquals("OUT", savedMovements.get(0).getType());
        assertEquals(-7, savedMovements.get(1).getQuantity());
        assertEquals("OUT", savedMovements.get(1).getType());
    }

    @Test
    void deductStock_shouldThrowException_whenInsufficientStock() {
        Product product = Product.builder().id(5).build();
        ProductVariant variant = ProductVariant.builder().id(1).sku("SKU1").isBaseUnit(true).product(product).build();

        InventoryStock stock1 = InventoryStock.builder().quantity(5).build();

        when(inventoryStockRepository.findByVariantId(1)).thenReturn(List.of(stock1));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> inventoryStockService.deductStock(variant, 10, 99L, "Sale"));
        assertEquals("Not enough stock available for variant: SKU1", ex.getMessage());
    }

    @Test
    void deductStock_shouldConvertPackagingToBaseAndDeduct() {
        Product product = Product.builder().id(5).build();
        Unit pkgUnit = Unit.builder().id(20).build();
        ProductVariant pkgVariant = ProductVariant.builder().id(2).sku("PKG-SKU").isBaseUnit(false).product(product).unit(pkgUnit).build();
        ProductVariant baseVariant = ProductVariant.builder().id(1).sku("BASE-SKU").isBaseUnit(true).product(product).build();
        UnitConversion unitConversion = UnitConversion.builder().conversionFactor(new BigDecimal("10")).build();

        InventoryStock stock = InventoryStock.builder()
                .quantity(100)
                .batch(ProductBatch.builder().id(10).build())
                .location(Location.builder().id(100).build())
                .build();

        when(productVariantRepository.findByProductIdAndIsBaseUnitTrue(5)).thenReturn(Optional.of(baseVariant));
        when(unitConversionRepository.findByVariantIdAndToUnitId(1, 20)).thenReturn(Optional.of(unitConversion));
        when(inventoryStockRepository.findByVariantId(1)).thenReturn(List.of(stock));

        inventoryStockService.deductStock(pkgVariant, 5, 99L, "Sale packaging");

        verify(inventoryStockRepository).save(stockCaptor.capture());
        assertEquals(50, stockCaptor.getValue().getQuantity());
        verify(stockMovementRepository).save(movementCaptor.capture());
        assertEquals(-50, movementCaptor.getValue().getQuantity());
        verify(outOfStockNotificationService).handleStockTransition(any(InventoryStock.class), eq(100), eq(50), eq("SALE_ORDER"));
    }

    @Test
    void deductStock_shouldThrowException_whenBaseVariantNotFoundForPackaging() {
        Product product = Product.builder().id(5).build();
        Unit pkgUnit = Unit.builder().id(20).build();
        ProductVariant pkgVariant = ProductVariant.builder().id(2).sku("PKG-SKU").isBaseUnit(false).product(product).unit(pkgUnit).build();

        when(productVariantRepository.findByProductIdAndIsBaseUnitTrue(5)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> inventoryStockService.deductStock(pkgVariant, 1, 99L, "Sale"));
        assertEquals("Base unit variant not found for product: 5", ex.getMessage());
    }

    @Test
    void deductStock_shouldThrowException_whenUnitConversionNotFound() {
        Product product = Product.builder().id(5).build();
        Unit pkgUnit = Unit.builder().id(20).build();
        ProductVariant pkgVariant = ProductVariant.builder().id(2).sku("PKG-SKU").isBaseUnit(false).product(product).unit(pkgUnit).build();
        ProductVariant baseVariant = ProductVariant.builder().id(1).sku("BASE-SKU").isBaseUnit(true).product(product).build();

        when(productVariantRepository.findByProductIdAndIsBaseUnitTrue(5)).thenReturn(Optional.of(baseVariant));
        when(unitConversionRepository.findByVariantIdAndToUnitId(1, 20)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> inventoryStockService.deductStock(pkgVariant, 1, 99L, "Sale"));
        assertEquals("Unit conversion not found", ex.getMessage());
    }

    @Test
    void deductStock_shouldSkipZeroQuantityStock() {
        Product product = Product.builder().id(5).build();
        ProductVariant variant = ProductVariant.builder().id(1).sku("SKU1").isBaseUnit(true).product(product).build();

        InventoryStock zeroStock = InventoryStock.builder().quantity(0).build();
        InventoryStock stock2 = InventoryStock.builder().quantity(10).build();

        when(inventoryStockRepository.findByVariantId(1)).thenReturn(List.of(zeroStock, stock2));

        inventoryStockService.deductStock(variant, 7, 99L, "Sale");

        verify(inventoryStockRepository, times(1)).save(stockCaptor.capture());
        assertEquals(3, stockCaptor.getValue().getQuantity());
        verify(stockMovementRepository, times(1)).save(movementCaptor.capture());
        assertEquals(-7, movementCaptor.getValue().getQuantity());
    }

    @Test
    void deductStock_shouldBreakLoopWhenRemainingBecomesZero() {
        Product product = Product.builder().id(5).build();
        ProductVariant variant = ProductVariant.builder().id(1).sku("SKU1").isBaseUnit(true).product(product).build();

        InventoryStock stock1 = InventoryStock.builder().quantity(3).build();
        InventoryStock stock2 = InventoryStock.builder().quantity(5).build();
        InventoryStock stock3 = InventoryStock.builder().quantity(10).build();

        when(inventoryStockRepository.findByVariantId(1)).thenReturn(List.of(stock1, stock2, stock3));

        inventoryStockService.deductStock(variant, 8, 99L, "Sale");

        verify(inventoryStockRepository, times(2)).save(any(InventoryStock.class));
        verify(stockMovementRepository, times(2)).save(any(StockMovement.class));
        assertEquals(10, stock3.getQuantity());
    }

    // ────────────────────────────────────────────────────────────────────────
    // adjustStock
    // ────────────────────────────────────────────────────────────────────────

    @Test
    void adjustStock_shouldAdjustSuccessfully() {
        StockAdjustRequest request = new StockAdjustRequest();
        request.setVariantId(1);
        request.setBatchId(10);
        request.setLocationId(100);
        request.setAdjustQuantity(-5);
        request.setReason("Damaged");

        ProductVariant variant = ProductVariant.builder().id(1).isBaseUnit(true).build();
        when(productVariantRepository.findById(1)).thenReturn(Optional.of(variant));

        InventoryStock existingStock = InventoryStock.builder().quantity(20).build();
        when(inventoryStockRepository.findByVariantIdAndBatchIdAndLocationId(1, 10, 100))
                .thenReturn(Optional.of(existingStock));

        inventoryStockService.adjustStock(request);

        verify(inventoryStockRepository).save(stockCaptor.capture());
        assertEquals(15, stockCaptor.getValue().getQuantity());

        verify(stockMovementRepository).save(movementCaptor.capture());
        StockMovement savedMovement = movementCaptor.getValue();
        assertEquals(-5, savedMovement.getQuantity());
        assertEquals("OUT", savedMovement.getType()); // Vì quantity < 0
        assertEquals("MANUAL_ADJUSTMENT", savedMovement.getReferenceType());
        assertEquals("Damaged", savedMovement.getNotes());
    }

    @Test
    void adjustStock_shouldThrowException_whenNotBaseUnit() {
        StockAdjustRequest request = new StockAdjustRequest();
        request.setVariantId(1);
        
        ProductVariant variant = ProductVariant.builder().id(1).isBaseUnit(false).build();
        when(productVariantRepository.findById(1)).thenReturn(Optional.of(variant));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> inventoryStockService.adjustStock(request));
        assertEquals("Adjustment must be made on base unit variant", ex.getMessage());
    }
}
