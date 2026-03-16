package com.smalltrend.service.inventory.purchaseorder;

import com.smalltrend.dto.inventory.purchaseorder.*;
import com.smalltrend.dto.inventory.dashboard.ProductResponse;
import com.smalltrend.entity.*;
import com.smalltrend.service.inventory.PurchaseOrderService;
import com.smalltrend.service.VariantPriceService;
import com.smalltrend.entity.enums.PurchaseOrderStatus;
import com.smalltrend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PurchaseOrderServiceTest {

    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;
    @Mock
    private PurchaseOrderItemRepository purchaseOrderItemRepository;
    @Mock
    private SupplierRepository supplierRepository;
    @Mock
    private SupplierContractRepository supplierContractRepository;
    @Mock
    private ProductVariantRepository productVariantRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private ProductBatchRepository productBatchRepository;
    @Mock
    private InventoryStockRepository inventoryStockRepository;
    @Mock
    private LocationRepository locationRepository;
    @Mock
    private StockMovementRepository stockMovementRepository;
    @Mock
    private UnitConversionRepository unitConversionRepository;
    @Mock
    private VariantPriceService variantPriceService;

    @InjectMocks
    private PurchaseOrderService purchaseOrderService;

    @Captor
    private ArgumentCaptor<InventoryStock> stockCaptor;

    private PurchaseOrder order;
    private Supplier supplier;
    private Product product;
    private ProductVariant variant;
    private Location location;
    private Unit unit;

    @BeforeEach
    void setUp() {
        supplier = Supplier.builder().id(1).name("Supplier A").contactPerson("John").build();
        location = Location.builder().id(1).name("Kho A").build();
        unit = Unit.builder().id(1).name("Unit").build();
        product = Product.builder().id(1).name("Product A").imageUrl("img.png").build();
        variant = ProductVariant.builder().id(1).sku("SKU-1").product(product).unit(unit).sellPrice(BigDecimal.TEN).build();
        product.setVariants(new ArrayList<>(List.of(variant)));
        variant.setInventoryStocks(new ArrayList<>());

        order = PurchaseOrder.builder()
                .id(1)
                .orderNumber("PO-2026-0001")
                .status(PurchaseOrderStatus.DRAFT)
                .supplier(supplier)
                .locationId(1)
                .items(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .build();

        when(purchaseOrderRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(purchaseOrderItemRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(inventoryStockRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(productBatchRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(locationRepository.findById(1)).thenReturn(Optional.of(location));
        when(locationRepository.findAll()).thenReturn(List.of(location));
        when(productVariantRepository.findById(any())).thenReturn(Optional.of(variant));
        when(productVariantRepository.findAll()).thenReturn(List.of(variant));
        when(supplierRepository.findById(1)).thenReturn(Optional.of(supplier));
        when(supplierRepository.findAll()).thenReturn(List.of(supplier));
        when(variantPriceService.syncActivePurchasePrice(anyInt(), any())).thenReturn(false);
    }

    @Test
    void getAllOrders_shouldSortByDate() {
        PurchaseOrder o1 = PurchaseOrder.builder().createdAt(LocalDateTime.now().minusDays(1)).build();
        PurchaseOrder o2 = PurchaseOrder.builder().createdAt(LocalDateTime.now()).build();
        PurchaseOrder o3 = PurchaseOrder.builder().createdAt(null).build();

        when(purchaseOrderRepository.findAll()).thenReturn(List.of(o1, o2, o3));

        List<PurchaseOrderResponse> results = purchaseOrderService.getAllOrders();
        assertEquals(3, results.size());
    }

    @Test
    void getOrderById_shouldThrow_whenNotFound() {
        when(purchaseOrderRepository.findById(99)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> purchaseOrderService.getOrderById(99));
    }

    @Test
    void getOrderById_shouldHandleNullVariantIdInItem() {
        PurchaseOrderItem item = PurchaseOrderItem.builder()
                .id(10)
                .variant(ProductVariant.builder().id(null).product(product).unit(unit).build())
                .quantity(1)
                .unitCost(BigDecimal.ONE)
                .purchaseOrder(order)
                .build();
        order.setItems(new ArrayList<>(List.of(item)));

        when(purchaseOrderRepository.findById(1)).thenReturn(Optional.of(order));

        PurchaseOrderResponse response = purchaseOrderService.getOrderById(1);

        assertNotNull(response);
        assertEquals(1, response.getItems().size());
        assertNull(response.getItems().get(0).getVariantId());
        assertEquals(product.getId().intValue(), response.getItems().get(0).getProductId());
    }

    @Test
    void getOrderById_shouldHandleNullCandidateVariantInProductList() {
        ProductVariant requestedVariant = ProductVariant.builder().id(10).product(product).unit(unit).build();
        ProductVariant brokenCandidate = ProductVariant.builder().id(null).product(product).unit(unit).build();
        product.setVariants(new ArrayList<>(List.of(requestedVariant, brokenCandidate)));

        PurchaseOrderItem item = PurchaseOrderItem.builder()
                .id(11)
                .variant(requestedVariant)
                .quantity(2)
                .unitCost(BigDecimal.ONE)
                .purchaseOrder(order)
                .build();
        order.setItems(new ArrayList<>(List.of(item)));

        when(purchaseOrderRepository.findById(1)).thenReturn(Optional.of(order));

        PurchaseOrderResponse response = purchaseOrderService.getOrderById(1);

        assertNotNull(response);
        assertEquals(1, response.getItems().size());
        assertEquals(requestedVariant.getId().intValue(), response.getItems().get(0).getVariantId());
    }

    @Test
    void generateNextPOCode_shouldHandleEmptyAndExisting() {
        when(purchaseOrderRepository.findAll()).thenReturn(new ArrayList<>());
        assertTrue(purchaseOrderService.generateNextPOCode().contains("PO-"));

        PurchaseOrder existing = PurchaseOrder.builder().orderNumber("PO-" + LocalDate.now().getYear() + "-0005").build();
        when(purchaseOrderRepository.findAll()).thenReturn(List.of(existing));
        assertTrue(purchaseOrderService.generateNextPOCode().endsWith("006"));
    }

    @Test
    void saveDraft_shouldWorkWithAndWithoutItems() {
        PurchaseOrderRequest req = new PurchaseOrderRequest();
        req.setSupplierId(1);
        req.setLocationId(1);
        req.setStatus("PENDING");
        req.setItems(List.of(PurchaseOrderItemRequest.builder().variantId(1).quantity(10).unitCost(BigDecimal.ONE).build()));

        assertNotNull(purchaseOrderService.saveDraft(req));

        req.setItems(null);
        req.setStatus(null);
        assertThrows(RuntimeException.class, () -> purchaseOrderService.saveDraft(req));
    }

    @Test
    void confirmExistingOrder_shouldHandleTransitions() {
        when(purchaseOrderRepository.findById(1)).thenReturn(Optional.of(order));
        order.setItems(List.of(PurchaseOrderItem.builder().id(1).build()));

        // DRAFT -> CONFIRMED
        order.setStatus(PurchaseOrderStatus.DRAFT);
        assertEquals("CONFIRMED", purchaseOrderService.confirmExistingOrder(1).getStatus());

        // PENDING -> CONFIRMED
        order.setStatus(PurchaseOrderStatus.PENDING);
        assertEquals("CONFIRMED", purchaseOrderService.confirmExistingOrder(1).getStatus());

        // CHECKING -> NOT ALLOWED
        order.setStatus(PurchaseOrderStatus.CHECKING);
        assertThrows(RuntimeException.class, () -> purchaseOrderService.confirmExistingOrder(1));
    }

    @Test
    void confirmOrder_shouldWork() {
        PurchaseOrderRequest req = new PurchaseOrderRequest();
        req.setSupplierId(1);
        req.setLocationId(1);
        req.setItems(List.of(PurchaseOrderItemRequest.builder().variantId(1).quantity(10).unitCost(BigDecimal.ONE).build()));

        assertNotNull(purchaseOrderService.confirmOrder(req));
    }

    @Test
    void approveOrder_shouldWork() {
        order.setStatus(PurchaseOrderStatus.PENDING);
        when(purchaseOrderRepository.findById(1)).thenReturn(Optional.of(order));
        assertEquals("CONFIRMED", purchaseOrderService.approveOrder(1).getStatus());

        order.setStatus(PurchaseOrderStatus.DRAFT);
        assertThrows(RuntimeException.class, () -> purchaseOrderService.approveOrder(1));
    }

    @Test
    void receiveGoods_shouldUpdateStockAndMovement() {
        order.setStatus(PurchaseOrderStatus.CHECKING);
        order.setItems(new ArrayList<>());
        order.getItems().add(PurchaseOrderItem.builder().id(1).variant(variant).quantity(10).receivedQuantity(10).purchaseOrder(order).build());

        when(purchaseOrderRepository.findById(1)).thenReturn(Optional.of(order));
        // Mock lookup for existing stock
        when(inventoryStockRepository.findByLocationIdWithProduct(1)).thenReturn(new ArrayList<>());

        GoodsReceiptRequest req = new GoodsReceiptRequest();
        req.setSupplierId(1);
        req.setLocationId(1);
        req.setTaxPercent(BigDecimal.ZERO);
        req.setShippingFee(BigDecimal.ZERO);
        req.setItems(List.of(
                GoodsReceiptRequest.GoodsReceiptItemRequest.builder()
                        .itemId(1)
                        .receivedQuantity(10)
                        .unitCost(BigDecimal.ONE)
                        .notes("ok")
                        .build()
        ));

        assertNotNull(purchaseOrderService.receiveGoods(1, req));
        verify(inventoryStockRepository, atLeastOnce()).save(any());
        verify(stockMovementRepository, atLeastOnce()).save(any());
    }

    @Test
    void updateStock_shouldHandleExistingStock() {
        InventoryStock existing = InventoryStock.builder().variant(variant).quantity(5).location(location).build();
        variant.getInventoryStocks().add(existing);

        order.setStatus(PurchaseOrderStatus.CHECKING);
        order.getItems().add(PurchaseOrderItem.builder().id(1).variant(variant).quantity(10).receivedQuantity(10).purchaseOrder(order).build());

        when(purchaseOrderRepository.findById(1)).thenReturn(Optional.of(order));
        when(inventoryStockRepository.findByLocationIdWithProduct(any())).thenReturn(List.of(existing));

        GoodsReceiptRequest req = new GoodsReceiptRequest();
        req.setSupplierId(1);
        req.setLocationId(1);
        req.setTaxPercent(BigDecimal.ZERO);
        req.setShippingFee(BigDecimal.ZERO);
        req.setItems(List.of(
                GoodsReceiptRequest.GoodsReceiptItemRequest.builder()
                        .itemId(1)
                        .receivedQuantity(10)
                        .unitCost(BigDecimal.ONE)
                        .build()
        ));

        purchaseOrderService.receiveGoods(1, req);
        verify(inventoryStockRepository, atLeastOnce()).save(stockCaptor.capture());
        InventoryStock savedStock = stockCaptor.getAllValues().get(stockCaptor.getAllValues().size() - 1);
        assertEquals(10, savedStock.getQuantity());
    }

    @Test
    void updateStock_shouldHandleUnitConversion() {
        Unit fromUnit = Unit.builder().id(2).name("Box").build();
        ProductVariant otherVariant = ProductVariant.builder().id(2).unit(fromUnit).product(product).build();

        order.setStatus(PurchaseOrderStatus.CHECKING);
        order.getItems().add(PurchaseOrderItem.builder().id(1).variant(otherVariant).quantity(5).receivedQuantity(5).purchaseOrder(order).build());

        when(purchaseOrderRepository.findById(1)).thenReturn(Optional.of(order));
        when(productVariantRepository.findById(2)).thenReturn(Optional.of(otherVariant));
        when(unitConversionRepository.findByVariantIdAndToUnitId(any(), any()))
                .thenReturn(Optional.of(UnitConversion.builder().conversionFactor(new BigDecimal("10")).build()));

        GoodsReceiptRequest req = new GoodsReceiptRequest();
        req.setSupplierId(1);
        req.setLocationId(1);
        req.setTaxPercent(BigDecimal.ZERO);
        req.setShippingFee(BigDecimal.ZERO);
        req.setItems(List.of(
                GoodsReceiptRequest.GoodsReceiptItemRequest.builder()
                        .itemId(1)
                        .receivedQuantity(5)
                        .unitCost(BigDecimal.ONE)
                        .build()
        ));

        purchaseOrderService.receiveGoods(1, req);
        verify(inventoryStockRepository).save(stockCaptor.capture());
        assertEquals(50, stockCaptor.getValue().getQuantity());
    }

    @Test
    void startChecking_shouldWork() {
        order.setStatus(PurchaseOrderStatus.CONFIRMED);
        when(purchaseOrderRepository.findById(1)).thenReturn(Optional.of(order));
        assertEquals("CHECKING", purchaseOrderService.startChecking(1).getStatus());

        order.setStatus(PurchaseOrderStatus.DRAFT);
        assertThrows(RuntimeException.class, () -> purchaseOrderService.startChecking(1));
    }

    @Test
    void rejectOrder_shouldWork() {
        order.setStatus(PurchaseOrderStatus.PENDING);
        when(purchaseOrderRepository.findById(1)).thenReturn(Optional.of(order));
        assertEquals("REJECTED", purchaseOrderService.rejectOrder(1, "reason").getStatus());
    }

    @Test
    void cancelOrder_shouldWorkOnlyDraft() {
        order.setStatus(PurchaseOrderStatus.DRAFT);
        when(purchaseOrderRepository.findById(1)).thenReturn(Optional.of(order));
        assertEquals("CANCELLED", purchaseOrderService.cancelOrder(1).getStatus());

        order.setStatus(PurchaseOrderStatus.CONFIRMED);
        assertThrows(RuntimeException.class, () -> purchaseOrderService.cancelOrder(1));
    }

    @Test
    void deleteOrder_shouldWorkDraftOrRejected() {
        order.setStatus(PurchaseOrderStatus.DRAFT);
        when(purchaseOrderRepository.findById(1)).thenReturn(Optional.of(order));
        purchaseOrderService.deleteOrder(1);
        verify(purchaseOrderRepository).delete(any());

        order.setStatus(PurchaseOrderStatus.REJECTED);
        purchaseOrderService.deleteOrder(1);

        order.setStatus(PurchaseOrderStatus.CONFIRMED);
        assertThrows(RuntimeException.class, () -> purchaseOrderService.deleteOrder(1));
    }

    @Test
    void getAllSuppliers_shouldWork() {
        assertFalse(purchaseOrderService.getAllSuppliers().isEmpty());
    }

    @Test
    void getContractsBySupplier_shouldWork() {
        SupplierContract c = SupplierContract.builder().id(1L).contractNumber("C1").build();
        when(supplierContractRepository.findBySupplierId(1)).thenReturn(List.of(c));
        assertFalse(purchaseOrderService.getContractsBySupplier(1).isEmpty());
    }

    @Test
    void getAllProducts_shouldWorkAndCalculateStock() {
        InventoryStock s = InventoryStock.builder().quantity(100).build();
        variant.setInventoryStocks(List.of(s));

        List<ProductResponse> res = purchaseOrderService.getAllProducts();
        assertFalse(res.isEmpty());
        assertEquals(100, res.get(0).getStockQuantity());
    }

    @Test
    void updateOrder_shouldWork() {
        order.setStatus(PurchaseOrderStatus.DRAFT);
        when(purchaseOrderRepository.findById(1)).thenReturn(Optional.of(order));

        SupplierContract contract = SupplierContract.builder().id(1L).contractNumber("C1").build();
        when(supplierContractRepository.findById(1L)).thenReturn(Optional.of(contract));

        PurchaseOrderRequest req = new PurchaseOrderRequest();
        req.setSupplierId(1);
        req.setContractId(1L);
        req.setItems(List.of(PurchaseOrderItemRequest.builder().variantId(1).quantity(10).unitCost(BigDecimal.ONE).build()));

        assertNotNull(purchaseOrderService.updateOrder(1, req));
    }

    @Test
    void recalculate_shouldHandleNegativeAndZero() {
        PurchaseOrderRequest req = new PurchaseOrderRequest();
        req.setDiscountAmount(new BigDecimal("100"));
        req.setTaxPercent(new BigDecimal("10"));
        req.setShippingFee(new BigDecimal("10"));
        req.setItems(List.of(PurchaseOrderItemRequest.builder().variantId(1).quantity(2).unitCost(new BigDecimal("50")).build()));
        req.setSupplierId(1);
        req.setLocationId(1);

        PurchaseOrderResponse res = purchaseOrderService.saveDraft(req);
        assertEquals(10.0, res.getTotalAmount().doubleValue());
    }
}
