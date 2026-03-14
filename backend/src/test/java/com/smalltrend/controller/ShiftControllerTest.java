package com.smalltrend.controller;

import com.smalltrend.dto.common.MessageResponse;
import com.smalltrend.dto.shift.WorkShiftRequest;
import com.smalltrend.dto.shift.WorkShiftResponse;
import com.smalltrend.service.ShiftWorkforceService;
import com.smalltrend.service.WorkShiftAssignmentService;
import com.smalltrend.service.WorkShiftService;
import com.smalltrend.validation.ShiftValidator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShiftControllerTest {

    @Mock
    private WorkShiftService workShiftService;

    @Mock
    private WorkShiftAssignmentService assignmentService;

    @Mock
    private ShiftWorkforceService workforceService;

    @Mock
    private ShiftValidator validator;

    @InjectMocks
    private ShiftController shiftController;

    // --- Tests for createShift (Logic Function 1) ---

    @Test
    void createShift_shouldReturnBadRequest_whenValidationFails() {
        WorkShiftRequest request = new WorkShiftRequest();
        when(validator.validateShift(request)).thenReturn(List.of("invalid shift"));
        when(validator.hasErrors(any())).thenReturn(true);
        when(validator.errorsToString(any())).thenReturn("invalid shift");

        ResponseEntity<?> response = shiftController.createShift(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        MessageResponse body = (MessageResponse) response.getBody();
        assertEquals("invalid shift", body.getMessage());
        verify(workShiftService, never()).createShift(any());
    }

    @Test
    void createShift_shouldReturnOk_whenValidationPasses() {
        WorkShiftRequest request = WorkShiftRequest.builder().shiftCode("MORNING").shiftName("Ca sáng").build();
        WorkShiftResponse expected = WorkShiftResponse.builder().id(10).shiftCode("MORNING").build();

        when(validator.validateShift(request)).thenReturn(List.of());
        when(validator.hasErrors(any())).thenReturn(false);
        when(workShiftService.createShift(request)).thenReturn(expected);

        ResponseEntity<?> response = shiftController.createShift(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    // --- Tests for updateShift (Logic Function 2) ---

    @Test
    void updateShift_shouldReturnBadRequest_whenValidationFails() {
        WorkShiftRequest request = WorkShiftRequest.builder().shiftCode("A").build();
        when(validator.validateId(0, "Shift id")).thenReturn(Collections.singletonList("bad id"));
        when(validator.validateShift(request)).thenReturn(List.of("bad shift"));
        when(validator.hasErrors(any())).thenReturn(true);
        when(validator.errorsToString(any())).thenReturn("bad id; bad shift");

        ResponseEntity<?> response = shiftController.updateShift(0, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        MessageResponse body = (MessageResponse) response.getBody();
        assertEquals("bad id; bad shift", body.getMessage());
        verify(workShiftService, never()).updateShift(any(), any());
    }

    @Test
    void updateShift_shouldReturnOk_whenValid() {
        WorkShiftRequest request = WorkShiftRequest.builder().shiftCode("SHIFT-U").shiftName("Ca cập nhật").build();
        WorkShiftResponse expected = WorkShiftResponse.builder().id(7).shiftCode("SHIFT-U").build();
        when(validator.validateId(7, "Shift id")).thenReturn(Collections.emptyList());
        when(validator.validateShift(request)).thenReturn(List.of());
        when(validator.hasErrors(any())).thenReturn(false);
        when(workShiftService.updateShift(7, request)).thenReturn(expected);

        ResponseEntity<?> response = shiftController.updateShift(7, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
        verify(workShiftService).updateShift(7, request);
    }
}
