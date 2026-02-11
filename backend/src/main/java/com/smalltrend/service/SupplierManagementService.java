package com.smalltrend.service;

import com.smalltrend.entity.Supplier;
import com.smalltrend.entity.SupplierContract;
import com.smalltrend.entity.SupplierProfile;
import com.smalltrend.repository.SupplierRepository;
import com.smalltrend.repository.SupplierContractRepository;
import com.smalltrend.repository.SupplierProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SupplierManagementService {

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private SupplierProfileRepository supplierProfileRepository;

    @Autowired
    private SupplierContractRepository supplierContractRepository;

    // Supplier basic operations
    public List<Supplier> findAllSuppliers() {
        return supplierRepository.findAll();
    }

    public Optional<Supplier> findSupplierById(Integer id) {
        return supplierRepository.findById(id);
    }

    public Supplier saveSupplier(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    public void deleteSupplier(Integer id) {
        // Check if supplier has active contracts
        List<SupplierContract> activeContracts = supplierContractRepository.findBySupplierId(id);
        boolean hasActiveContracts = activeContracts.stream()
                .anyMatch(contract -> contract.getStatus().name().equals("ACTIVE"));

        if (hasActiveContracts) {
            throw new RuntimeException("Cannot delete supplier with active contracts");
        }

        // Delete profile first if exists
        SupplierProfile profile = supplierProfileRepository.findBySupplierId(Long.valueOf(id));
        if (profile != null) {
            supplierProfileRepository.delete(profile);
        }

        supplierRepository.deleteById(id);
    }

    // Enhanced supplier operations with profile
    public Supplier createSupplierWithProfile(Supplier supplier, SupplierProfile profile) {
        Supplier savedSupplier = supplierRepository.save(supplier);

        if (profile != null) {
            profile.setSupplier(savedSupplier);
            supplierProfileRepository.save(profile);
        }

        return savedSupplier;
    }

    public SupplierProfile getSupplierProfile(Integer supplierId) {
        return supplierProfileRepository.findBySupplierId(Long.valueOf(supplierId));
    }

    public SupplierProfile updateSupplierProfile(Integer supplierId, SupplierProfile profile) {
        SupplierProfile existingProfile = supplierProfileRepository.findBySupplierId(Long.valueOf(supplierId));

        if (existingProfile != null) {
            // Update existing profile
            existingProfile.setContactName(profile.getContactName());
            existingProfile.setContactEmail(profile.getContactEmail());
            existingProfile.setContactPhone(profile.getContactPhone());
            existingProfile.setAddressLine1(profile.getAddressLine1());
            existingProfile.setAddressLine2(profile.getAddressLine2());
            existingProfile.setCity(profile.getCity());
            existingProfile.setState(profile.getState());
            existingProfile.setPostalCode(profile.getPostalCode());
            existingProfile.setCountry(profile.getCountry());
            existingProfile.setTaxId(profile.getTaxId());
            existingProfile.setPaymentTerms(profile.getPaymentTerms());
            existingProfile.setLeadTimeDays(profile.getLeadTimeDays());
            existingProfile.setRating(profile.getRating());
            existingProfile.setActive(profile.getActive());

            return supplierProfileRepository.save(existingProfile);
        } else {
            // Create new profile
            Optional<Supplier> supplier = supplierRepository.findById(supplierId);
            if (supplier.isPresent()) {
                profile.setSupplier(supplier.get());
                return supplierProfileRepository.save(profile);
            } else {
                throw new RuntimeException("Supplier not found with id: " + supplierId);
            }
        }
    }

    // Contract operations
    public List<SupplierContract> getSupplierContracts(Integer supplierId) {
        return supplierContractRepository.findBySupplierId(supplierId);
    }

    // Supplier analytics
    public long getTotalSuppliersCount() {
        return supplierRepository.count();
    }

    public long getActiveSuppliersCount() {
        return supplierProfileRepository.findAll().stream()
                .filter(profile -> profile.getActive() != null && profile.getActive())
                .count();
    }
}
