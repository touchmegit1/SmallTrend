package com.smalltrend.controller.CRM;

import com.smalltrend.dto.CRM.AdvertisementResponse;
import com.smalltrend.dto.CRM.SaveAdvertisementRequest;
import com.smalltrend.service.CRM.AdvertisementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/advertisements")
@RequiredArgsConstructor
public class AdvertisementController {

    private final AdvertisementService advertisementService;

    /**
     * Lấy quảng cáo đang active (for homepage)
     * Không cần authentication
     */
    @GetMapping("/active")
    public ResponseEntity<Map<String, AdvertisementResponse>> getActiveAdvertisements() {
        return ResponseEntity.ok(advertisementService.getActiveAds());
    }

    /**
     * Lấy tất cả quảng cáo (admin only)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<AdvertisementResponse>> getAllAdvertisements() {
        return ResponseEntity.ok(advertisementService.getAll());
    }

    /**
     * Lấy stats của quảng cáo
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> getAdvertisementStats() {
        return ResponseEntity.ok(advertisementService.getStats());
    }

    /**
     * Tạo hoặc cập nhật quảng cáo
     */
    @PostMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AdvertisementResponse> saveAdvertisement(
            @PathVariable(required = false) Long id,
            @RequestBody SaveAdvertisementRequest request) {
        return ResponseEntity.ok(advertisementService.save(id, request));
    }

    /**
     * Tạo quảng cáo mới
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AdvertisementResponse> createAdvertisement(
            @RequestBody SaveAdvertisementRequest request) {
        return ResponseEntity.ok(advertisementService.save(null, request));
    }

    /**
     * Bật / tắt quảng cáo
     */
    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AdvertisementResponse> toggleActiveAdvertisement(@PathVariable Long id) {
        return ResponseEntity.ok(advertisementService.toggleActive(id));
    }

    /**
     * Xoá quảng cáo
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteAdvertisement(@PathVariable Long id) {
        advertisementService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
