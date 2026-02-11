package com.smalltrend.service;

import com.smalltrend.entity.SupplierContract;
import com.smalltrend.entity.enums.ContractStatus;
import com.smalltrend.repository.SupplierContractRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class SupplierContractService {

    @Autowired
    private SupplierContractRepository contractRepository;

    public List<SupplierContract> findAll() {
        return contractRepository.findAll();
    }

    public Optional<SupplierContract> findById(Long id) {
        return contractRepository.findById(id);
    }

    public List<SupplierContract> findBySupplierId(Integer supplierId) {
        return contractRepository.findBySupplierId(supplierId);
    }

    public List<SupplierContract> findByStatus(ContractStatus status) {
        return contractRepository.findByStatus(status);
    }

    public List<SupplierContract> findActiveContracts() {
        return contractRepository.findActiveContracts(LocalDate.now());
    }

    public SupplierContract save(SupplierContract contract) {
        if (contract.getContractNumber() == null || contract.getContractNumber().isEmpty()) {
            contract.setContractNumber(generateContractNumber());
        }
        return contractRepository.save(contract);
    }

    public SupplierContract updateStatus(Long id, ContractStatus newStatus) {
        Optional<SupplierContract> contractOpt = contractRepository.findById(id);
        if (contractOpt.isPresent()) {
            SupplierContract contract = contractOpt.get();
            contract.setStatus(newStatus);

            if (newStatus == ContractStatus.ACTIVE && contract.getSignedDate() == null) {
                contract.setSignedDate(LocalDate.now());
            }

            return contractRepository.save(contract);
        }
        throw new RuntimeException("Contract not found with id: " + id);
    }

    public void delete(Long id) {
        contractRepository.deleteById(id);
    }

    public void expireOldContracts() {
        List<SupplierContract> expiredContracts = contractRepository
                .findExpiredContracts(ContractStatus.ACTIVE, LocalDate.now());

        for (SupplierContract contract : expiredContracts) {
            contract.setStatus(ContractStatus.EXPIRED);
            contractRepository.save(contract);
        }
    }

    private String generateContractNumber() {
        String prefix = "CTR-" + LocalDate.now().getYear() + "-";
        String suffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return prefix + suffix;
    }
}
