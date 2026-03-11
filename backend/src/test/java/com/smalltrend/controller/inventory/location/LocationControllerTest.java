package com.smalltrend.controller.inventory.location;

import com.smalltrend.dto.inventory.location.FullLocationResponse;
import com.smalltrend.dto.inventory.location.LocationRequest;
import com.smalltrend.dto.inventory.location.LocationStockItemResponse;
import com.smalltrend.service.inventory.location.LocationService;
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
import static org.mockito.Mockito.doThrow;
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
        List<FullLocationResponse> expected = List.of(
                FullLocationResponse.builder().id(1).locationName("Kho A").build()
        );
        when(locationService.getAllLocations()).thenReturn(expected);

        ResponseEntity<List<FullLocationResponse>> response = controller.getAllLocations();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(locationService).getAllLocations();
    }

    @Test
    void getActiveLocations_shouldReturnOk() {
        List<FullLocationResponse> expected = List.of(
                FullLocationResponse.builder().id(1).locationName("Kho A").status("ACTIVE").build()
        );
        when(locationService.getActiveLocations()).thenReturn(expected);

        ResponseEntity<List<FullLocationResponse>> response = controller.getActiveLocations();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(locationService).getActiveLocations();
    }

    @Test
    void getLocationById_shouldReturnOk() {
        FullLocationResponse expected = FullLocationResponse.builder().id(1).locationName("Kho A").build();
        when(locationService.getLocationById(1)).thenReturn(expected);

        ResponseEntity<FullLocationResponse> response = controller.getLocationById(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(locationService).getLocationById(1);
    }

    @Test
    void getLocationStocks_shouldReturnOk() {
        List<LocationStockItemResponse> expected = List.of(
                LocationStockItemResponse.builder().variantId(1).productName("A").quantity(100).build()
        );
        when(locationService.getLocationStockItems(1)).thenReturn(expected);

        ResponseEntity<List<LocationStockItemResponse>> response = controller.getLocationStocks(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(locationService).getLocationStockItems(1);
    }

    @Test
    void createLocation_shouldReturnCreated() {
        LocationRequest request = new LocationRequest();
        FullLocationResponse expected = FullLocationResponse.builder().id(1).build();
        when(locationService.createLocation(request)).thenReturn(expected);

        ResponseEntity<FullLocationResponse> response = controller.createLocation(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(locationService).createLocation(request);
    }

    @Test
    void updateLocation_shouldReturnOk() {
        LocationRequest request = new LocationRequest();
        FullLocationResponse expected = FullLocationResponse.builder().id(1).build();
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
        FullLocationResponse expected = FullLocationResponse.builder().id(1).status("INACTIVE").build();
        when(locationService.toggleLocationStatus(1)).thenReturn(expected);

        ResponseEntity<?> response = controller.toggleLocationStatus(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(locationService).toggleLocationStatus(1);
    }

    @Test
    void toggleLocationStatus_shouldReturnBadRequest_whenExceptionThrown() {
        when(locationService.toggleLocationStatus(1)).thenThrow(new RuntimeException("Error toggling"));

        ResponseEntity<?> response = controller.toggleLocationStatus(1);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Error toggling", ((Map<?, ?>) response.getBody()).get("message"));
        verify(locationService).toggleLocationStatus(1);
    }

    @Test
    void transferStock_shouldReturnOk_whenSuccess() {
        Map<String, Object> requestBody = Map.of(
                "fromLocationId", 1,
                "toLocationId", 2,
                "variantId", 3,
                "batchId", 4,
                "quantity", 50
        );

        ResponseEntity<?> response = controller.transferStock(requestBody);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Chuyển hàng thành công", ((Map<?, ?>) response.getBody()).get("message"));
        verify(locationService).transferStock(1, 2, 3, 4, 50);
    }

    @Test
    void transferStock_shouldReturnBadRequest_whenExceptionThrown() {
        Map<String, Object> requestBody = Map.of(
                "fromLocationId", 1,
                "toLocationId", 2,
                "variantId", 3,
                "batchId", 4,
                "quantity", 50
        );
        doThrow(new RuntimeException("Insufficient stock")).when(locationService).transferStock(1, 2, 3, 4, 50);

        ResponseEntity<?> response = controller.transferStock(requestBody);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Insufficient stock", ((Map<?, ?>) response.getBody()).get("message"));
        verify(locationService).transferStock(1, 2, 3, 4, 50);
    }
}
