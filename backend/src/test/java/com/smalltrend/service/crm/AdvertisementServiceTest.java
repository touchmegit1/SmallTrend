package com.smalltrend.service.crm;

import com.smalltrend.dto.CRM.AdvertisementResponse;
import com.smalltrend.dto.CRM.SaveAdvertisementRequest;
import com.smalltrend.entity.Advertisement;
import com.smalltrend.repository.AdvertisementRepository;
import com.smalltrend.service.CRM.AdvertisementService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdvertisementServiceTest {

    @Mock
    private AdvertisementRepository advertisementRepository;

    @InjectMocks
    private AdvertisementService advertisementService;

    @Test
    void getAll_shouldReturnMappedAdvertisements() {
        Advertisement advertisement = Advertisement.builder()
                .id(1L)
                .slot("LEFT")
                .sponsorName("Sponsor")
                .title("Ad title")
                .isActive(true)
                .build();

        when(advertisementRepository.findAllByOrderBySlotAscCreatedAtDesc()).thenReturn(List.of(advertisement));

        List<AdvertisementResponse> responses = advertisementService.getAll();

        assertEquals(1, responses.size());
        assertEquals("LEFT", responses.get(0).getSlot());
        assertEquals("Sponsor", responses.get(0).getSponsorName());
    }

    @Test
    void getActiveAds_shouldNormalizeSlotAndKeepFirstActivePerSlot() {
        Advertisement first = Advertisement.builder().id(1L).slot("left").sponsorName("A").title("First").isActive(true).build();
        Advertisement second = Advertisement.builder().id(2L).slot("LEFT").sponsorName("B").title("Second").isActive(true).build();

        when(advertisementRepository.findByIsActiveTrue()).thenReturn(List.of(first, second));

        Map<String, AdvertisementResponse> result = advertisementService.getActiveAds();

        assertEquals(1, result.size());
        assertEquals("A", result.get("LEFT").getSponsorName());
    }

    @Test
    void save_shouldCreateNewAdvertisementAndUppercaseSlot() {
        SaveAdvertisementRequest request = new SaveAdvertisementRequest();
        request.setSlot("right");
        request.setSponsorName("New Sponsor");
        request.setTitle("New Title");
        request.setIsActive(true);

        when(advertisementRepository.save(any(Advertisement.class))).thenAnswer(invocation -> {
            Advertisement saved = invocation.getArgument(0);
            saved.setId(3L);
            return saved;
        });

        AdvertisementResponse response = advertisementService.save(null, request);

        assertEquals(3L, response.getId());
        assertEquals("RIGHT", response.getSlot());
    }

    @Test
    void toggleActive_shouldInvertCurrentState() {
        Advertisement advertisement = Advertisement.builder().id(4L).slot("LEFT").sponsorName("S").title("T").isActive(true).build();

        when(advertisementRepository.findById(4L)).thenReturn(Optional.of(advertisement));
        when(advertisementRepository.save(advertisement)).thenReturn(advertisement);

        AdvertisementResponse response = advertisementService.toggleActive(4L);

        assertEquals(false, response.getIsActive());
    }

    @Test
    void delete_shouldThrowWhenAdvertisementMissing() {
        when(advertisementRepository.existsById(9L)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> advertisementService.delete(9L));

        assertEquals("Advertisement not found: 9", exception.getMessage());
    }

    @Test
    void getStats_shouldCalculateCounts() {
        Advertisement active = Advertisement.builder()
                .id(1L)
                .slot("LEFT")
                .sponsorName("A")
                .title("Ad A")
                .isActive(true)
                .build();
        Advertisement inactive = Advertisement.builder()
                .id(2L)
                .slot("RIGHT")
                .sponsorName("B")
                .title("Ad B")
                .isActive(false)
                .build();

        when(advertisementRepository.findAll()).thenReturn(List.of(active, inactive));

        Map<String, Object> stats = advertisementService.getStats();

        assertEquals(2L, stats.get("total"));
        assertEquals(1L, stats.get("active"));
        assertEquals(1L, stats.get("inactive"));
    }
}