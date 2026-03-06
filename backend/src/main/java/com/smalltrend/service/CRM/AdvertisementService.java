package com.smalltrend.service.CRM;

import com.smalltrend.dto.CRM.AdvertisementResponse;
import com.smalltrend.dto.CRM.SaveAdvertisementRequest;
import com.smalltrend.entity.Advertisement;
import com.smalltrend.repository.AdvertisementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdvertisementService {

    private final AdvertisementRepository adRepository;

    /** Lấy tất cả quảng cáo (admin view) */
    public List<AdvertisementResponse> getAll() {
        return adRepository.findAllByOrderBySlotAscCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    /** Lấy 2 quảng cáo đang active (LEFT + RIGHT) để hiển thị trang chủ */
    public Map<String, AdvertisementResponse> getActiveAds() {
        return adRepository.findByIsActiveTrue().stream()
                .collect(Collectors.toMap(
                        ad -> ad.getSlot().toUpperCase(),
                        this::toResponse,
                        (a, b) -> a  // nếu có nhiều hơn 1 active cùng slot, lấy cái đầu
                ));
    }

    /** Tạo hoặc cập nhật quảng cáo theo ID */
    @Transactional
    public AdvertisementResponse save(Long id, SaveAdvertisementRequest req) {
        Advertisement ad = id != null
                ? adRepository.findById(id).orElseGet(Advertisement::new)
                : new Advertisement();

        applyRequest(ad, req);
        return toResponse(adRepository.save(ad));
    }

    /** Bật / tắt hiển thị */
    @Transactional
    public AdvertisementResponse toggleActive(Long id) {
        Advertisement ad = adRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Advertisement not found: " + id));
        ad.setIsActive(!Boolean.TRUE.equals(ad.getIsActive()));
        return toResponse(adRepository.save(ad));
    }

    /** Xoá */
    @Transactional
    public void delete(Long id) {
        if (!adRepository.existsById(id)) throw new RuntimeException("Advertisement not found: " + id);
        adRepository.deleteById(id);
    }

    // ─── Stats / Báo cáo ─────────────────────────────────────────────────────

    public Map<String, Object> getStats() {
        List<Advertisement> all = adRepository.findAll();
        long total = all.size();
        long active = all.stream().filter(a -> Boolean.TRUE.equals(a.getIsActive())).count();
        long expired = all.stream().filter(a ->
                a.getContractEnd() != null && a.getContractEnd().isBefore(java.time.LocalDate.now())).count();
        java.math.BigDecimal totalValue = all.stream()
                .filter(a -> a.getContractValue() != null)
                .map(Advertisement::getContractValue)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        return Map.of(
                "total", total,
                "active", active,
                "inactive", total - active,
                "expired", expired,
                "totalContractValue", totalValue
        );
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private void applyRequest(Advertisement ad, SaveAdvertisementRequest req) {
        if (req.getSlot() != null) ad.setSlot(req.getSlot().toUpperCase());
        if (req.getSponsorName() != null) ad.setSponsorName(req.getSponsorName());
        if (req.getTitle() != null) ad.setTitle(req.getTitle());
        if (req.getSubtitle() != null) ad.setSubtitle(req.getSubtitle());
        if (req.getImageUrl() != null) ad.setImageUrl(req.getImageUrl());
        if (req.getLinkUrl() != null) ad.setLinkUrl(req.getLinkUrl());
        if (req.getCtaText() != null) ad.setCtaText(req.getCtaText());
        if (req.getCtaColor() != null) ad.setCtaColor(req.getCtaColor());
        if (req.getBgColor() != null) ad.setBgColor(req.getBgColor());
        if (req.getIsActive() != null) ad.setIsActive(req.getIsActive());
        if (req.getContractNumber() != null) ad.setContractNumber(req.getContractNumber());
        if (req.getContractValue() != null) ad.setContractValue(req.getContractValue());
        if (req.getContractStart() != null) ad.setContractStart(req.getContractStart());
        if (req.getContractEnd() != null) ad.setContractEnd(req.getContractEnd());
        if (req.getPaymentTerms() != null) ad.setPaymentTerms(req.getPaymentTerms());
        if (req.getContactPerson() != null) ad.setContactPerson(req.getContactPerson());
        if (req.getContactEmail() != null) ad.setContactEmail(req.getContactEmail());
        if (req.getContactPhone() != null) ad.setContactPhone(req.getContactPhone());
        if (req.getNotes() != null) ad.setNotes(req.getNotes());
    }

    private AdvertisementResponse toResponse(Advertisement ad) {
        AdvertisementResponse r = new AdvertisementResponse();
        r.setId(ad.getId());
        r.setSlot(ad.getSlot());
        r.setSponsorName(ad.getSponsorName());
        r.setTitle(ad.getTitle());
        r.setSubtitle(ad.getSubtitle());
        r.setImageUrl(ad.getImageUrl());
        r.setLinkUrl(ad.getLinkUrl());
        r.setCtaText(ad.getCtaText());
        r.setCtaColor(ad.getCtaColor());
        r.setBgColor(ad.getBgColor());
        r.setIsActive(ad.getIsActive());
        r.setContractNumber(ad.getContractNumber());
        r.setContractValue(ad.getContractValue());
        r.setContractStart(ad.getContractStart());
        r.setContractEnd(ad.getContractEnd());
        r.setPaymentTerms(ad.getPaymentTerms());
        r.setContactPerson(ad.getContactPerson());
        r.setContactEmail(ad.getContactEmail());
        r.setContactPhone(ad.getContactPhone());
        r.setNotes(ad.getNotes());
        r.setCreatedAt(ad.getCreatedAt());
        r.setUpdatedAt(ad.getUpdatedAt());
        return r;
    }
}
