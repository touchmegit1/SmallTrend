package com.smalltrend.controller.inventory.location;

import com.smalltrend.dto.inventory.location.FullLocationResponse;
import com.smalltrend.dto.inventory.location.LocationRequest;
import com.smalltrend.dto.inventory.location.LocationStockItemResponse;
import com.smalltrend.dto.inventory.location.LocationTransferRequest;
import com.smalltrend.service.inventory.location.LocationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory/locations")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping
    public ResponseEntity<List<FullLocationResponse>> getAllLocations() {
        return ResponseEntity.ok(locationService.getAllLocations());
    }

    @GetMapping("/active")
    public ResponseEntity<List<FullLocationResponse>> getActiveLocations() {
        return ResponseEntity.ok(locationService.getActiveLocations());
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<FullLocationResponse> getLocationById(@PathVariable Integer id) {
        return ResponseEntity.ok(locationService.getLocationById(id));
    }

    @GetMapping("/{id:\\d+}/stocks")
    public ResponseEntity<List<LocationStockItemResponse>> getLocationStocks(@PathVariable Integer id) {
        return ResponseEntity.ok(locationService.getLocationStockItems(id));
    }

    @PostMapping
    public ResponseEntity<FullLocationResponse> createLocation(@Valid @RequestBody LocationRequest request) {
        FullLocationResponse created = locationService.createLocation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<FullLocationResponse> updateLocation(
            @PathVariable Integer id,
            @Valid @RequestBody LocationRequest request) {
        return ResponseEntity.ok(locationService.updateLocation(id, request));
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Map<String, String>> deleteLocation(@PathVariable Integer id) {
        locationService.deleteLocation(id);
        return ResponseEntity.ok(Map.of("message", "Location deleted successfully"));
    }

    @PostMapping("/transfer")
    public ResponseEntity<Map<String, String>> transferStock(@Valid @RequestBody LocationTransferRequest request) {
        locationService.transferStock(
                request.getFromLocationId(),
                request.getToLocationId(),
                request.getVariantId(),
                request.getBatchId(),
                request.getQuantity());
        return ResponseEntity.ok(Map.of("message", "Chuyển hàng thành công"));
    }
}
