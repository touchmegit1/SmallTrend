package com.smalltrend.service.impl;

import com.smalltrend.dto.supplier.SupplierDTO;
import com.smalltrend.entity.Supplier;
import com.smalltrend.repository.SupplierRepository;
import com.smalltrend.service.SupplierService;
import com.smalltrend.validation.supplier.SupplierValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierValidator supplierValidator;

    @Override
    public List<SupplierDTO> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public SupplierDTO getSupplierById(Integer id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhà cung cấp: " + id));
        return mapToDTO(supplier);
    }

    @Override
    public SupplierDTO createSupplier(SupplierDTO dto) {
        supplierValidator.validateNameUniqueForCreate(dto.getName());
        Supplier supplier = new Supplier();
        mapToEntity(dto, supplier);
        supplier = supplierRepository.save(supplier);
        return mapToDTO(supplier);
    }

    @Override
    public SupplierDTO updateSupplier(Integer id, SupplierDTO dto) {
        supplierValidator.validateNameUniqueForUpdate(dto.getName(), id);
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhà cung cấp: " + id));
        mapToEntity(dto, supplier);
        supplier = supplierRepository.save(supplier);
        return mapToDTO(supplier);
    }

    @Override
    public void deleteSupplier(Integer id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhà cung cấp: " + id));
        supplierRepository.delete(supplier);
    }

    private SupplierDTO mapToDTO(Supplier s) {
        return SupplierDTO.builder()
                .id(s.getId())
                .name(s.getName())
                // Both contact_person and contact in frontend rely on contactPerson in DB
                .contactPerson(s.getContactPerson())
                .contact(s.getContactPerson())
                .phone(s.getPhone())
                .email(s.getEmail())
                .address(s.getAddress())
                .status(s.getActive() != null && s.getActive() ? "active" : "inactive")
                .build();
    }

    private void mapToEntity(SupplierDTO dto, Supplier s) {
        s.setName(dto.getName());
        s.setContactPerson(dto.getContact() != null && !dto.getContact().isBlank()
                ? dto.getContact()
                : dto.getContactPerson());
        s.setPhone(dto.getPhone());
        s.setEmail(dto.getEmail());
        s.setAddress(dto.getAddress());
        s.setActive("active".equalsIgnoreCase(dto.getStatus()));
    }
}
