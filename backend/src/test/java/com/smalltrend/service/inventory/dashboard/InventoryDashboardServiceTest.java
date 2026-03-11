package com.smalltrend.service.inventory.dashboard;

import com.smalltrend.dto.inventory.dashboard.*;
import com.smalltrend.entity.*;
import com.smalltrend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import com.smalltrend.entity.enums.PurchaseOrderStatus;

@ExtendWith(MockitoExtension.class)
class InventoryDashboardServiceTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private ProductVariantRepository productVariantRepository;
    @Mock
    private ProductBatchRepository productBatchRepository;
    @Mock
    private InventoryStockRepository inventoryStockRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private BrandRepository brandRepository;
    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;

    @InjectMocks
    private InventoryDashboardService inventoryDashboardService;

    private Product product;
    private ProductVariant variant;
    private ProductBatch batch;
    private InventoryStock stock;

    @BeforeEach
    void setUp() {
        Category category = Category.builder().id(1).name("Category 1").build();
        Brand brand = Brand.builder().id(1).name("Brand 1").build();

        batch = ProductBatch.builder()
                .id(1)
                .batchNumber("BATCH-1")
                .costPrice(new BigDecimal("10.0"))
                .expiryDate(LocalDate.now().plusDays(10))
                .mfgDate(LocalDate.now().minusDays(10))
                .build();

        variant = ProductVariant.builder()
                .id(1)
                .sku("SKU-1")
                .sellPrice(new BigDecimal("20.0"))
                .productBatches(List.of(batch))
                .build();
        
        batch.setVariant(variant);

        product = Product.builder()
                .id(1)
                .name("Product 1")
                .category(category)
                .brand(brand)
                .variants(List.of(variant))
                .build();
        
        variant.setProduct(product);

        Location location = Location.builder().id(1).name("Location 1").build();

        stock = InventoryStock.builder()
                .id(1)
                .variant(variant)
                .batch(batch)
                .location(location)
                .quantity(100)
                .build();
    }

    @Test
    void getAllProductsForDashboard_shouldReturnProductsWithStock() {
        when(productRepository.findAll()).thenReturn(List.of(product));
        when(inventoryStockRepository.findAll()).thenReturn(List.of(stock));

        List<DashboardProductResponse> responses = inventoryDashboardService.getAllProductsForDashboard();

        assertEquals(1, responses.size());
        DashboardProductResponse response = responses.get(0);
        assertEquals(1, response.getId());
        assertEquals("SKU-1", response.getSku());
        assertEquals(100, response.getStockQuantity());
        assertEquals(new BigDecimal("10.0"), response.getPurchasePrice());
        assertEquals(new BigDecimal("20.0"), response.getRetailPrice());
    }

    @Test
    void getAllCategories_shouldReturnCategories() {
        Category category = Category.builder().id(1).name("Cat 1").build();
        when(categoryRepository.findAll()).thenReturn(List.of(category));

        List<CategoryResponse> responses = inventoryDashboardService.getAllCategories();

        assertEquals(1, responses.size());
        assertEquals(1, responses.get(0).getId());
        assertEquals("Cat 1", responses.get(0).getName());
    }

    @Test
    void getAllBrands_shouldReturnBrands() {
        Brand brand = Brand.builder().id(1).name("Brand 1").build();
        when(brandRepository.findAll()).thenReturn(List.of(brand));

        List<BrandResponse> responses = inventoryDashboardService.getAllBrands();

        assertEquals(1, responses.size());
        assertEquals(1, responses.get(0).getId());
        assertEquals("Brand 1", responses.get(0).getName());
    }

    @Test
    void getDashboardSummary_shouldReturnSummary() {
        when(productRepository.findAll()).thenReturn(List.of(product));
        when(inventoryStockRepository.findAll()).thenReturn(List.of(stock));
        when(productBatchRepository.findExpiredBatches(any())).thenReturn(List.of());
        when(productBatchRepository.findExpiringSoonBatches(any(), any())).thenReturn(List.of(batch));

        DashboardSummaryResponse response = inventoryDashboardService.getDashboardSummary();

        assertEquals(1, response.getTotalProducts());
        assertEquals(new BigDecimal("1000.0"), response.getTotalInventoryValue()); // 100 * 10.0
        assertEquals(0, response.getLowStockCount()); // qty=100 > 50
        assertEquals(0, response.getExpiredBatchCount());
        assertEquals(1, response.getExpiringSoonCount());
        assertEquals(0, response.getNeedActionCount()); // lowStock + expired
    }

    @Test
    void getBatchStatuses_shouldReturnBatchStatuses() {
        when(productBatchRepository.findAllWithDetails()).thenReturn(List.of(batch));
        when(inventoryStockRepository.findAll()).thenReturn(List.of(stock));

        List<BatchStatusResponse> responses = inventoryDashboardService.getBatchStatuses();

        assertEquals(1, responses.size());
        BatchStatusResponse response = responses.get(0);
        assertEquals("BATCH-1", response.getBatchCode());
        assertEquals(100, response.getQuantity());
        assertEquals("EXPIRING_SOON", response.getStatus());
        assertEquals("Location 1", response.getLocationName());
        assertEquals(new BigDecimal("1000.0"), response.getValue());
    }

    @Test
    void getProductBatches_shouldReturnProductBatches() {
        when(productBatchRepository.findAllWithDetails()).thenReturn(List.of(batch));
        when(inventoryStockRepository.findAll()).thenReturn(List.of(stock));

        List<ProductBatchResponse> responses = inventoryDashboardService.getProductBatches();

        assertEquals(1, responses.size());
        ProductBatchResponse response = responses.get(0);
        assertEquals(1, response.getId());
        assertEquals("BATCH-1", response.getBatchCode());
        assertEquals(1, response.getProductId());
        assertEquals("Product 1", response.getProductName());
        assertEquals(100, response.getQuantity());
    }

    @Test
    void getRecentActivities_shouldReturnActivities() {
        PurchaseOrderItem item = PurchaseOrderItem.builder().quantity(50).build();
        PurchaseOrder order = PurchaseOrder.builder()
                .id(1)
                .orderNumber("PO-1")
                .status(PurchaseOrderStatus.RECEIVED)
                .items(List.of(item))
                .createdAt(LocalDateTime.now())
                .build();

        when(purchaseOrderRepository.findAll()).thenReturn(List.of(order));

        List<RecentActivityResponse> responses = inventoryDashboardService.getRecentActivities();

        assertEquals(1, responses.size());
        RecentActivityResponse response = responses.get(0);
        assertEquals("IN", response.getType());
        assertEquals("PO PO-1", response.getProductName());
        assertEquals(50, response.getQuantity());
        assertEquals("PO-1", response.getReferenceCode());
    }
}
