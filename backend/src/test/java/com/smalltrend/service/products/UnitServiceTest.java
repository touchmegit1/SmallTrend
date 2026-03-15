package com.smalltrend.service.products;

import com.smalltrend.dto.products.UnitRequest;
import com.smalltrend.dto.products.UnitResponse;
import com.smalltrend.entity.Unit;
import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.repository.UnitConversionRepository;
import com.smalltrend.repository.UnitRepository;
import com.smalltrend.service.UnitService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UnitServiceTest {

    @Mock
    private UnitRepository unitRepository;

    @Mock
    private ProductVariantRepository productVariantRepository;

    @Mock
    private UnitConversionRepository unitConversionRepository;

    @InjectMocks
    private UnitService unitService;

    private Unit testUnit;
    private UnitRequest testRequest;

    @BeforeEach
    void setUp() {
        testUnit = new Unit();
        testUnit.setId(1);
        testUnit.setCode("KG");
        testUnit.setName("Kilogram");
        testUnit.setDefaultSellPrice(BigDecimal.valueOf(100));

        testRequest = new UnitRequest();
        testRequest.setCode("KG");
        testRequest.setName("Kilogram");
    }

    @Test
    void getAllUnits_shouldReturnList() {
        when(unitRepository.findAll()).thenReturn(List.of(testUnit));
        List<UnitResponse> result = unitService.getAllUnits();
        assertEquals(1, result.size());
        assertEquals("KG", result.get(0).getCode());
    }

    @Test
    void getUnitById_Found_shouldReturnResponse() {
        when(unitRepository.findById(1)).thenReturn(Optional.of(testUnit));
        UnitResponse result = unitService.getUnitById(1);
        assertNotNull(result);
        assertEquals("Kilogram", result.getName());
    }

    @Test
    void getUnitById_NotFound_shouldThrow() {
        when(unitRepository.findById(99)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> unitService.getUnitById(99));
        assertEquals("Không tìm thấy đơn vị với ID: 99", ex.getMessage());
    }

    @Test
    void createUnit_Success() {
        when(unitRepository.findByCode("KG")).thenReturn(Optional.empty());
        when(unitRepository.save(any(Unit.class))).thenReturn(testUnit);
        
        UnitResponse result = unitService.createUnit(testRequest);
        assertNotNull(result);
        assertEquals("KG", result.getCode());
    }

    @Test
    void createUnit_Duplicate_shouldThrow() {
        when(unitRepository.findByCode("KG")).thenReturn(Optional.of(testUnit));
        RuntimeException ex = assertThrows(RuntimeException.class, () -> unitService.createUnit(testRequest));
        assertEquals("Mã đơn vị 'KG' đã tồn tại!", ex.getMessage());
    }

    @Test
    void updateUnit_Success() {
        UnitRequest updateReq = new UnitRequest();
        updateReq.setCode("G");
        updateReq.setName("Gram");
        
        when(unitRepository.findById(1)).thenReturn(Optional.of(testUnit));
        when(unitRepository.findByCode("G")).thenReturn(Optional.empty());
        
        Unit updatedUnit = new Unit();
        updatedUnit.setId(1);
        updatedUnit.setCode("G");
        updatedUnit.setName("Gram");
        
        when(unitRepository.save(testUnit)).thenReturn(updatedUnit);
        
        UnitResponse result = unitService.updateUnit(1, updateReq);
        assertEquals("G", result.getCode());
    }
    
    @Test
    void updateUnit_DuplicateCodeFromOtherUnit_shouldThrow() {
        UnitRequest updateReq = new UnitRequest();
        updateReq.setCode("G");
        
        Unit otherUnit = new Unit();
        otherUnit.setId(2);
        otherUnit.setCode("G");
        
        when(unitRepository.findById(1)).thenReturn(Optional.of(testUnit));
        when(unitRepository.findByCode("G")).thenReturn(Optional.of(otherUnit));
        
        RuntimeException ex = assertThrows(RuntimeException.class, () -> unitService.updateUnit(1, updateReq));
        assertEquals("Mã đơn vị 'G' đã tồn tại!", ex.getMessage());
    }

    @Test
    void updateUnit_SameCodeSameUnit_shouldUpdate() {
        UnitRequest updateReq = new UnitRequest();
        updateReq.setCode("KG");
        
        when(unitRepository.findById(1)).thenReturn(Optional.of(testUnit));
        when(unitRepository.findByCode("KG")).thenReturn(Optional.of(testUnit)); // same ID
        when(unitRepository.save(testUnit)).thenReturn(testUnit);
        
        UnitResponse result = unitService.updateUnit(1, updateReq);
        assertNotNull(result);
    }

    @Test
    void deleteUnit_Success() {
        when(unitRepository.findById(1)).thenReturn(Optional.of(testUnit));
        when(productVariantRepository.countByUnitId(1)).thenReturn(0L);
        when(unitConversionRepository.existsByToUnitId(1)).thenReturn(false);
        
        unitService.deleteUnit(1);
        verify(unitRepository).delete(testUnit);
    }

    @Test
    void deleteUnit_InUseByVariant_shouldThrow() {
        when(unitRepository.findById(1)).thenReturn(Optional.of(testUnit));
        when(productVariantRepository.countByUnitId(1)).thenReturn(5L);
        
        RuntimeException ex = assertThrows(RuntimeException.class, () -> unitService.deleteUnit(1));
        assertEquals("Không thể xóa đơn vị này vì đang có 5 sản phẩm/biến thể sử dụng!", ex.getMessage());
    }

    @Test
    void deleteUnit_InUseByConversion_shouldThrow() {
        when(unitRepository.findById(1)).thenReturn(Optional.of(testUnit));
        when(productVariantRepository.countByUnitId(1)).thenReturn(0L);
        when(unitConversionRepository.existsByToUnitId(1)).thenReturn(true);
        
        RuntimeException ex = assertThrows(RuntimeException.class, () -> unitService.deleteUnit(1));
        assertEquals("Không thể xóa đơn vị này vì đang được dùng trong quy đổi đơn vị!", ex.getMessage());
    }
}
