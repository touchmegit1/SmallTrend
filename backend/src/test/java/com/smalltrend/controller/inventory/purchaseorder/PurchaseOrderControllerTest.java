package com.smalltrend.controller.inventory.purchaseorder;

import com.smalltrend.dto.common.MessageResponse;
import com.smalltrend.dto.inventory.purchase.*;
import com.smalltrend.dto.inventory.dashboard.*;
import com.smalltrend.controller.inventory.purchase.PurchaseOrderController;
import com.smalltrend.service.inventory.purchase.PurchaseOrderService;
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
class PurchaseOrderControllerTest {

    @Mock
    private PurchaseOrderService purchaseOrderService;

    private PurchaseOrderController controller;

    @BeforeEach
    void setUp() {
        controller = new PurchaseOrderController(purchaseOrderService);
    }

    @Test
    void getAllOrders_shouldReturnOk() {
        List<PurchaseOrderResponse> expected = List.of(new PurchaseOrderResponse());
        when(purchaseOrderService.getAllOrders()).thenReturn(expected);

        ResponseEntity<List<PurchaseOrderResponse>> response = controller.getAllOrders();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(purchaseOrderService).getAllOrders();
    }

    @Test
    void getOrderById_shouldReturnOk() {
        PurchaseOrderResponse expected = new PurchaseOrderResponse();
        when(purchaseOrderService.getOrderById(1)).thenReturn(expected);

        ResponseEntity<PurchaseOrderResponse> response = controller.getOrderById(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(purchaseOrderService).getOrderById(1);
    }

    @Test
    void getNextCode_shouldReturnOk() {
        when(purchaseOrderService.generateNextPOCode()).thenReturn("PO-001");

        ResponseEntity<Map<String, String>> response = controller.getNextCode();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("PO-001", response.getBody().get("code"));
        verify(purchaseOrderService).generateNextPOCode();
    }

    @Test
    void saveDraft_shouldReturnOk() {
        PurchaseOrderRequest request = new PurchaseOrderRequest();
        PurchaseOrderResponse expected = new PurchaseOrderResponse();
        when(purchaseOrderService.saveDraft(request)).thenReturn(expected);

        ResponseEntity<PurchaseOrderResponse> response = controller.saveDraft(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(purchaseOrderService).saveDraft(request);
    }

    @Test
    void confirmOrder_shouldReturnOk() {
        PurchaseOrderRequest request = new PurchaseOrderRequest();
        PurchaseOrderResponse expected = new PurchaseOrderResponse();
        when(purchaseOrderService.confirmOrder(request)).thenReturn(expected);

        ResponseEntity<PurchaseOrderResponse> response = controller.confirmOrder(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(purchaseOrderService).confirmOrder(request);
    }

    @Test
    void confirmExistingOrder_shouldReturnOk() {
        PurchaseOrderResponse expected = new PurchaseOrderResponse();
        when(purchaseOrderService.confirmExistingOrder(1)).thenReturn(expected);

        ResponseEntity<PurchaseOrderResponse> response = controller.confirmExistingOrder(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(purchaseOrderService).confirmExistingOrder(1);
    }

    @Test
    void updateOrder_shouldReturnOk() {
        PurchaseOrderRequest request = new PurchaseOrderRequest();
        PurchaseOrderResponse expected = new PurchaseOrderResponse();
        when(purchaseOrderService.updateOrder(1, request)).thenReturn(expected);

        ResponseEntity<PurchaseOrderResponse> response = controller.updateOrder(1, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(purchaseOrderService).updateOrder(1, request);
    }

    @Test
    void rejectOrder_shouldReturnOk() {
        PurchaseOrderResponse expected = new PurchaseOrderResponse();
        when(purchaseOrderService.rejectOrder(1, "Reason")).thenReturn(expected);

        ResponseEntity<PurchaseOrderResponse> response = controller.rejectOrder(1, Map.of("rejectionReason", "Reason"));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(purchaseOrderService).rejectOrder(1, "Reason");
    }

    @Test
    void approveOrder_shouldReturnOk() {
        PurchaseOrderResponse expected = new PurchaseOrderResponse();
        when(purchaseOrderService.approveOrder(1)).thenReturn(expected);

        ResponseEntity<PurchaseOrderResponse> response = controller.approveOrder(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(purchaseOrderService).approveOrder(1);
    }

    @Test
    void startChecking_shouldReturnOk() {
        PurchaseOrderResponse expected = new PurchaseOrderResponse();
        when(purchaseOrderService.startChecking(1)).thenReturn(expected);

        ResponseEntity<PurchaseOrderResponse> response = controller.startChecking(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(purchaseOrderService).startChecking(1);
    }

    @Test
    void receiveGoods_shouldReturnOk() {
        GoodsReceiptRequest request = new GoodsReceiptRequest();
        PurchaseOrderResponse expected = new PurchaseOrderResponse();
        when(purchaseOrderService.receiveGoods(1, request)).thenReturn(expected);

        ResponseEntity<PurchaseOrderResponse> response = controller.receiveGoods(1, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(purchaseOrderService).receiveGoods(1, request);
    }

    @Test
    void notifyManagers_shouldReturnOk() {
        NotifyManagerEmailRequest request = NotifyManagerEmailRequest.builder()
                .subject("Need decision")
                .message("Please review shortage")
                .build();
        MessageResponse expected = new MessageResponse("Đã gửi thông báo cho 2 quản lý.");
        when(purchaseOrderService.notifyManagers(1, request)).thenReturn(expected);

        ResponseEntity<MessageResponse> response = controller.notifyManagers(1, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(purchaseOrderService).notifyManagers(1, request);
    }

    @Test
    void closeShortage_shouldPassManagerDecisionNoteWhenPayloadProvided() {
        PurchaseOrderResponse expected = new PurchaseOrderResponse();
        when(purchaseOrderService.closeShortage(1, "Đóng thiếu hàng")).thenReturn(expected);

        ResponseEntity<PurchaseOrderResponse> response = controller.closeShortage(1, Map.of("managerDecisionNote", "Đóng thiếu hàng"));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(purchaseOrderService).closeShortage(1, "Đóng thiếu hàng");
    }

    @Test
    void closeShortage_shouldPassNullWhenPayloadIsNull() {
        PurchaseOrderResponse expected = new PurchaseOrderResponse();
        when(purchaseOrderService.closeShortage(1, null)).thenReturn(expected);

        ResponseEntity<PurchaseOrderResponse> response = controller.closeShortage(1, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(purchaseOrderService).closeShortage(1, null);
    }

    @Test
    void requestSupplierSupplement_shouldPassManagerDecisionNoteWhenPayloadProvided() {
        PurchaseOrderResponse expected = new PurchaseOrderResponse();
        when(purchaseOrderService.requestSupplierSupplement(1, "Yêu cầu bù hàng")).thenReturn(expected);

        ResponseEntity<PurchaseOrderResponse> response = controller.requestSupplierSupplement(1, Map.of("managerDecisionNote", "Yêu cầu bù hàng"));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(purchaseOrderService).requestSupplierSupplement(1, "Yêu cầu bù hàng");
    }

    @Test
    void requestSupplierSupplement_shouldPassNullWhenPayloadIsNull() {
        PurchaseOrderResponse expected = new PurchaseOrderResponse();
        when(purchaseOrderService.requestSupplierSupplement(1, null)).thenReturn(expected);

        ResponseEntity<PurchaseOrderResponse> response = controller.requestSupplierSupplement(1, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(purchaseOrderService).requestSupplierSupplement(1, null);
    }

    @Test
    void rejectShortage_shouldPassReasonWhenPayloadProvided() {
        PurchaseOrderResponse expected = new PurchaseOrderResponse();
        when(purchaseOrderService.rejectShortage(1, "Từ chối nhập hàng thiếu")).thenReturn(expected);

        ResponseEntity<PurchaseOrderResponse> response = controller.rejectShortage(1, Map.of("rejectionReason", "Từ chối nhập hàng thiếu"));

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(purchaseOrderService).rejectShortage(1, "Từ chối nhập hàng thiếu");
    }

    @Test
    void cancelOrder_shouldReturnOk() {
        PurchaseOrderResponse expected = new PurchaseOrderResponse();
        when(purchaseOrderService.cancelOrder(1)).thenReturn(expected);

        ResponseEntity<PurchaseOrderResponse> response = controller.cancelOrder(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(purchaseOrderService).cancelOrder(1);
    }

    @Test
    void deleteOrder_shouldReturnNoContent() {
        ResponseEntity<Void> response = controller.deleteOrder(1);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(purchaseOrderService).deleteOrder(1);
    }

    @Test
    void getAllSuppliers_shouldReturnOk() {
        List<SupplierResponse> expected = List.of(new SupplierResponse());
        when(purchaseOrderService.getAllSuppliers()).thenReturn(expected);

        ResponseEntity<List<SupplierResponse>> response = controller.getAllSuppliers();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(purchaseOrderService).getAllSuppliers();
    }

    @Test
    void getContractsBySupplier_shouldReturnOk() {
        List<ContractResponse> expected = List.of(new ContractResponse());
        when(purchaseOrderService.getContractsBySupplier(1)).thenReturn(expected);

        ResponseEntity<List<ContractResponse>> response = controller.getContractsBySupplier(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(purchaseOrderService).getContractsBySupplier(1);
    }

    @Test
    void getAllProducts_shouldReturnOk() {
        List<ProductResponse> expected = List.of(new ProductResponse());
        when(purchaseOrderService.getAllProducts()).thenReturn(expected);

        ResponseEntity<List<ProductResponse>> response = controller.getAllProducts();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(purchaseOrderService).getAllProducts();
    }
}
