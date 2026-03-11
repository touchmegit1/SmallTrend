package com.smalltrend.service.inventory.location;

import com.smalltrend.dto.inventory.location.FullLocationResponse;
import com.smalltrend.dto.inventory.location.LocationRequest;
import com.smalltrend.dto.inventory.location.LocationStockItemResponse;
import com.smalltrend.entity.*;
import com.smalltrend.repository.InventoryStockRepository;
import com.smalltrend.repository.LocationRepository;
import com.smalltrend.repository.StockMovementRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LocationServiceTest {

    @Mock
    private LocationRepository locationRepository;
    @Mock
    private InventoryStockRepository inventoryStockRepository;
    @Mock
    private StockMovementRepository stockMovementRepository;

    @InjectMocks
    private LocationService locationService;

    @Captor
    private ArgumentCaptor<Location> locationCaptor;
    @Captor
    private ArgumentCaptor<InventoryStock> stockCaptor;
    @Captor
    private ArgumentCaptor<StockMovement> movementCaptor;

    private Location activeLocation;
    private Location inactiveLocation;
    private InventoryStock stock;
    private ProductVariant variant;
    private ProductBatch batch;

    @BeforeEach
    void setUp() {
        activeLocation = Location.builder()
                .id(1)
                .name("Kho A")
                .locationCode("LOC-A")
                .status("ACTIVE")
                .build();

        inactiveLocation = Location.builder()
                .id(2)
                .name("Kho B")
                .locationCode("LOC-B")
                .status("INACTIVE")
                .build();

        Product product = Product.builder().id(1).name("Product A").build();
        Unit unit = Unit.builder().id(1).name("Hộp").build();
        variant = ProductVariant.builder().id(1).sku("SKU-1").product(product).unit(unit).build();
        batch = ProductBatch.builder().id(1).batchNumber("BATCH-1").build();

        stock = InventoryStock.builder()
                .id(1)
                .variant(variant)
                .batch(batch)
                .location(activeLocation)
                .quantity(50)
                .build();
    }

    @Test
    void getAllLocations_shouldReturnAllLocations() {
        when(locationRepository.findAll()).thenReturn(List.of(activeLocation, inactiveLocation));
        when(inventoryStockRepository.findByLocationIdWithProduct(1)).thenReturn(List.of(stock));
        when(inventoryStockRepository.findByLocationIdWithProduct(2)).thenReturn(List.of());

        List<FullLocationResponse> responses = locationService.getAllLocations();

        assertEquals(2, responses.size());
        assertEquals(" Kho A", " " + responses.get(0).getLocationName());
        assertEquals(50, responses.get(0).getTotalProducts());
        assertEquals(0, responses.get(1).getTotalProducts());
    }

    @Test
    void getActiveLocations_shouldReturnOnlyActive() {
        when(locationRepository.findAll()).thenReturn(List.of(activeLocation, inactiveLocation));
        when(inventoryStockRepository.findByLocationIdWithProduct(1)).thenReturn(List.of(stock));

        List<FullLocationResponse> responses = locationService.getActiveLocations();

        assertEquals(1, responses.size());
        assertEquals(1, responses.get(0).getId());
    }

    @Test
    void getLocationById_shouldReturnLocation() {
        when(locationRepository.findById(1)).thenReturn(Optional.of(activeLocation));
        when(inventoryStockRepository.findByLocationIdWithProduct(1)).thenReturn(List.of(stock));

        FullLocationResponse response = locationService.getLocationById(1);

        assertNotNull(response);
        assertEquals(1, response.getId());
        assertEquals(50, response.getTotalProducts());
        assertEquals(1, response.getStockItems().size());
    }

    @Test
    void getLocationById_shouldThrowException_whenNotFound() {
        when(locationRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> locationService.getLocationById(99));
    }

    @Test
    void getLocationStockItems_shouldReturnStockItems() {
        when(locationRepository.existsById(1)).thenReturn(true);
        when(inventoryStockRepository.findByLocationIdWithProduct(1)).thenReturn(List.of(stock));

        List<LocationStockItemResponse> responses = locationService.getLocationStockItems(1);

        assertEquals(1, responses.size());
        assertEquals(1, responses.get(0).getVariantId());
        assertEquals(50, responses.get(0).getQuantity());
    }

    @Test
    void createLocation_shouldSaveNewLocation() {
        LocationRequest request = new LocationRequest();
        request.setLocationName("Kho C");
        request.setLocationCode("LOC-C");

        when(locationRepository.save(any(Location.class))).thenAnswer(i -> {
            Location loc = i.getArgument(0);
            loc.setId(3);
            return loc;
        });

        FullLocationResponse response = locationService.createLocation(request);

        assertNotNull(response);
        assertEquals(3, response.getId());
        assertEquals("Kho C", response.getLocationName());
        assertEquals("ACTIVE", response.getStatus());

        verify(locationRepository).save(locationCaptor.capture());
        assertEquals("Kho C", locationCaptor.getValue().getName());
    }

    @Test
    void updateLocation_shouldUpdateExistingLocation() {
        LocationRequest request = new LocationRequest();
        request.setLocationName("Kho A Updated");
        request.setCapacity(1000);

        when(locationRepository.findById(1)).thenReturn(Optional.of(activeLocation));
        when(locationRepository.save(any(Location.class))).thenReturn(activeLocation);

        FullLocationResponse response = locationService.updateLocation(1, request);

        assertEquals("Kho A Updated", response.getLocationName());
        assertEquals(1000, response.getCapacity());
        verify(locationRepository).save(activeLocation);
    }

    @Test
    void deleteLocation_shouldDeleteLocation() {
        when(locationRepository.existsById(1)).thenReturn(true);

        locationService.deleteLocation(1);

        verify(locationRepository).deleteById(1);
    }

    @Test
    void transferStock_shouldTransferSuccessfully() {
        when(locationRepository.findById(1)).thenReturn(Optional.of(activeLocation));
        Location toLoc = Location.builder().id(2).name("Kho 2").build();
        when(locationRepository.findById(2)).thenReturn(Optional.of(toLoc));

        when(inventoryStockRepository.findByVariantIdAndBatchIdAndLocationId(variant.getId(), batch.getId(), 1))
                .thenReturn(Optional.of(stock));
                
        // Target doesn't have stock yet
        when(inventoryStockRepository.findByVariantIdAndBatchIdAndLocationId(variant.getId(), batch.getId(), 2))
                .thenReturn(Optional.empty());

        locationService.transferStock(1, 2, variant.getId(), batch.getId(), 20);

        // Verify deduct
        verify(inventoryStockRepository, times(2)).save(stockCaptor.capture());
        List<InventoryStock> savedStocks = stockCaptor.getAllValues();
        assertEquals(30, savedStocks.get(0).getQuantity()); // Updated source
        assertEquals(20, savedStocks.get(1).getQuantity()); // New target
        
        // Verify delete fromStock is not called
        verify(inventoryStockRepository, never()).delete(any());

        // Verify movements
        verify(stockMovementRepository, times(2)).save(movementCaptor.capture());
        List<StockMovement> savedMovements = movementCaptor.getAllValues();
        assertEquals("OUT", savedMovements.get(0).getType());
        assertEquals(20, savedMovements.get(0).getQuantity());
        assertEquals(1, savedMovements.get(0).getLocation().getId()); // From Loc 1

        assertEquals("IN", savedMovements.get(1).getType());
        assertEquals(20, savedMovements.get(1).getQuantity());
        assertEquals(2, savedMovements.get(1).getLocation().getId()); // To Loc 2
    }
    
    @Test
    void transferStock_shouldDeleteFromStockWhenTransferringAll() {
        when(locationRepository.findById(1)).thenReturn(Optional.of(activeLocation));
        Location toLoc = Location.builder().id(2).name("Kho 2").build();
        when(locationRepository.findById(2)).thenReturn(Optional.of(toLoc));

        when(inventoryStockRepository.findByVariantIdAndBatchIdAndLocationId(variant.getId(), batch.getId(), 1))
                .thenReturn(Optional.of(stock));
                
        InventoryStock targetStock = InventoryStock.builder().quantity(10).build();
        when(inventoryStockRepository.findByVariantIdAndBatchIdAndLocationId(variant.getId(), batch.getId(), 2))
                .thenReturn(Optional.of(targetStock));

        locationService.transferStock(1, 2, variant.getId(), batch.getId(), 50);

        verify(inventoryStockRepository).delete(stock);
        verify(inventoryStockRepository).save(stockCaptor.capture());
        assertEquals(60, stockCaptor.getValue().getQuantity()); // 10 original + 50 transferred
    }

    @Test
    void toggleLocationStatus_shouldDeactivate_whenActiveAndEmpty() {
        when(locationRepository.findById(1)).thenReturn(Optional.of(activeLocation));
        when(inventoryStockRepository.findByLocationIdWithProduct(1)).thenReturn(List.of()); // Empty stock
        when(locationRepository.save(any(Location.class))).thenReturn(activeLocation);

        FullLocationResponse response = locationService.toggleLocationStatus(1);

        assertEquals("INACTIVE", response.getStatus());
        verify(locationRepository).save(activeLocation);
    }

    @Test
    void toggleLocationStatus_shouldThrowException_whenActiveAndNotEmpty() {
        when(locationRepository.findById(1)).thenReturn(Optional.of(activeLocation));
        when(inventoryStockRepository.findByLocationIdWithProduct(1)).thenReturn(List.of(stock)); // Not empty

        RuntimeException ex = assertThrows(RuntimeException.class, () -> locationService.toggleLocationStatus(1));
        assertEquals("Vui lòng chuyển hết hàng hóa sang vị trí khác trước khi đóng vị trí này", ex.getMessage());
    }
}
