package com.smalltrend.validation.supplier;

import com.smalltrend.entity.Supplier;
import com.smalltrend.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SupplierValidator {

    private final SupplierRepository supplierRepository;

    public Supplier requireExistingSupplier(Integer id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp"));
    }

    public void validateNameUniqueForCreate(String name) {
        if (name != null && !name.trim().isEmpty() && supplierRepository.existsByName(name.trim())) {
            throw new RuntimeException("Tên nhà cung cấp đã tồn tại");
        }
    }

    public void validateNameUniqueForUpdate(String name, Integer currentId) {
        if (name != null && !name.trim().isEmpty() && supplierRepository.existsByNameAndIdNot(name.trim(), currentId)) {
            throw new RuntimeException("Tên nhà cung cấp đã tồn tại");
        }
    }
}
