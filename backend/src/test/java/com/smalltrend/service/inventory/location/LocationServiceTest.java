package com.smalltrend.service.inventory.location;

import com.smalltrend.dto.inventory.location.FullLocationResponse;
import com.smalltrend.dto.inventory.location.LocationRequest;
import com.smalltrend.dto.inventory.location.LocationStockItemResponse;
import com.smalltrend.entity.InventoryStock;
import com.smalltrend.entity.Location;
import com.smalltrend.entity.Product;
import com.smalltrend.entity.ProductBatch;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.StockMovement;
import com.smalltrend.entity.Unit;
import com.smalltrend.exception.LocationException;
import com.smalltrend.repository.DisposalVoucherRepository;
import com.smalltrend.repository.InventoryCountRepository;
import com.smalltrend.repository.InventoryStockRepository;
import com.smalltrend.repository.LocationRepository;
import com.smalltrend.repository.PurchaseOrderRepository;
import com.smalltrend.repository.StockMovementRepository;
import com.smalltrend.service.inventory.LocationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LocationServiceTest {

    @Mock
    private LocationRepository locationRepository;
    @Mock
    private InventoryStockRepository inventoryStockRepository;
    @Mock
    private StockMovementRepository stockMovementRepository;
    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;
    @Mock
    private InventoryCountRepository inventoryCountRepository;
    @Mock
    private DisposalVoucherRepository disposalVoucherRepository;

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
                .warehouseType("WAREHOUSE")
                .status("ACTIVE")
                .build();

        inactiveLocation = Location.builder()
                .id(2)
                .name("Kho B")
                .locationCode("LOC-B")
                .warehouseType("WAREHOUSE")
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
        assertEquals("Kho A", responses.get(0).getLocationName());
        assertEquals(50, responses.get(0).getTotalProducts());
        assertEquals(0, responses.get(1).getTotalProducts());
    }

    @Test
    void getActiveLocations_shouldReturnOnlyActive() {
        when(locationRepository.findByStatus("ACTIVE")).thenReturn(List.of(activeLocation));
        when(inventoryStockRepository.findByLocationIdWithProduct(1)).thenReturn(List.of(stock));

        List<FullLocationResponse> responses = locationService.getActiveLocations();

        assertEquals(1, responses.size());
        assertEquals(1, responses.get(0).getId());
    }

    @Test
    void getLocationStockItems_shouldReturnStockItems() {
        when(locationRepository.findById(1)).thenReturn(Optional.of(activeLocation));
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
        request.setLocationType("WAREHOUSE");

        when(locationRepository.existsByLocationCodeIgnoreCase("LOC-C")).thenReturn(false);
        when(locationRepository.save(any(Location.class))).thenAnswer(i -> {
            Location loc = i.getArgument(0);
            loc.setId(3);
            return loc;
        });
        when(inventoryStockRepository.findByLocationIdWithProduct(3)).thenReturn(List.of());

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
        request.setLocationCode("LOC-A-UPD");
        request.setLocationType("WAREHOUSE");
        request.setCapacity(1000);

        when(locationRepository.findById(1)).thenReturn(Optional.of(activeLocation));
        when(locationRepository.existsByLocationCodeIgnoreCaseAndIdNot("LOC-A-UPD", 1)).thenReturn(false);
        when(locationRepository.save(any(Location.class))).thenReturn(activeLocation);
        when(inventoryStockRepository.findByLocationIdWithProduct(1)).thenReturn(List.of());

        FullLocationResponse response = locationService.updateLocation(1, request);

        assertEquals("Kho A Updated", response.getLocationName());
        assertEquals(1000, response.getCapacity());
        verify(locationRepository).save(activeLocation);
    }

    @Test
    void deleteLocation_shouldDeleteLocation_whenNoStockAndNoReferences() {
        when(locationRepository.findById(1)).thenReturn(Optional.of(activeLocation));
        when(inventoryStockRepository.existsByLocationIdAndQuantityGreaterThan(1, 0)).thenReturn(false);
        when(purchaseOrderRepository.existsByLocationId(1)).thenReturn(false);
        when(inventoryCountRepository.existsByLocationId(1)).thenReturn(false);
        when(disposalVoucherRepository.existsByLocationId(1)).thenReturn(false);

        locationService.deleteLocation(1);

        verify(locationRepository).deleteById(1);
    }

    @Test
    void deleteLocation_shouldThrowConflict_whenStillHasStock() {
        when(locationRepository.findById(1)).thenReturn(Optional.of(activeLocation));
        when(inventoryStockRepository.existsByLocationIdAndQuantityGreaterThan(1, 0)).thenReturn(true);

        LocationException ex = assertThrows(LocationException.class, () -> locationService.deleteLocation(1));

        assertEquals("Không thể xóa vị trí đang còn tồn kho", ex.getMessage());
        verify(locationRepository, never()).deleteById(1);
    }

    @Test
    void transferStock_shouldTransferSuccessfully() {
        when(locationRepository.findById(1)).thenReturn(Optional.of(activeLocation));
        Location toLoc = Location.builder().id(2).name("Kho 2").status("ACTIVE").build();
        when(locationRepository.findById(2)).thenReturn(Optional.of(toLoc));

        when(inventoryStockRepository.findByVariantIdAndBatchIdAndLocationId(variant.getId(), batch.getId(), 1))
                .thenReturn(Optional.of(stock));
        when(inventoryStockRepository.findByVariantIdAndBatchIdAndLocationId(variant.getId(), batch.getId(), 2))
                .thenReturn(Optional.empty());

        locationService.transferStock(1, 2, variant.getId(), batch.getId(), 20);

        verify(inventoryStockRepository, times(2)).save(stockCaptor.capture());
        List<InventoryStock> savedStocks = stockCaptor.getAllValues();
        assertEquals(30, savedStocks.get(0).getQuantity());
        assertEquals(20, savedStocks.get(1).getQuantity());
        verify(inventoryStockRepository, never()).delete(any());

        verify(stockMovementRepository, times(2)).save(movementCaptor.capture());
        List<StockMovement> savedMovements = movementCaptor.getAllValues();
        assertEquals("OUT", savedMovements.get(0).getType());
        assertEquals(20, savedMovements.get(0).getQuantity());
        assertEquals(1, savedMovements.get(0).getLocation().getId());

        assertEquals("IN", savedMovements.get(1).getType());
        assertEquals(20, savedMovements.get(1).getQuantity());
        assertEquals(2, savedMovements.get(1).getLocation().getId());
    }

    @Test
    void toggleLocationStatus_shouldDeactivate_whenActiveAndEmpty() {
        when(locationRepository.findById(1)).thenReturn(Optional.of(activeLocation));
        when(inventoryStockRepository.findByLocationIdWithProduct(1)).thenReturn(List.of());
        when(locationRepository.save(any(Location.class))).thenReturn(activeLocation);

        FullLocationResponse response = locationService.toggleLocationStatus(1);

        assertEquals("INACTIVE", response.getStatus());
        verify(locationRepository).save(activeLocation);
    }

    @Test
    void toggleLocationStatus_shouldThrowException_whenActiveAndNotEmpty() {
        when(locationRepository.findById(1)).thenReturn(Optional.of(activeLocation));
        when(inventoryStockRepository.findByLocationIdWithProduct(1)).thenReturn(List.of(stock));

        LocationException ex = assertThrows(LocationException.class, () -> locationService.toggleLocationStatus(1));
        assertEquals("Vui lòng chuyển hết hàng hóa sang vị trí khác trước khi đóng vị trí này", ex.getMessage());
    }
}
