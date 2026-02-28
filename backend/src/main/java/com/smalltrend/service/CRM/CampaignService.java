package com.smalltrend.service.CRM;

import com.smalltrend.dto.CRM.CampaignResponse;
import com.smalltrend.dto.CRM.CreateCampaignRequest;
import com.smalltrend.entity.Campaign;
import com.smalltrend.repository.CampaignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private final CampaignRepository campaignRepository;

    public List<CampaignResponse> getAllCampaigns() {
        return campaignRepository.findAllByOrderByStartDateDesc()
                .stream().map(this::mapToResponse).toList();
    }

    public List<CampaignResponse> getActiveCampaigns() {
        return campaignRepository.findByStatusOrderByStartDateDesc("ACTIVE")
                .stream().map(this::mapToResponse).toList();
    }

    public CampaignResponse createCampaign(CreateCampaignRequest request) {
        Campaign campaign = Campaign.builder()
                .campaignCode(request.getCampaignCode())
                .campaignName(request.getCampaignName())
                .campaignType(request.getCampaignType())
                .description(request.getDescription())
                .bannerImageUrl(request.getBannerImageUrl())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus() != null ? request.getStatus() : "DRAFT")
                .budget(request.getBudget())
                .minPurchaseAmount(request.getMinPurchaseAmount())
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : false)
                .build();
        return mapToResponse(campaignRepository.save(campaign));
    }

    public CampaignResponse updateCampaign(Integer id, CreateCampaignRequest request) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found: " + id));
        campaign.setCampaignName(request.getCampaignName());
        campaign.setCampaignType(request.getCampaignType());
        campaign.setDescription(request.getDescription());
        campaign.setBannerImageUrl(request.getBannerImageUrl());
        campaign.setStartDate(request.getStartDate());
        campaign.setEndDate(request.getEndDate());
        campaign.setStatus(request.getStatus());
        campaign.setBudget(request.getBudget());
        campaign.setMinPurchaseAmount(request.getMinPurchaseAmount());
        campaign.setIsPublic(request.getIsPublic());
        return mapToResponse(campaignRepository.save(campaign));
    }

    public void deleteCampaign(Integer id) {
        if (!campaignRepository.existsById(id))
            throw new RuntimeException("Campaign not found: " + id);
        campaignRepository.deleteById(id);
    }

    private CampaignResponse mapToResponse(Campaign c) {
        CampaignResponse r = new CampaignResponse();
        r.setId(c.getId());
        r.setCampaignCode(c.getCampaignCode());
        r.setCampaignName(c.getCampaignName());
        r.setCampaignType(c.getCampaignType());
        r.setDescription(c.getDescription());
        r.setBannerImageUrl(c.getBannerImageUrl());
        r.setStartDate(c.getStartDate());
        r.setEndDate(c.getEndDate());
        r.setStatus(c.getStatus());
        r.setBudget(c.getBudget());
        r.setMinPurchaseAmount(c.getMinPurchaseAmount());
        r.setIsPublic(c.getIsPublic());
        return r;
    }
}
