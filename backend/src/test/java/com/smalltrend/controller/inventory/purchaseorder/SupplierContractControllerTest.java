package com.smalltrend.controller.inventory.purchaseorder;

import com.smalltrend.controller.inventory.purchase.SupplierContractController;
import com.smalltrend.entity.SupplierContract;
import com.smalltrend.entity.enums.ContractStatus;
import com.smalltrend.service.SupplierContractService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SupplierContractControllerTest {

    @Mock
    private SupplierContractService contractService;

    private SupplierContractController controller;

    @BeforeEach
    void setUp() {
        controller = new SupplierContractController(contractService);
    }

    @Test
    void getAllContracts_shouldReturnOk() {
        List<SupplierContract> expected = List.of(new SupplierContract());
        when(contractService.findAll()).thenReturn(expected);

        ResponseEntity<List<SupplierContract>> response = controller.getAllContracts();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(contractService).findAll();
    }

    @Test
    void getActiveContracts_shouldReturnOk() {
        List<SupplierContract> expected = List.of(new SupplierContract());
        when(contractService.findActiveContracts()).thenReturn(expected);

        ResponseEntity<List<SupplierContract>> response = controller.getActiveContracts();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(contractService).findActiveContracts();
    }

    @Test
    void getContractById_shouldReturnOk_whenFound() {
        SupplierContract expected = new SupplierContract();
        when(contractService.findById(1L)).thenReturn(Optional.of(expected));

        ResponseEntity<SupplierContract> response = controller.getContractById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(contractService).findById(1L);
    }

    @Test
    void getContractById_shouldReturnNotFound_whenNotFound() {
        when(contractService.findById(99L)).thenReturn(Optional.empty());

        ResponseEntity<SupplierContract> response = controller.getContractById(99L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNull(response.getBody());
        verify(contractService).findById(99L);
    }

    @Test
    void getContractsBySupplier_shouldReturnOk() {
        List<SupplierContract> expected = List.of(new SupplierContract());
        when(contractService.findBySupplier(1L)).thenReturn(expected);

        ResponseEntity<List<SupplierContract>> response = controller.getContractsBySupplier(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(contractService).findBySupplier(1L);
    }

    @Test
    void getContractsByStatus_shouldReturnOk() {
        List<SupplierContract> expected = List.of(new SupplierContract());
        when(contractService.findByStatus(ContractStatus.ACTIVE)).thenReturn(expected);

        ResponseEntity<List<SupplierContract>> response = controller.getContractsByStatus(ContractStatus.ACTIVE);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(contractService).findByStatus(ContractStatus.ACTIVE);
    }

    @Test
    void createContract_shouldReturnOk() {
        SupplierContract request = new SupplierContract();
        SupplierContract expected = new SupplierContract();
        when(contractService.save(request)).thenReturn(expected);

        ResponseEntity<SupplierContract> response = controller.createContract(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(contractService).save(request);
    }

    @Test
    void updateContractStatus_shouldReturnOk() {
        SupplierContract expected = new SupplierContract();
        when(contractService.updateStatus(1L, ContractStatus.ACTIVE)).thenReturn(expected);

        ResponseEntity<SupplierContract> response = controller.updateContractStatus(1L, ContractStatus.ACTIVE);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(contractService).updateStatus(1L, ContractStatus.ACTIVE);
    }

    @Test
    void deleteContract_shouldReturnNoContent() {
        ResponseEntity<Void> response = controller.deleteContract(1L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(contractService).delete(1L);
    }
}
