package com.smalltrend.controller.inventory;

import com.smalltrend.dto.inventory.FullLocationResponse;
import com.smalltrend.dto.inventory.LocationRequest;
import com.smalltrend.service.inventory.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory/locations")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class LocationController {

    private final LocationService locationService;

    /**
     * GET /api/inventory/locations
     * List all locations with full details
     */
    @GetMapping
    public ResponseEntity<List<FullLocationResponse>> getAllLocations() {
        return ResponseEntity.ok(locationService.getAllLocations());
    }

    /**
     * GET /api/inventory/locations/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<FullLocationResponse> getLocationById(@PathVariable Integer id) {
        return ResponseEntity.ok(locationService.getLocationById(id));
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
    @PutMapping("/{id}")
    public ResponseEntity<FullLocationResponse> updateLocation(
            @PathVariable Integer id,
            @RequestBody LocationRequest request) {
        return ResponseEntity.ok(locationService.updateLocation(id, request));
    }

    /**
     * DELETE /api/inventory/locations/{id}
     * Delete a location
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteLocation(@PathVariable Integer id) {
        locationService.deleteLocation(id);
        return ResponseEntity.ok(Map.of("message", "Location deleted successfully"));
    }
}
