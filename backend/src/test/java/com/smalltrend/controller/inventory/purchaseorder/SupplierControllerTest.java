package com.smalltrend.controller.inventory.purchaseorder;

import com.smalltrend.controller.inventory.purchase.SupplierController;
import com.smalltrend.dto.supplier.SupplierDTO;
import com.smalltrend.service.products.SupplierService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SupplierControllerTest {

    @Mock
    private SupplierService supplierService;

    private SupplierController controller;

    @BeforeEach
    void setUp() {
        controller = new SupplierController(supplierService);
    }

    @Test
    void getAllSuppliers_shouldReturnOk() {
        List<SupplierDTO> expected = List.of(new SupplierDTO());
        when(supplierService.getAllSuppliers()).thenReturn(expected);

        ResponseEntity<List<SupplierDTO>> response = controller.getAllSuppliers();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(supplierService).getAllSuppliers();
    }

    @Test
    void getSupplierById_shouldReturnOk() {
        SupplierDTO expected = new SupplierDTO();
        when(supplierService.getSupplierById(1)).thenReturn(expected);

        ResponseEntity<SupplierDTO> response = controller.getSupplierById(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(supplierService).getSupplierById(1);
    }

    @Test
    void createSupplier_shouldReturnOk() {
        SupplierDTO request = new SupplierDTO();
        SupplierDTO expected = new SupplierDTO();
        when(supplierService.createSupplier(request)).thenReturn(expected);

        ResponseEntity<SupplierDTO> response = controller.createSupplier(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(supplierService).createSupplier(request);
    }

    @Test
    void updateSupplier_shouldReturnOk() {
        SupplierDTO request = new SupplierDTO();
        SupplierDTO expected = new SupplierDTO();
        when(supplierService.updateSupplier(1, request)).thenReturn(expected);

        ResponseEntity<SupplierDTO> response = controller.updateSupplier(1, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(supplierService).updateSupplier(1, request);
    }

    @Test
    void deleteSupplier_shouldReturnNoContent() {
        ResponseEntity<Void> response = controller.deleteSupplier(1);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(supplierService).deleteSupplier(1);
    }
}
