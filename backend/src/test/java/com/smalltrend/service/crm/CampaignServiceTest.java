package com.smalltrend.service.crm;

import com.smalltrend.dto.CRM.CampaignResponse;
import com.smalltrend.dto.CRM.CreateCampaignRequest;
import com.smalltrend.entity.Campaign;
import com.smalltrend.repository.CampaignRepository;
import com.smalltrend.service.CRM.CampaignService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CampaignServiceTest {

    @Mock
    private CampaignRepository campaignRepository;

    @InjectMocks
    private CampaignService campaignService;

    @Test
    void getAllCampaigns_shouldMapRepositoryData() {
        Campaign campaign = Campaign.builder()
                .id(1)
                .campaignCode("CMP-001")
                .campaignName("Summer Sale")
                .campaignType("PROMOTION")
                .startDate(LocalDate.of(2026, 3, 1))
                .endDate(LocalDate.of(2026, 3, 31))
                .status("ACTIVE")
                .isPublic(true)
                .isHomepageBanner(false)
                .build();

        when(campaignRepository.findAllByOrderByStartDateDesc()).thenReturn(List.of(campaign));

        List<CampaignResponse> responses = campaignService.getAllCampaigns();

        assertEquals(1, responses.size());
        assertEquals("CMP-001", responses.get(0).getCampaignCode());
        assertEquals("Summer Sale", responses.get(0).getCampaignName());
    }

    @Test
    void createCampaign_shouldDefaultStatusToDraftWhenMissing() {
        CreateCampaignRequest request = new CreateCampaignRequest();
        request.setCampaignCode("CMP-002");
        request.setCampaignName("New Campaign");
        request.setCampaignType("EVENT");
        request.setStartDate(LocalDate.of(2026, 4, 1));
        request.setEndDate(LocalDate.of(2026, 4, 30));
        request.setIsPublic(true);

        when(campaignRepository.save(any(Campaign.class))).thenAnswer(invocation -> {
            Campaign saved = invocation.getArgument(0);
            saved.setId(2);
            return saved;
        });

        CampaignResponse response = campaignService.createCampaign(request);

        assertEquals("DRAFT", response.getStatus());
        assertFalse(Boolean.TRUE.equals(response.getIsHomepageBanner()));
        verify(campaignRepository, never()).clearHomepageBannerFlag(any());
    }

    @Test
    void createCampaign_shouldClearExistingHomepageBannerWhenActiveBannerRequested() {
        CreateCampaignRequest request = new CreateCampaignRequest();
        request.setCampaignCode("CMP-003");
        request.setCampaignName("Homepage Banner Campaign");
        request.setCampaignType("PROMOTION");
        request.setStartDate(LocalDate.of(2026, 5, 1));
        request.setEndDate(LocalDate.of(2026, 5, 31));
        request.setStatus("ACTIVE");
        request.setIsHomepageBanner(true);
        request.setBudget(new BigDecimal("1000000"));

        when(campaignRepository.save(any(Campaign.class))).thenAnswer(invocation -> {
            Campaign saved = invocation.getArgument(0);
            saved.setId(3);
            return saved;
        });

        CampaignResponse response = campaignService.createCampaign(request);

        assertTrue(Boolean.TRUE.equals(response.getIsHomepageBanner()));
        assertEquals("ACTIVE", response.getStatus());
        verify(campaignRepository).clearHomepageBannerFlag(null);
    }

    @Test
    void createCampaign_shouldThrowWhenHomepageBannerIsNotActive() {
        CreateCampaignRequest request = new CreateCampaignRequest();
        request.setCampaignCode("CMP-004");
        request.setCampaignName("Invalid Banner");
        request.setCampaignType("PROMOTION");
        request.setStartDate(LocalDate.of(2026, 5, 1));
        request.setEndDate(LocalDate.of(2026, 5, 31));
        request.setStatus("DRAFT");
        request.setIsHomepageBanner(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> campaignService.createCampaign(request));

        assertEquals("Chỉ chiến dịch ACTIVE mới được chọn làm banner homepage", exception.getMessage());
    }

    @Test
    void updateCampaign_shouldUpdateAndClearOtherHomepageBanners() {
        Campaign campaign = Campaign.builder()
                .id(10)
                .campaignCode("CMP-010")
                .campaignName("Old Name")
                .status("DRAFT")
                .isHomepageBanner(false)
                .build();

        CreateCampaignRequest request = new CreateCampaignRequest();
        request.setCampaignName("Updated Name");
        request.setCampaignType("FLASH_SALE");
        request.setDescription("Updated desc");
        request.setStartDate(LocalDate.of(2026, 6, 1));
        request.setEndDate(LocalDate.of(2026, 6, 2));
        request.setStatus("ACTIVE");
        request.setBudget(new BigDecimal("500000"));
        request.setMinPurchaseAmount(new BigDecimal("100000"));
        request.setIsPublic(true);
        request.setIsHomepageBanner(true);

        when(campaignRepository.findById(10)).thenReturn(Optional.of(campaign));
        when(campaignRepository.save(campaign)).thenReturn(campaign);

        CampaignResponse response = campaignService.updateCampaign(10, request);

        assertEquals("Updated Name", response.getCampaignName());
        assertEquals("FLASH_SALE", response.getCampaignType());
        assertTrue(Boolean.TRUE.equals(response.getIsHomepageBanner()));
        verify(campaignRepository).clearHomepageBannerFlag(10);
    }

    @Test
    void updateCampaign_shouldThrowWhenCampaignMissing() {
        when(campaignRepository.findById(99)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> campaignService.updateCampaign(99, new CreateCampaignRequest()));

        assertEquals("Campaign not found: 99", exception.getMessage());
    }

    @Test
    void deleteCampaign_shouldThrowWhenMissing() {
        when(campaignRepository.existsById(55)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> campaignService.deleteCampaign(55));

        assertEquals("Campaign not found: 55", exception.getMessage());
    }
}