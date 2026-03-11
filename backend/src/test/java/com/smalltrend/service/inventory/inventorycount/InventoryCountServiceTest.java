package com.smalltrend.service.inventory.inventorycount;

import com.smalltrend.dto.inventory.inventorycount.*;
import com.smalltrend.entity.*;
import com.smalltrend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryCountServiceTest {

    @Mock
    private InventoryCountRepository countRepository;
    @Mock
    private InventoryCountItemRepository itemRepository;
    @Mock
    private LocationRepository locationRepository;
    @Mock
    private InventoryStockRepository inventoryStockRepository;
    @Mock
    private StockMovementRepository stockMovementRepository;
    @Mock
    private ProductVariantRepository productVariantRepository;
    @Mock
    private ProductBatchRepository productBatchRepository;

    @InjectMocks
    private InventoryCountService inventoryCountService;

    @Captor
    private ArgumentCaptor<InventoryCount> countCaptor;
    @Captor
    private ArgumentCaptor<InventoryCountItem> itemCaptor;
    @Captor
    private ArgumentCaptor<InventoryStock> stockCaptor;
    @Captor
    private ArgumentCaptor<StockMovement> movementCaptor;

    private InventoryCount draftCount;
    private InventoryCount pendingCount;
    private InventoryCount confirmedCount;
    private Location location;
    private InventoryCountItemRequest itemRequest;
    private ProductVariant variant;
    private InventoryStock stock;

    @BeforeEach
    void setUp() {
        location = Location.builder().id(1).name("Kho A").build();

        draftCount = InventoryCount.builder()
                .id(1)
                .code("IC-2026-0001")
                .status("DRAFT")
                .location(location)
                .notes("Test draft")
                .totalDifferenceValue(BigDecimal.ZERO)
                .build();

        pendingCount = InventoryCount.builder()
                .id(2)
                .code("IC-2026-0002")
                .status("PENDING")
                .location(location)
                .build();

        confirmedCount = InventoryCount.builder()
                .id(3)
                .code("IC-2026-0003")
                .status("CONFIRMED")
                .location(location)
                .build();

        itemRequest = new InventoryCountItemRequest();
        itemRequest.setProductId(1);
        itemRequest.setSystemQuantity(10);
        itemRequest.setActualQuantity(12);
        itemRequest.setDifferenceQuantity(2);
        itemRequest.setDifferenceValue(new BigDecimal("20.0"));

        variant = ProductVariant.builder().id(1).build();
        stock = InventoryStock.builder().id(1).quantity(10).variant(variant).batch(ProductBatch.builder().id(1).build()).build();
    }

    @Test
    void getAllCounts_shouldReturnCounts() {
        when(countRepository.findAll()).thenReturn(List.of(draftCount, pendingCount));

        List<InventoryCountResponse> responses = inventoryCountService.getAllCounts();

        assertEquals(2, responses.size());
        assertEquals("IC-2026-0001", responses.get(0).getCode());
    }

    @Test
    void getCountById_shouldReturnCount() {
        when(countRepository.findById(1)).thenReturn(Optional.of(draftCount));
        
        InventoryCountItem it = InventoryCountItem.builder().id(1).productId(1).actualQuantity(10).build();
        when(itemRepository.findByInventoryCountId(1)).thenReturn(List.of(it));

        InventoryCountResponse response = inventoryCountService.getCountById(1);

        assertNotNull(response);
        assertEquals(1, response.getId());
        assertEquals(1, response.getItems().size());
    }

    @Test
    void generateCode_shouldGenerateCorrectFormat() {
        String prefix = "IC-" + Year.now().getValue() + "-";
        
        InventoryCount c1 = InventoryCount.builder().code(prefix + "0005").build();
        InventoryCount c2 = InventoryCount.builder().code("INVALID").build();
        when(countRepository.findAll()).thenReturn(List.of(c1, c2));

        String nextCode = inventoryCountService.generateCode();

        assertEquals(prefix + "0006", nextCode);
    }

    @Test
    void saveDraft_shouldAssignLocationAndSave() {
        InventoryCountRequest req = new InventoryCountRequest();
        req.setLocationId(1);
        req.setNotes("Draft note");
        req.setItems(List.of(itemRequest));

        when(locationRepository.findById(1)).thenReturn(Optional.of(location));
        when(countRepository.findAll()).thenReturn(List.of()); // Generate code
        when(countRepository.save(any())).thenAnswer(i -> {
            InventoryCount count = i.getArgument(0);
            count.setId(1);
            return count;
        });

        InventoryCountResponse res = inventoryCountService.saveDraft(req);

        assertEquals("DRAFT", res.getStatus());
        verify(countRepository).save(countCaptor.capture());
        assertEquals("Draft note", countCaptor.getValue().getNotes());
        assertEquals(new BigDecimal("20.0"), countCaptor.getValue().getTotalDifferenceValue());
        
        verify(itemRepository, times(1)).save(any(InventoryCountItem.class));
    }

    @Test
    void updateCount_shouldUpdateDraft() {
        InventoryCountRequest req = new InventoryCountRequest();
        req.setLocationId(1);
        req.setNotes("Updated note");
        req.setItems(List.of(itemRequest));

        when(countRepository.findById(1)).thenReturn(Optional.of(draftCount));
        when(locationRepository.findById(1)).thenReturn(Optional.of(location));
        when(countRepository.save(any())).thenReturn(draftCount);

        InventoryCountResponse res = inventoryCountService.updateCount(1, req);

        assertEquals("Updated note", draftCount.getNotes());
        verify(itemRepository).deleteByInventoryCountId(1);
        verify(countRepository).save(draftCount);
        verify(itemRepository, times(1)).save(any(InventoryCountItem.class));
    }

    @Test
    void updateCount_shouldThrowExceptionForConfirmed() {
        when(countRepository.findById(3)).thenReturn(Optional.of(confirmedCount));
        InventoryCountRequest req = new InventoryCountRequest();
        assertThrows(RuntimeException.class, () -> inventoryCountService.updateCount(3, req));
    }

    @Test
    void confirmCount_shouldAdjustStock() {
        InventoryCountRequest req = new InventoryCountRequest();
        req.setLocationId(1);
        req.setItems(List.of(itemRequest));

        when(countRepository.findById(1)).thenReturn(Optional.of(draftCount));
        when(locationRepository.findById(1)).thenReturn(Optional.of(location));
        when(countRepository.save(any())).thenReturn(draftCount);
        
        InventoryCountItem it = InventoryCountItem.builder().id(1).inventoryCount(draftCount).productId(1).differenceQuantity(2).build();
        when(itemRepository.findByInventoryCountId(1)).thenReturn(List.of(it));
        when(productVariantRepository.findByProductId(1)).thenReturn(List.of(variant));
        when(inventoryStockRepository.findByLocationIdWithProduct(1)).thenReturn(List.of(stock));

        InventoryCountResponse res = inventoryCountService.confirmCount(1, req);

        assertEquals("CONFIRMED", draftCount.getStatus());
        
        // Stock logic checks
        verify(inventoryStockRepository).save(stockCaptor.capture());
        assertEquals(12, stockCaptor.getValue().getQuantity()); // 10 original + 2 difference
        
        verify(stockMovementRepository).save(movementCaptor.capture());
        assertEquals(2, movementCaptor.getValue().getQuantity());
        assertEquals("ADJUSTMENT", movementCaptor.getValue().getType());
    }

    @Test
    void submitForApproval_shouldMarkAsPending() {
        InventoryCountRequest req = new InventoryCountRequest();
        req.setLocationId(1);
        req.setItems(List.of(itemRequest));

        when(countRepository.findById(1)).thenReturn(Optional.of(draftCount));
        when(locationRepository.findById(1)).thenReturn(Optional.of(location));
        when(countRepository.save(any())).thenReturn(draftCount);

        InventoryCountResponse res = inventoryCountService.submitForApproval(1, req);

        assertEquals("PENDING", draftCount.getStatus());
    }

    @Test
    void approveCount_shouldConfirmAndAdjustStock() {
        when(countRepository.findById(2)).thenReturn(Optional.of(pendingCount));
        when(countRepository.save(any())).thenReturn(pendingCount);

        InventoryCountResponse res = inventoryCountService.approveCount(2);

        assertEquals("CONFIRMED", pendingCount.getStatus());
        verify(inventoryStockRepository, never()).save(any()); // No items for this pendingCount test, adjust loop exits
    }

    @Test
    void rejectCount_shouldReject() {
        when(countRepository.findById(2)).thenReturn(Optional.of(pendingCount));
        when(countRepository.save(any())).thenReturn(pendingCount);

        InventoryCountResponse res = inventoryCountService.rejectCount(2, "Incorrect count");

        assertEquals("REJECTED", pendingCount.getStatus());
        assertEquals("Incorrect count", pendingCount.getRejectionReason());
    }

    @Test
    void cancelCount_shouldCancelDraft() {
        when(countRepository.findById(1)).thenReturn(Optional.of(draftCount));
        when(countRepository.save(any())).thenReturn(draftCount);

        InventoryCountResponse res = inventoryCountService.cancelCount(1);

        assertEquals("CANCELLED", draftCount.getStatus());
    }
    
    @Test
    void deleteCount_shouldDeleteDraft() {
        when(countRepository.findById(1)).thenReturn(Optional.of(draftCount));

        inventoryCountService.deleteCount(1);
        
        verify(itemRepository).deleteByInventoryCountId(1);
        verify(countRepository).delete(draftCount);
    }
}
