package com.smalltrend.controller.inventory.inventorycount;

import com.smalltrend.controller.inventory.InventoryCountController;
import com.smalltrend.dto.inventory.inventorycount.InventoryCountItemRequest;
import com.smalltrend.dto.inventory.inventorycount.InventoryCountItemResponse;
import com.smalltrend.dto.inventory.inventorycount.InventoryCountRequest;
import com.smalltrend.dto.inventory.inventorycount.InventoryCountResponse;
import com.smalltrend.service.inventory.InventoryCountService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryCountControllerTest {

    @Mock
    private InventoryCountService countService;

    private InventoryCountController controller;

    @BeforeEach
    void setUp() {
        controller = new InventoryCountController(countService);
    }

    // ═══════════════════════════════════════════════════════════
    //  GET - List all counts
    // ═══════════════════════════════════════════════════════════

    @Test
    void getAllCounts_shouldReturnOk() {
        List<InventoryCountResponse> expected = List.of(
                InventoryCountResponse.builder()
                        .id(1)
                        .code("IC-2026-0001")
                        .status("DRAFT")
                        .locationId(1)
                        .locationName("Kho A1")
                        .build(),
                InventoryCountResponse.builder()
                        .id(2)
                        .code("IC-2026-0002")
                        .status("CONFIRMED")
                        .locationId(2)
                        .locationName("Kho B1")
                        .build()
        );
        when(countService.getAllCounts()).thenReturn(expected);

        ResponseEntity<List<InventoryCountResponse>> response = controller.getAllCounts();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        assertEquals(2, response.getBody().size());
        verify(countService).getAllCounts();
    }

    @Test
    void getAllCounts_shouldReturnEmptyList_whenNoCounts() {
        when(countService.getAllCounts()).thenReturn(List.of());

        ResponseEntity<List<InventoryCountResponse>> response = controller.getAllCounts();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(0, response.getBody().size());
    }

    // ═══════════════════════════════════════════════════════════
    //  GET - Get by ID
    // ═══════════════════════════════════════════════════════════

    @Test
    void getCountById_shouldReturnOk_whenValid() {
        InventoryCountResponse expected = InventoryCountResponse.builder()
                .id(1)
                .code("IC-2026-0001")
                .status("DRAFT")
                .locationId(1)
                .locationName("Kho A1")
                .notes("Kiểm kê tháng 3")
                .totalShortageValue(new BigDecimal("100000"))
                .totalOverageValue(new BigDecimal("50000"))
                .totalDifferenceValue(new BigDecimal("-50000"))
                .items(List.of(
                        InventoryCountItemResponse.builder()
                                .id(1)
                                .productId(1)
                                .systemQuantity(100)
                                .actualQuantity(95)
                                .differenceQuantity(-5)
                                .differenceValue(new BigDecimal("-100000"))
                                .reason("Hư hỏng")
                                .build()
                ))
                .build();
        when(countService.getCountById(1)).thenReturn(expected);

        ResponseEntity<InventoryCountResponse> response = controller.getCountById(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        assertNotNull(response.getBody().getItems());
        assertEquals(1, response.getBody().getItems().size());
        verify(countService).getCountById(1);
    }

    // ═══════════════════════════════════════════════════════════
    //  GET - Generate next code
    // ═══════════════════════════════════════════════════════════

    @Test
    void getNextCode_shouldReturnOk() {
        when(countService.generateCode()).thenReturn("IC-2026-0003");

        ResponseEntity<Map<String, String>> response = controller.getNextCode();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("IC-2026-0003", response.getBody().get("code"));
        verify(countService).generateCode();
    }

    // ═══════════════════════════════════════════════════════════
    //  POST - Save as Draft
    // ═══════════════════════════════════════════════════════════

    @Test
    void saveDraft_shouldReturnOk() {
        InventoryCountRequest request = InventoryCountRequest.builder()
                .locationId(1)
                .notes("Kiểm kê tháng 3")
                .items(List.of(
                        InventoryCountItemRequest.builder()
                                .productId(1)
                                .systemQuantity(100)
                                .actualQuantity(95)
                                .differenceQuantity(-5)
                                .differenceValue(new BigDecimal("-100000"))
                                .reason("Hư hỏng")
                                .build()
                ))
                .build();

        InventoryCountResponse expected = InventoryCountResponse.builder()
                .id(1)
                .code("IC-2026-0001")
                .status("DRAFT")
                .locationId(1)
                .locationName("Kho A1")
                .notes("Kiểm kê tháng 3")
                .build();
        when(countService.saveDraft(request)).thenReturn(expected);

        ResponseEntity<InventoryCountResponse> response = controller.saveDraft(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        assertEquals("DRAFT", response.getBody().getStatus());
        verify(countService).saveDraft(request);
    }

    // ═══════════════════════════════════════════════════════════
    //  PUT - Update existing count
    // ═══════════════════════════════════════════════════════════

    @Test
    void updateCount_shouldReturnOk() {
        InventoryCountRequest request = InventoryCountRequest.builder()
                .locationId(1)
                .notes("Cập nhật kiểm kê")
                .items(List.of(
                        InventoryCountItemRequest.builder()
                                .productId(1)
                                .systemQuantity(100)
                                .actualQuantity(98)
                                .differenceQuantity(-2)
                                .differenceValue(new BigDecimal("-40000"))
                                .build()
                ))
                .build();

        InventoryCountResponse expected = InventoryCountResponse.builder()
                .id(1)
                .code("IC-2026-0001")
                .status("DRAFT")
                .locationId(1)
                .notes("Cập nhật kiểm kê")
                .build();
        when(countService.updateCount(1, request)).thenReturn(expected);

        ResponseEntity<InventoryCountResponse> response = controller.updateCount(1, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(countService).updateCount(1, request);
    }

    // ═══════════════════════════════════════════════════════════
    //  POST - Create and Confirm
    // ═══════════════════════════════════════════════════════════

    @Test
    void createAndConfirm_shouldReturnOk() {
        InventoryCountRequest request = InventoryCountRequest.builder()
                .locationId(1)
                .notes("Xác nhận kiểm kê")
                .items(List.of(
                        InventoryCountItemRequest.builder()
                                .productId(1)
                                .systemQuantity(100)
                                .actualQuantity(100)
                                .differenceQuantity(0)
                                .differenceValue(BigDecimal.ZERO)
                                .build()
                ))
                .build();

        InventoryCountResponse expected = InventoryCountResponse.builder()
                .id(3)
                .code("IC-2026-0003")
                .status("CONFIRMED")
                .locationId(1)
                .locationName("Kho A1")
                .confirmedBy(1)
                .confirmedAt(LocalDateTime.of(2026, 3, 11, 10, 0))
                .build();
        when(countService.createAndConfirm(request)).thenReturn(expected);

        ResponseEntity<InventoryCountResponse> response = controller.createAndConfirm(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        assertEquals("CONFIRMED", response.getBody().getStatus());
        verify(countService).createAndConfirm(request);
    }

    // ═══════════════════════════════════════════════════════════
    //  PUT - Confirm existing count
    // ═══════════════════════════════════════════════════════════

    @Test
    void confirmExisting_shouldReturnOk() {
        InventoryCountRequest request = InventoryCountRequest.builder()
                .locationId(1)
                .notes("Xác nhận từ bản nháp")
                .items(List.of(
                        InventoryCountItemRequest.builder()
                                .productId(2)
                                .systemQuantity(50)
                                .actualQuantity(48)
                                .differenceQuantity(-2)
                                .differenceValue(new BigDecimal("-60000"))
                                .build()
                ))
                .build();

        InventoryCountResponse expected = InventoryCountResponse.builder()
                .id(1)
                .code("IC-2026-0001")
                .status("CONFIRMED")
                .confirmedBy(1)
                .confirmedAt(LocalDateTime.of(2026, 3, 11, 11, 0))
                .build();
        when(countService.confirmCount(1, request)).thenReturn(expected);

        ResponseEntity<InventoryCountResponse> response = controller.confirmExisting(1, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        assertEquals("CONFIRMED", response.getBody().getStatus());
        verify(countService).confirmCount(1, request);
    }

    // ═══════════════════════════════════════════════════════════
    //  PUT - Cancel count
    // ═══════════════════════════════════════════════════════════

    @Test
    void cancelCount_shouldReturnOk() {
        InventoryCountResponse expected = InventoryCountResponse.builder()
                .id(1)
                .code("IC-2026-0001")
                .status("CANCELLED")
                .build();
        when(countService.cancelCount(1)).thenReturn(expected);

        ResponseEntity<InventoryCountResponse> response = controller.cancelCount(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        assertEquals("CANCELLED", response.getBody().getStatus());
        verify(countService).cancelCount(1);
    }

    // ═══════════════════════════════════════════════════════════
    //  PUT - Submit for approval (existing)
    // ═══════════════════════════════════════════════════════════

    @Test
    void submitForApproval_shouldReturnOk() {
        InventoryCountRequest request = InventoryCountRequest.builder()
                .locationId(2)
                .notes("Gửi duyệt")
                .items(List.of(
                        InventoryCountItemRequest.builder()
                                .productId(1)
                                .systemQuantity(200)
                                .actualQuantity(195)
                                .differenceQuantity(-5)
                                .differenceValue(new BigDecimal("-250000"))
                                .build()
                ))
                .build();

        InventoryCountResponse expected = InventoryCountResponse.builder()
                .id(1)
                .code("IC-2026-0001")
                .status("PENDING")
                .locationId(2)
                .locationName("Kho B1")
                .build();
        when(countService.submitForApproval(1, request)).thenReturn(expected);

        ResponseEntity<InventoryCountResponse> response = controller.submitForApproval(1, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        assertEquals("PENDING", response.getBody().getStatus());
        verify(countService).submitForApproval(1, request);
    }

    // ═══════════════════════════════════════════════════════════
    //  POST - Create and submit for approval
    // ═══════════════════════════════════════════════════════════

    @Test
    void createAndSubmitForApproval_shouldReturnOk() {
        InventoryCountRequest request = InventoryCountRequest.builder()
                .locationId(1)
                .notes("Tạo mới và gửi duyệt")
                .items(List.of(
                        InventoryCountItemRequest.builder()
                                .productId(3)
                                .systemQuantity(300)
                                .actualQuantity(290)
                                .differenceQuantity(-10)
                                .differenceValue(new BigDecimal("-500000"))
                                .build()
                ))
                .build();

        InventoryCountResponse expected = InventoryCountResponse.builder()
                .id(5)
                .code("IC-2026-0005")
                .status("PENDING")
                .locationId(1)
                .locationName("Kho A1")
                .build();
        when(countService.createAndSubmitForApproval(request)).thenReturn(expected);

        ResponseEntity<InventoryCountResponse> response = controller.createAndSubmitForApproval(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        assertEquals("PENDING", response.getBody().getStatus());
        verify(countService).createAndSubmitForApproval(request);
    }

    // ═══════════════════════════════════════════════════════════
    //  PUT - Approve count
    // ═══════════════════════════════════════════════════════════

    @Test
    void approveCount_shouldReturnOk() {
        InventoryCountResponse expected = InventoryCountResponse.builder()
                .id(1)
                .code("IC-2026-0001")
                .status("CONFIRMED")
                .confirmedBy(1)
                .confirmedAt(LocalDateTime.of(2026, 3, 11, 12, 0))
                .rejectionReason(null)
                .build();
        when(countService.approveCount(1)).thenReturn(expected);

        ResponseEntity<InventoryCountResponse> response = controller.approveCount(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        assertEquals("CONFIRMED", response.getBody().getStatus());
        assertNull(response.getBody().getRejectionReason());
        verify(countService).approveCount(1);
    }

    // ═══════════════════════════════════════════════════════════
    //  PUT - Reject count
    // ═══════════════════════════════════════════════════════════

    @Test
    void rejectCount_shouldReturnOk() {
        InventoryCountRequest request = InventoryCountRequest.builder()
                .rejectionReason("Số liệu chưa chính xác")
                .build();

        InventoryCountResponse expected = InventoryCountResponse.builder()
                .id(1)
                .code("IC-2026-0001")
                .status("REJECTED")
                .rejectionReason("Số liệu chưa chính xác")
                .build();
        when(countService.rejectCount(1, "Số liệu chưa chính xác")).thenReturn(expected);

        ResponseEntity<InventoryCountResponse> response = controller.rejectCount(1, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        assertEquals("REJECTED", response.getBody().getStatus());
        assertEquals("Số liệu chưa chính xác", response.getBody().getRejectionReason());
        verify(countService).rejectCount(1, "Số liệu chưa chính xác");
    }

    // ═══════════════════════════════════════════════════════════
    //  DELETE - Delete count
    // ═══════════════════════════════════════════════════════════

    @Test
    void deleteCount_shouldReturnNoContent() {
        ResponseEntity<Void> response = controller.deleteCount(1);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertNull(response.getBody());
        verify(countService).deleteCount(1);
    }
}
