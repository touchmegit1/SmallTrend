package com.smalltrend.service;

import com.smalltrend.dto.products.UnitConversionRequest;
import com.smalltrend.dto.products.UnitConversionResponse;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.Unit;
import com.smalltrend.entity.UnitConversion;
import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.repository.UnitConversionRepository;
import com.smalltrend.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UnitConversionService {

    private final UnitConversionRepository unitConversionRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UnitRepository unitRepository;

    public List<UnitConversionResponse> getConversionsByVariantId(Integer variantId) {
        return unitConversionRepository.findByVariantId(variantId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UnitConversionResponse addConversion(Integer variantId, UnitConversionRequest request) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biến thể với ID: " + variantId));

        Unit toUnit = unitRepository.findById(request.getToUnitId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn vị với ID: " + request.getToUnitId()));

        if (unitConversionRepository.existsByVariantIdAndToUnitId(variantId, request.getToUnitId())) {
            throw new RuntimeException("Quy đổi sang đơn vị '" + toUnit.getName() + "' đã tồn tại cho biến thể này!");
        }

        UnitConversion conversion = UnitConversion.builder()
                .variant(variant)
                .toUnit(toUnit)
                .conversionFactor(request.getConversionFactor())
                .sellPrice(request.getSellPrice())
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        UnitConversion saved = unitConversionRepository.save(conversion);
        return mapToResponse(saved);
    }

    public UnitConversionResponse updateConversion(Integer conversionId, UnitConversionRequest request) {
        UnitConversion conversion = unitConversionRepository.findById(conversionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy quy đổi với ID: " + conversionId));

        Unit toUnit = unitRepository.findById(request.getToUnitId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn vị với ID: " + request.getToUnitId()));

        // Check duplicate (excluding current record)
        if (unitConversionRepository.existsByVariantIdAndToUnitIdAndIdNot(
                conversion.getVariant().getId(), request.getToUnitId(), conversionId)) {
            throw new RuntimeException("Quy đổi sang đơn vị '" + toUnit.getName() + "' đã tồn tại cho biến thể này!");
        }

        conversion.setToUnit(toUnit);
        conversion.setConversionFactor(request.getConversionFactor());
        conversion.setSellPrice(request.getSellPrice());
        conversion.setDescription(request.getDescription());
        if (request.getIsActive() != null) {
            conversion.setActive(request.getIsActive());
        }

        UnitConversion saved = unitConversionRepository.save(conversion);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteConversion(Integer conversionId) {
        if (!unitConversionRepository.existsById(conversionId)) {
            throw new RuntimeException("Không tìm thấy quy đổi với ID: " + conversionId);
        }
        unitConversionRepository.deleteById(conversionId);
    }

    public UnitConversionResponse mapToResponse(UnitConversion entity) {
        UnitConversionResponse response = new UnitConversionResponse();
        response.setId(entity.getId());
        response.setVariantId(entity.getVariant().getId());
        response.setToUnitId(entity.getToUnit().getId());
        response.setToUnitName(entity.getToUnit().getName());
        response.setToUnitCode(entity.getToUnit().getCode());
        response.setConversionFactor(entity.getConversionFactor());
        response.setSellPrice(entity.getSellPrice());
        response.setDescription(entity.getDescription());
        response.setIsActive(entity.isActive());
        return response;
    }
}
