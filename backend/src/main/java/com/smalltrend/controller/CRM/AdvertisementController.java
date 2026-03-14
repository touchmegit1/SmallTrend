package com.smalltrend.controller.CRM;

import com.smalltrend.dto.CRM.AdvertisementResponse;
import com.smalltrend.dto.CRM.SaveAdvertisementRequest;
import com.smalltrend.service.CRM.AdvertisementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/crm/ads")
@RequiredArgsConstructor
public class AdvertisementController {

    private final AdvertisementService adService;

    /** GET /api/crm/ads — toàn bộ danh sách (admin) */
    @GetMapping
    public ResponseEntity<List<AdvertisementResponse>> getAll() {
        return ResponseEntity.ok(adService.getAll());
    }

    /** GET /api/crm/ads/active — 2 quảng cáo đang active (LEFT + RIGHT) */
    @GetMapping("/active")
    public ResponseEntity<Map<String, AdvertisementResponse>> getActive() {
        return ResponseEntity.ok(adService.getActiveAds());
    }

    /** GET /api/crm/ads/stats — báo cáo thống kê hợp đồng */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adService.getStats());
    }

    /** POST /api/crm/ads — tạo mới */
    @PostMapping
    public ResponseEntity<AdvertisementResponse> create(@RequestBody SaveAdvertisementRequest req) {
        return ResponseEntity.ok(adService.save(null, req));
    }

    /** PUT /api/crm/ads/{id} — cập nhật */
    @PutMapping("/{id}")
    public ResponseEntity<AdvertisementResponse> update(
            @PathVariable Long id,
            @RequestBody SaveAdvertisementRequest req) {
        return ResponseEntity.ok(adService.save(id, req));
    }

    /** PATCH /api/crm/ads/{id}/toggle — bật/tắt hiển thị */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<AdvertisementResponse> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(adService.toggleActive(id));
    }

    /** DELETE /api/crm/ads/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        adService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
