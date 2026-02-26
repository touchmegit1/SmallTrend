package com.smalltrend.service.inventory;

import com.smalltrend.dto.inventory.FullLocationResponse;
import com.smalltrend.dto.inventory.LocationRequest;
import com.smalltrend.entity.Location;
import com.smalltrend.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;

    // ─── GET ALL ─────────────────────────────────────────
    public List<FullLocationResponse> getAllLocations() {
        return locationRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ─── GET BY ID ───────────────────────────────────────
    public FullLocationResponse getLocationById(Integer id) {
        Location loc = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found: " + id));
        return toResponse(loc);
    }

    // ─── CREATE ──────────────────────────────────────────
    @Transactional
    public FullLocationResponse createLocation(LocationRequest request) {
        Location loc = Location.builder()
                .name(request.getLocationName())
                .locationCode(request.getLocationCode())
                .type(request.getLocationType())
                .address(request.getAddress())
                .capacity(request.getCapacity() != null ? request.getCapacity() : 0)
                .description(request.getDescription())
                .status("ACTIVE")
                .createdAt(LocalDateTime.now())
                .build();

        Location saved = locationRepository.save(loc);
        return toResponse(saved);
    }

    // ─── UPDATE ──────────────────────────────────────────
    @Transactional
    public FullLocationResponse updateLocation(Integer id, LocationRequest request) {
        Location loc = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found: " + id));

        if (request.getLocationName() != null) loc.setName(request.getLocationName());
        if (request.getLocationCode() != null) loc.setLocationCode(request.getLocationCode());
        if (request.getLocationType() != null) loc.setType(request.getLocationType());
        if (request.getAddress() != null) loc.setAddress(request.getAddress());
        if (request.getCapacity() != null) loc.setCapacity(request.getCapacity());
        if (request.getDescription() != null) loc.setDescription(request.getDescription());

        Location saved = locationRepository.save(loc);
        return toResponse(saved);
    }

    // ─── DELETE ──────────────────────────────────────────
    @Transactional
    public void deleteLocation(Integer id) {
        if (!locationRepository.existsById(id)) {
            throw new RuntimeException("Location not found: " + id);
        }
        locationRepository.deleteById(id);
    }

    // ─── Mapper ──────────────────────────────────────────
    private FullLocationResponse toResponse(Location loc) {
        return FullLocationResponse.builder()
                .id(loc.getId())
                .locationName(loc.getName())
                .locationCode(loc.getLocationCode() != null ? loc.getLocationCode() : "")
                .locationType(loc.getType())
                .address(loc.getAddress() != null ? loc.getAddress() : "")
                .capacity(loc.getCapacity() != null ? loc.getCapacity() : 0)
                .description(loc.getDescription() != null ? loc.getDescription() : "")
                .status(loc.getStatus() != null ? loc.getStatus() : "ACTIVE")
                .createdAt(loc.getCreatedAt() != null ? loc.getCreatedAt().toString() : null)
                .build();
    }
}
