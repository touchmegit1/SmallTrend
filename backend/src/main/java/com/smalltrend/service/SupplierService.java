package com.smalltrend.service;

import com.smalltrend.dto.supplier.SupplierDTO;
import java.util.List;

public interface SupplierService {
    List<SupplierDTO> getAllSuppliers();

    SupplierDTO getSupplierById(Integer id);

    SupplierDTO createSupplier(SupplierDTO dto);

    SupplierDTO updateSupplier(Integer id, SupplierDTO dto);

    void deleteSupplier(Integer id);
}
