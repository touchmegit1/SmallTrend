package com.smalltrend.service.inventory;

import com.smalltrend.dto.inventory.location.FullLocationResponse;
import com.smalltrend.dto.inventory.location.LocationRequest;
import com.smalltrend.dto.inventory.location.LocationStockItemResponse;
import com.smalltrend.entity.InventoryStock;
import com.smalltrend.entity.Location;
import com.smalltrend.repository.InventoryStockRepository;
import com.smalltrend.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;
    private final InventoryStockRepository inventoryStockRepository;

    // ─── GET ALL (with stock info) ──────────────────────────
    public List<FullLocationResponse> getAllLocations() {
        return locationRepository.findAll().stream()
                .map(loc -> toResponseWithStock(loc))
                .collect(Collectors.toList());
    }

    // ─── GET BY ID (with stock details) ─────────────────────
    public FullLocationResponse getLocationById(Integer id) {
        Location loc = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found: " + id));
        return toResponseWithStock(loc);
    }

    // ─── GET STOCK ITEMS AT LOCATION ────────────────────────
    public List<LocationStockItemResponse> getLocationStockItems(Integer locationId) {
        if (!locationRepository.existsById(locationId)) {
            throw new RuntimeException("Location not found: " + locationId);
        }
        List<InventoryStock> stocks = inventoryStockRepository.findByLocationIdWithProduct(locationId);
        return stocks.stream()
                .map(this::toStockItemResponse)
                .collect(Collectors.toList());
    }

    // ─── CREATE ──────────────────────────────────────────
    @Transactional
    public FullLocationResponse createLocation(LocationRequest request) {
        Location loc = Location.builder()
                .name(request.getLocationName())
                .locationCode(request.getLocationCode())
                .warehouseType(request.getLocationType())
                .address(request.getAddress())
                .capacity(request.getCapacity() != null ? request.getCapacity() : 0)
                .description(request.getDescription())
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .build();

        Location saved = locationRepository.save(loc);
        return toResponseWithStock(saved);
    }

    // ─── UPDATE ──────────────────────────────────────────
    @Transactional
    public FullLocationResponse updateLocation(Integer id, LocationRequest request) {
        Location loc = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found: " + id));

        if (request.getLocationName() != null) loc.setName(request.getLocationName());
        if (request.getLocationCode() != null) loc.setLocationCode(request.getLocationCode());
        if (request.getLocationType() != null) loc.setWarehouseType(request.getLocationType());
        if (request.getAddress() != null) loc.setAddress(request.getAddress());
        if (request.getCapacity() != null) loc.setCapacity(request.getCapacity());
        if (request.getDescription() != null) loc.setDescription(request.getDescription());

        Location saved = locationRepository.save(loc);
        return toResponseWithStock(saved);
    }

    // ─── DELETE ──────────────────────────────────────────
    @Transactional
    public void deleteLocation(Integer id) {
        if (!locationRepository.existsById(id)) {
            throw new RuntimeException("Location not found: " + id);
        }
        locationRepository.deleteById(id);
    }

    // ─── Mapper: Location → Response WITH stock info ────────
    private FullLocationResponse toResponseWithStock(Location loc) {
        List<InventoryStock> stocks;
        try {
            stocks = inventoryStockRepository.findByLocationIdWithProduct(loc.getId());
        } catch (Exception e) {
            stocks = new ArrayList<>();
        }

        int totalProducts = stocks.stream()
                .mapToInt(s -> s.getQuantity() != null ? s.getQuantity() : 0)
                .sum();

        List<LocationStockItemResponse> stockItems = stocks.stream()
                .map(this::toStockItemResponse)
                .collect(Collectors.toList());

        return FullLocationResponse.builder()
                .id(loc.getId())
                .locationName(loc.getName())
                .locationCode(loc.getLocationCode() != null ? loc.getLocationCode() : "")
                .locationType(loc.getWarehouseType())
                .address(loc.getAddress() != null ? loc.getAddress() : "")
                .capacity(loc.getCapacity() != null ? loc.getCapacity() : 0)
                .description(loc.getDescription() != null ? loc.getDescription() : "")
                .status(loc.getStatus() != null ? loc.getStatus() : "ACTIVE")
                .createdAt(loc.getCreatedAt() != null ? loc.getCreatedAt().toString() : null)
                .totalProducts(totalProducts)
                .stockItems(stockItems)
                .build();
    }

    // ─── Mapper: InventoryStock → StockItemResponse ─────────
    private LocationStockItemResponse toStockItemResponse(InventoryStock stock) {
        return LocationStockItemResponse.builder()
                .variantId(stock.getVariant() != null ? stock.getVariant().getId() : null)
                .sku(stock.getVariant() != null ? stock.getVariant().getSku() : "")
                .productName(stock.getVariant() != null && stock.getVariant().getProduct() != null
                        ? stock.getVariant().getProduct().getName() : "")
                .variantUnit(stock.getVariant() != null && stock.getVariant().getUnit() != null
                        ? stock.getVariant().getUnit().getName() : "")
                .quantity(stock.getQuantity() != null ? stock.getQuantity() : 0)
                .batchCode(stock.getBatch() != null ? stock.getBatch().getBatchNumber() : "")
                .batchId(stock.getBatch() != null ? stock.getBatch().getId() : null)
                .build();
    }
}
