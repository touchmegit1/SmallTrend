package com.smalltrend.service.inventory.disposal;

import com.smalltrend.dto.inventory.disposal.*;
import com.smalltrend.entity.*;
import com.smalltrend.service.inventory.DisposalVoucherService;
import com.smalltrend.service.inventory.InventoryOutOfStockNotificationService;
import com.smalltrend.entity.enums.DisposalReason;
import com.smalltrend.entity.enums.DisposalStatus;
import com.smalltrend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class DisposalVoucherServiceTest {

    @Mock
    private DisposalVoucherRepository disposalVoucherRepository;
    @Mock
    private ProductBatchRepository productBatchRepository;
    @Mock
    private InventoryStockRepository inventoryStockRepository;
    @Mock
    private LocationRepository locationRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private InventoryOutOfStockNotificationService outOfStockNotificationService;

    @InjectMocks
    private DisposalVoucherService disposalVoucherService;

    private DisposalVoucher voucher;
    private User user;
    private Location location;
    private ProductBatch batch;
    private Product product;
    private ProductVariant variant;
    private DisposalVoucherItem item;
    private InventoryStock stock;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1).fullName("Test User").build();
        lenient().when(inventoryStockRepository.save(any(InventoryStock.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        location = Location.builder().id(1).name("Kho A").build();

        product = Product.builder().id(1).name("Product A").build();
        variant = ProductVariant.builder().id(1).sku("SKU-1").product(product).build();

        batch = ProductBatch.builder()
                .id(1)
                .batchNumber("BATCH-1")
                .variant(variant)
                .costPrice(new BigDecimal("10.0"))
                .expiryDate(LocalDate.now().minusDays(5))
                .build();

        item = DisposalVoucherItem.builder()
                .id(1L)
                .batch(batch)
                .product(product)
                .batchCode("BATCH-1")
                .quantity(10)
                .unitCost(new BigDecimal("10.0"))
                .totalCost(new BigDecimal("100.0"))
                .expiryDate(LocalDate.now().minusDays(5))
                .build();

        voucher = DisposalVoucher.builder()
                .id(1L)
                .code("DV20260311001")
                .location(location)
                .status(DisposalStatus.PENDING)
                .reasonType(DisposalReason.EXPIRED)
                .notes("Test notes")
                .totalItems(1)
                .totalQuantity(10)
                .totalValue(new BigDecimal("100.0"))
                .createdBy(user)
                .createdAt(LocalDateTime.now())
                .build();

        voucher.addItem(item);

        stock = InventoryStock.builder()
                .id(1)
                .batch(batch)
                .location(location)
                .quantity(50)
                .build();
    }

    @Test
    void getAllDisposalVouchers_shouldReturnList() {
        when(disposalVoucherRepository.findAll()).thenReturn(List.of(voucher));

        List<DisposalVoucherResponse> responses = disposalVoucherService.getAllDisposalVouchers();

        assertEquals(1, responses.size());
        assertEquals("DV20260311001", responses.get(0).getCode());
        assertEquals(10, responses.get(0).getTotalQuantity());
    }

    @Test
    void getDisposalVoucherById_shouldReturnVoucher() {
        when(disposalVoucherRepository.findById(1L)).thenReturn(Optional.of(voucher));

        DisposalVoucherResponse response = disposalVoucherService.getDisposalVoucherById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("DV20260311001", response.getCode());
    }

    @Test
    void getDisposalVoucherById_shouldThrowException_whenNotFound() {
        when(disposalVoucherRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> disposalVoucherService.getDisposalVoucherById(1L));
    }

    @Test
    void generateNextCode_shouldReturnFormattedCode() {
        when(disposalVoucherRepository.findMaxSequenceForDate(anyString())).thenReturn(5);

        String code = disposalVoucherService.generateNextCode();

        String expectedPrefix = "DV" + LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        assertEquals(expectedPrefix + "006", code);
    }

    @Test
    void getExpiredBatches_shouldReturnExpiredBatchesForLocation() {
        batch.setInventoryStocks(List.of(stock));
        when(productBatchRepository.findExpiredBatchesWithStockByLocation(any(LocalDate.class), eq(1)))
                .thenReturn(List.of(batch));

        List<ExpiredBatchResponse> responses = disposalVoucherService.getExpiredBatches(1L);

        assertEquals(1, responses.size());
        assertEquals("BATCH-1", responses.get(0).getBatchCode());
        assertEquals(50, responses.get(0).getAvailableQuantity());
    }

    @Test
    void getExpiredBatches_shouldNotReturn_whenStockLocationDoesNotMatch() {
        when(productBatchRepository.findExpiredBatchesWithStockByLocation(any(LocalDate.class), eq(1)))
                .thenReturn(List.of());

        List<ExpiredBatchResponse> responses = disposalVoucherService.getExpiredBatches(1L);

        assertEquals(0, responses.size());
    }

    @Test
    void saveDraft_shouldSaveAndReturnDraftVoucher() {
        DisposalVoucherItemRequest itemRequest = new DisposalVoucherItemRequest();
        itemRequest.setBatchId(1L);
        itemRequest.setQuantity(5);

        DisposalVoucherRequest request = new DisposalVoucherRequest();
        request.setLocationId(1L);
        request.setReasonType("EXPIRED");
        request.setNotes("Create notes");
        request.setItems(List.of(itemRequest));

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(locationRepository.findById(1)).thenReturn(Optional.of(location));
        when(productBatchRepository.findById(1)).thenReturn(Optional.of(batch));
        when(inventoryStockRepository.findByBatchAndLocation(batch, location)).thenReturn(Optional.of(stock));
        when(disposalVoucherRepository.findMaxSequenceForDate(anyString())).thenReturn(0);

        when(disposalVoucherRepository.save(any(DisposalVoucher.class))).thenAnswer(i -> {
            DisposalVoucher v = i.getArgument(0);
            v.setId(2L);
            return v;
        });

        DisposalVoucherResponse response = disposalVoucherService.saveDraft(request, 1L);

        assertNotNull(response);
        assertEquals("DRAFT", response.getStatus());
        assertEquals(1, response.getLocationId());
        assertEquals(5, response.getTotalQuantity());
        assertEquals(new BigDecimal("50.0"), response.getTotalValue());
        verify(disposalVoucherRepository).save(any(DisposalVoucher.class));
    }

    @Test
    void approveVoucher_shouldDeductStockAndChangeStatus() {
        when(disposalVoucherRepository.findById(1L)).thenReturn(Optional.of(voucher));
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(inventoryStockRepository.findByBatchAndLocationForUpdate(batch, location)).thenReturn(Optional.of(stock));
        when(disposalVoucherRepository.save(any(DisposalVoucher.class))).thenReturn(voucher);

        DisposalVoucherResponse response = disposalVoucherService.approveVoucher(1L, 1L);

        assertEquals("CONFIRMED", response.getStatus());
        assertEquals(40, stock.getQuantity()); // 50 - 10
        verify(inventoryStockRepository).save(stock);
        verify(disposalVoucherRepository).save(voucher);
    }

    @Test
    void approveVoucher_shouldThrowException_whenNotPending() {
        voucher.setStatus(DisposalStatus.CONFIRMED);
        when(disposalVoucherRepository.findById(1L)).thenReturn(Optional.of(voucher));

        assertThrows(RuntimeException.class, () -> disposalVoucherService.approveVoucher(1L, 1L));
    }

    @Test
    void approveVoucher_shouldThrowException_whenInsufficientStock() {
        stock.setQuantity(5); // Less than item qty 10
        when(disposalVoucherRepository.findById(1L)).thenReturn(Optional.of(voucher));
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(inventoryStockRepository.findByBatchAndLocation(batch, location)).thenReturn(Optional.of(stock));

        assertThrows(RuntimeException.class, () -> disposalVoucherService.approveVoucher(1L, 1L));
    }

    @Test
    void rejectVoucher_shouldChangeStatusToRejected() {
        when(disposalVoucherRepository.findById(1L)).thenReturn(Optional.of(voucher));
        when(disposalVoucherRepository.save(any(DisposalVoucher.class))).thenReturn(voucher);

        DisposalVoucherResponse response = disposalVoucherService.rejectVoucher(1L, "Not needed");

        assertEquals("REJECTED", response.getStatus());
        assertEquals("Not needed", voucher.getRejectionReason());
        verify(disposalVoucherRepository).save(voucher);
    }

    @Test
    void saveDraft_shouldThrowWhenReasonTypeNotExpired() {
        DisposalVoucherRequest request = new DisposalVoucherRequest();
        request.setLocationId(1L);
        request.setReasonType("DAMAGED");
        request.setItems(List.of(new DisposalVoucherItemRequest()));

        assertThrows(RuntimeException.class, () -> disposalVoucherService.saveDraft(request, 1L));
    }

    @Test
    void saveDraft_shouldThrowWhenDuplicateBatch() {
        DisposalVoucherItemRequest i1 = new DisposalVoucherItemRequest();
        i1.setBatchId(1L);
        i1.setQuantity(1);
        DisposalVoucherItemRequest i2 = new DisposalVoucherItemRequest();
        i2.setBatchId(1L);
        i2.setQuantity(2);

        DisposalVoucherRequest request = new DisposalVoucherRequest();
        request.setLocationId(1L);
        request.setReasonType("EXPIRED");
        request.setItems(List.of(i1, i2));

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(locationRepository.findById(1)).thenReturn(Optional.of(location));
        when(productBatchRepository.findById(1)).thenReturn(Optional.of(batch));
        when(inventoryStockRepository.findByBatchAndLocation(batch, location)).thenReturn(Optional.of(stock));

        assertThrows(RuntimeException.class, () -> disposalVoucherService.saveDraft(request, 1L));
    }

    @Test
    void saveDraft_shouldThrowWhenBatchIdMissing() {
        DisposalVoucherItemRequest itemRequest = new DisposalVoucherItemRequest();
        itemRequest.setQuantity(1);

        DisposalVoucherRequest request = new DisposalVoucherRequest();
        request.setLocationId(1L);
        request.setReasonType("EXPIRED");
        request.setItems(List.of(itemRequest));

        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(locationRepository.findById(1)).thenReturn(Optional.of(location));

        assertThrows(RuntimeException.class, () -> disposalVoucherService.saveDraft(request, 1L));
    }

    @Test
    void submitForApproval_shouldAcceptRejectedVoucher() {
        voucher.setStatus(DisposalStatus.REJECTED);
        when(disposalVoucherRepository.findById(1L)).thenReturn(Optional.of(voucher));
        when(disposalVoucherRepository.save(any(DisposalVoucher.class))).thenReturn(voucher);

        DisposalVoucherResponse response = disposalVoucherService.submitForApproval(1L);

        assertEquals("PENDING", response.getStatus());
        assertNull(voucher.getRejectionReason());
    }

    @Test
    void submitForApproval_shouldThrowWhenNoItems() {
        voucher.setStatus(DisposalStatus.DRAFT);
        voucher.getItems().clear();
        when(disposalVoucherRepository.findById(1L)).thenReturn(Optional.of(voucher));

        assertThrows(RuntimeException.class, () -> disposalVoucherService.submitForApproval(1L));
    }

    @Test
    void rejectVoucher_shouldThrowWhenNotPending() {
        voucher.setStatus(DisposalStatus.DRAFT);
        when(disposalVoucherRepository.findById(1L)).thenReturn(Optional.of(voucher));

        assertThrows(RuntimeException.class, () -> disposalVoucherService.rejectVoucher(1L, "x"));
    }

    @Test
    void approveVoucher_shouldThrowWhenStockNotFoundForUpdate() {
        when(disposalVoucherRepository.findById(1L)).thenReturn(Optional.of(voucher));
        when(userRepository.findById(1)).thenReturn(Optional.of(user));
        when(inventoryStockRepository.findByBatchAndLocationForUpdate(batch, location)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> disposalVoucherService.approveVoucher(1L, 1L));
    }
}
