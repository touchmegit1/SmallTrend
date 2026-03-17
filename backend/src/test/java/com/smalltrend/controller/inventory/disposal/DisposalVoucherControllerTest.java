package com.smalltrend.controller.inventory.disposal;

import com.smalltrend.controller.inventory.DisposalVoucherController;
import com.smalltrend.dto.inventory.disposal.DisposalVoucherRequest;
import com.smalltrend.dto.inventory.disposal.DisposalVoucherResponse;
import com.smalltrend.dto.inventory.disposal.ExpiredBatchResponse;
import com.smalltrend.service.inventory.DisposalVoucherService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DisposalVoucherControllerTest {

    @Mock
    private DisposalVoucherService disposalVoucherService;

    private DisposalVoucherController controller;

    @BeforeEach
    void setUp() {
        controller = new DisposalVoucherController(disposalVoucherService);
    }

    @Test
    void getAllDisposalVouchers_shouldReturnOk() {
        List<DisposalVoucherResponse> expected = List.of(new DisposalVoucherResponse());
        when(disposalVoucherService.getAllDisposalVouchers()).thenReturn(expected);

        ResponseEntity<List<DisposalVoucherResponse>> response = controller.getAllDisposalVouchers();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(disposalVoucherService).getAllDisposalVouchers();
    }

    @Test
    void getDisposalVoucherById_shouldReturnOk() {
        DisposalVoucherResponse expected = new DisposalVoucherResponse();
        when(disposalVoucherService.getDisposalVoucherById(1L)).thenReturn(expected);

        ResponseEntity<DisposalVoucherResponse> response = controller.getDisposalVoucherById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(disposalVoucherService).getDisposalVoucherById(1L);
    }

    @Test
    void getNextCode_shouldReturnOk() {
        when(disposalVoucherService.generateNextCode()).thenReturn("DV-001");

        ResponseEntity<Map<String, String>> response = controller.getNextCode();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("DV-001", response.getBody().get("code"));
        verify(disposalVoucherService).generateNextCode();
    }

    @Test
    void getExpiredBatches_shouldReturnOk() {
        List<ExpiredBatchResponse> expected = List.of(new ExpiredBatchResponse());
        when(disposalVoucherService.getExpiredBatches(null)).thenReturn(expected);

        ResponseEntity<List<ExpiredBatchResponse>> response = controller.getExpiredBatches(null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(disposalVoucherService).getExpiredBatches(null);
    }

    @Test
    void getExpiredBatches_withLocationId_shouldReturnOk() {
        List<ExpiredBatchResponse> expected = List.of(new ExpiredBatchResponse());
        when(disposalVoucherService.getExpiredBatches(1L)).thenReturn(expected);

        ResponseEntity<List<ExpiredBatchResponse>> response = controller.getExpiredBatches(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(disposalVoucherService).getExpiredBatches(1L);
    }

    @Test
    void saveDraft_shouldReturnOk() {
        DisposalVoucherRequest request = new DisposalVoucherRequest();
        DisposalVoucherResponse expected = new DisposalVoucherResponse();
        when(disposalVoucherService.saveDraft(request, 1L)).thenReturn(expected);

        ResponseEntity<DisposalVoucherResponse> response = controller.saveDraft(request, 1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(disposalVoucherService).saveDraft(request, 1L);
    }

    @Test
    void submitForApproval_shouldReturnOk() {
        DisposalVoucherResponse expected = new DisposalVoucherResponse();
        when(disposalVoucherService.submitForApproval(1L)).thenReturn(expected);

        ResponseEntity<DisposalVoucherResponse> response = controller.submitForApproval(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(disposalVoucherService).submitForApproval(1L);
    }

    @Test
    void approveVoucher_shouldReturnOk() {
        DisposalVoucherResponse expected = new DisposalVoucherResponse();
        when(disposalVoucherService.approveVoucher(1L, 2L)).thenReturn(expected);

        ResponseEntity<DisposalVoucherResponse> response = controller.approveVoucher(1L, 2L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(disposalVoucherService).approveVoucher(1L, 2L);
    }

    @Test
    void rejectVoucher_shouldReturnOk() {
        DisposalVoucherResponse expected = new DisposalVoucherResponse();
        when(disposalVoucherService.rejectVoucher(1L, "Lý do")).thenReturn(expected);

        ResponseEntity<DisposalVoucherResponse> response = controller.rejectVoucher(1L, "Lý do");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(disposalVoucherService).rejectVoucher(1L, "Lý do");
    }
}
