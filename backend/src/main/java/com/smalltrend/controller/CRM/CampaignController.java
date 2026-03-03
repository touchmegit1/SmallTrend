package com.smalltrend.controller.CRM;

import com.smalltrend.dto.CRM.CampaignResponse;
import com.smalltrend.dto.CRM.CreateCampaignRequest;
import com.smalltrend.service.CRM.CampaignService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/crm/campaigns")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:3000" })
public class CampaignController {

    private final CampaignService campaignService;

    @GetMapping
    public ResponseEntity<List<CampaignResponse>> getAllCampaigns() {
        return ResponseEntity.ok(campaignService.getAllCampaigns());
    }

    @GetMapping("/active")
    public ResponseEntity<List<CampaignResponse>> getActiveCampaigns() {
        return ResponseEntity.ok(campaignService.getActiveCampaigns());
    }

    @PostMapping
    public ResponseEntity<?> createCampaign(@RequestBody CreateCampaignRequest request) {
        try {
            CampaignResponse campaign = campaignService.createCampaign(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(campaign);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCampaign(@PathVariable Integer id, @RequestBody CreateCampaignRequest request) {
        try {
            CampaignResponse campaign = campaignService.updateCampaign(id, request);
            return ResponseEntity.ok(campaign);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCampaign(@PathVariable Integer id) {
        campaignService.deleteCampaign(id);
        return ResponseEntity.noContent().build();
    }
}
