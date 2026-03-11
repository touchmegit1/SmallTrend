package com.smalltrend.controller.inventory.location;

import com.smalltrend.dto.inventory.location.FullLocationResponse;
import com.smalltrend.dto.inventory.location.LocationRequest;
import com.smalltrend.dto.inventory.location.LocationStockItemResponse;
import com.smalltrend.service.inventory.location.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory/locations")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000" })
public class LocationController {

    private final LocationService locationService;

    /**
     * GET /api/inventory/locations
     * List all locations with full details + stock info
     */
    @GetMapping
    public ResponseEntity<List<FullLocationResponse>> getAllLocations() {
        return ResponseEntity.ok(locationService.getAllLocations());
    }

    /**
     * GET /api/inventory/locations/active
     * List only ACTIVE locations (for dropdown usage)
     */
    @GetMapping("/active")
    public ResponseEntity<List<FullLocationResponse>> getActiveLocations() {
        return ResponseEntity.ok(locationService.getActiveLocations());
    }

    /**
     * GET /api/inventory/locations/{id}
     */
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<FullLocationResponse> getLocationById(@PathVariable Integer id) {
        return ResponseEntity.ok(locationService.getLocationById(id));
    }

    /**
     * GET /api/inventory/locations/{id}/stocks
     * Get all products/stock items at a specific location
     */
    @GetMapping("/{id:\\d+}/stocks")
    public ResponseEntity<List<LocationStockItemResponse>> getLocationStocks(@PathVariable Integer id) {
        return ResponseEntity.ok(locationService.getLocationStockItems(id));
    }

    /**
     * POST /api/inventory/locations
     * Create a new location
     */
    @PostMapping
    public ResponseEntity<FullLocationResponse> createLocation(@RequestBody LocationRequest request) {
        FullLocationResponse created = locationService.createLocation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/inventory/locations/{id}
     * Update an existing location
     */
    @PutMapping("/{id:\\d+}")
    public ResponseEntity<FullLocationResponse> updateLocation(
            @PathVariable Integer id,
            @RequestBody LocationRequest request) {
        return ResponseEntity.ok(locationService.updateLocation(id, request));
    }

    /**
     * DELETE /api/inventory/locations/{id}
     * Delete a location
     */
    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Map<String, String>> deleteLocation(@PathVariable Integer id) {
        locationService.deleteLocation(id);
        return ResponseEntity.ok(Map.of("message", "Location deleted successfully"));
    }

    /**
     * PUT /api/inventory/locations/{id}/toggle-status
     * Toggle location status between ACTIVE and INACTIVE
     */
    @PutMapping("/{id:\\d+}/toggle-status")
    public ResponseEntity<?> toggleLocationStatus(@PathVariable Integer id) {
        try {
            FullLocationResponse updated = locationService.toggleLocationStatus(id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * POST /api/inventory/locations/transfer
     * Transfer stock items from one location to another
     * Body: { fromLocationId, toLocationId, variantId, batchId, quantity }
     */
    @PostMapping("/transfer")
    public ResponseEntity<?> transferStock(@RequestBody Map<String, Object> body) {
        try {
            Integer fromLocationId = ((Number) body.get("fromLocationId")).intValue();
            Integer toLocationId   = ((Number) body.get("toLocationId")).intValue();
            Integer variantId      = ((Number) body.get("variantId")).intValue();
            Integer batchId        = ((Number) body.get("batchId")).intValue();
            int quantity           = ((Number) body.get("quantity")).intValue();
            locationService.transferStock(fromLocationId, toLocationId, variantId, batchId, quantity);
            return ResponseEntity.ok(Map.of("message", "Chuyển hàng thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}

