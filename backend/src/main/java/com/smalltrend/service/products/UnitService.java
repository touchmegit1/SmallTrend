package com.smalltrend.service.products;

import com.smalltrend.dto.products.UnitRequest;
import com.smalltrend.dto.products.UnitResponse;
import com.smalltrend.entity.Unit;
import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.repository.UnitConversionRepository;
import com.smalltrend.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UnitService {

    private final UnitRepository unitRepository;
    private final ProductVariantRepository productVariantRepository;
    private final UnitConversionRepository unitConversionRepository;

    public List<UnitResponse> getAllUnits() {
        return unitRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public UnitResponse getUnitById(Integer id) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn vị với ID: " + id));
        return mapToResponse(unit);
    }

    @Transactional
    public UnitResponse createUnit(UnitRequest request) {
        Optional<Unit> existing = unitRepository.findByCode(request.getCode());
        if (existing.isPresent()) {
            throw new RuntimeException("Mã đơn vị '" + request.getCode() + "' đã tồn tại!");
        }

        Unit unit = Unit.builder()
                .code(request.getCode())
                .name(request.getName())
                .materialType(request.getMaterialType())
                .symbol(request.getSymbol())
                .defaultSellPrice(request.getDefaultSellPrice())
                .defaultCostPrice(request.getDefaultCostPrice())
                .build();

        Unit savedUnit = unitRepository.save(unit);
        return mapToResponse(savedUnit);
    }

    @Transactional
    public UnitResponse updateUnit(Integer id, UnitRequest request) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn vị với ID: " + id));

        Optional<Unit> existingByCode = unitRepository.findByCode(request.getCode());
        if (existingByCode.isPresent() && !existingByCode.get().getId().equals(id)) {
            throw new RuntimeException("Mã đơn vị '" + request.getCode() + "' đã tồn tại!");
        }

        unit.setCode(request.getCode());
        unit.setName(request.getName());
        unit.setMaterialType(request.getMaterialType());
        unit.setSymbol(request.getSymbol());
        unit.setDefaultSellPrice(request.getDefaultSellPrice());
        unit.setDefaultCostPrice(request.getDefaultCostPrice());

        Unit savedUnit = unitRepository.save(unit);
        return mapToResponse(savedUnit);
    }

    @Transactional
    public void deleteUnit(Integer id) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn vị với ID: " + id));

        long variantsUsingUnit = productVariantRepository.countByUnitId(id);
        if (variantsUsingUnit > 0) {
            throw new RuntimeException(
                    "Không thể xóa đơn vị này vì đang có " + variantsUsingUnit + " sản phẩm/biến thể sử dụng!");
        }

        if (unitConversionRepository.existsByToUnitId(id)) {
            throw new RuntimeException("Không thể xóa đơn vị này vì đang được dùng trong quy đổi đơn vị!");
        }

        unitRepository.delete(unit);
    }

    public UnitResponse mapToResponse(Unit entity) {
        UnitResponse response = new UnitResponse();
        response.setId(entity.getId());
        response.setCode(entity.getCode());
        response.setName(entity.getName());
        response.setMaterialType(entity.getMaterialType());
        response.setSymbol(entity.getSymbol());
        response.setDefaultSellPrice(entity.getDefaultSellPrice());
        response.setDefaultCostPrice(entity.getDefaultCostPrice());
        return response;
    }
}
