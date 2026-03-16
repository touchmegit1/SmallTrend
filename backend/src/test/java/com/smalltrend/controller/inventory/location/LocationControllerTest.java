package com.smalltrend.controller.inventory.location;

import com.smalltrend.controller.inventory.LocationController;
import com.smalltrend.dto.inventory.location.FullLocationResponse;
import com.smalltrend.dto.inventory.location.LocationRequest;
import com.smalltrend.dto.inventory.location.LocationStockItemResponse;
import com.smalltrend.dto.inventory.location.LocationTransferRequest;
import com.smalltrend.service.inventory.LocationService;
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
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LocationControllerTest {

    @Mock
    private LocationService locationService;

    private LocationController controller;

    @BeforeEach
    void setUp() {
        controller = new LocationController(locationService);
    }

    @Test
    void getAllLocations_shouldReturnOk() {
        FullLocationResponse location = mock(FullLocationResponse.class);
        List<FullLocationResponse> expected = List.of(location);
        when(locationService.getAllLocations()).thenReturn(expected);

        ResponseEntity<List<FullLocationResponse>> response = controller.getAllLocations();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(locationService).getAllLocations();
    }

    @Test
    void getActiveLocations_shouldReturnOk() {
        FullLocationResponse location = mock(FullLocationResponse.class);
        List<FullLocationResponse> expected = List.of(location);
        when(locationService.getActiveLocations()).thenReturn(expected);

        ResponseEntity<List<FullLocationResponse>> response = controller.getActiveLocations();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(locationService).getActiveLocations();
    }

    @Test
    void getLocationById_shouldReturnOk() {
        FullLocationResponse expected = mock(FullLocationResponse.class);
        when(locationService.getLocationById(1)).thenReturn(expected);

        ResponseEntity<FullLocationResponse> response = controller.getLocationById(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(locationService).getLocationById(1);
    }

    @Test
    void getLocationStocks_shouldReturnOk() {
        LocationStockItemResponse stockItem = mock(LocationStockItemResponse.class);
        List<LocationStockItemResponse> expected = List.of(stockItem);
        when(locationService.getLocationStockItems(1)).thenReturn(expected);

        ResponseEntity<List<LocationStockItemResponse>> response = controller.getLocationStocks(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(locationService).getLocationStockItems(1);
    }

    @Test
    void createLocation_shouldReturnCreated() {
        LocationRequest request = new LocationRequest();
        FullLocationResponse expected = mock(FullLocationResponse.class);
        when(locationService.createLocation(request)).thenReturn(expected);

        ResponseEntity<FullLocationResponse> response = controller.createLocation(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(locationService).createLocation(request);
    }

    @Test
    void updateLocation_shouldReturnOk() {
        LocationRequest request = new LocationRequest();
        FullLocationResponse expected = mock(FullLocationResponse.class);
        when(locationService.updateLocation(1, request)).thenReturn(expected);

        ResponseEntity<FullLocationResponse> response = controller.updateLocation(1, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(locationService).updateLocation(1, request);
    }

    @Test
    void deleteLocation_shouldReturnOk() {
        ResponseEntity<Map<String, String>> response = controller.deleteLocation(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Location deleted successfully", response.getBody().get("message"));
        verify(locationService).deleteLocation(1);
    }

    @Test
    void toggleLocationStatus_shouldReturnOk_whenSuccess() {
        FullLocationResponse expected = mock(FullLocationResponse.class);
        when(locationService.toggleLocationStatus(1)).thenReturn(expected);

        ResponseEntity<FullLocationResponse> response = controller.toggleLocationStatus(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(locationService).toggleLocationStatus(1);
    }

    @Test
    void toggleLocationStatus_shouldThrowException_whenServiceThrows() {
        when(locationService.toggleLocationStatus(1)).thenThrow(new RuntimeException("Error toggling"));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> controller.toggleLocationStatus(1));

        assertEquals("Error toggling", ex.getMessage());
        verify(locationService).toggleLocationStatus(1);
    }

    @Test
    void transferStock_shouldReturnOk_whenSuccess() {
        LocationTransferRequest requestBody = new LocationTransferRequest();
        requestBody.setFromLocationId(1);
        requestBody.setToLocationId(2);
        requestBody.setVariantId(3);
        requestBody.setBatchId(4);
        requestBody.setQuantity(50);

        ResponseEntity<Map<String, String>> response = controller.transferStock(requestBody);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Chuyển hàng thành công", response.getBody().get("message"));
        verify(locationService).transferStock(1, 2, 3, 4, 50);
    }

    @Test
    void transferStock_shouldThrowException_whenServiceThrows() {
        LocationTransferRequest requestBody = new LocationTransferRequest();
        requestBody.setFromLocationId(1);
        requestBody.setToLocationId(2);
        requestBody.setVariantId(3);
        requestBody.setBatchId(4);
        requestBody.setQuantity(50);
        doThrow(new RuntimeException("Insufficient stock")).when(locationService).transferStock(1, 2, 3, 4, 50);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> controller.transferStock(requestBody));

        assertEquals("Insufficient stock", ex.getMessage());
        verify(locationService).transferStock(1, 2, 3, 4, 50);
    }
}
