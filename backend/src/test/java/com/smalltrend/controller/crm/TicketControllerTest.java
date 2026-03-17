package com.smalltrend.controller.crm;

import com.smalltrend.controller.CRM.TicketController;
import com.smalltrend.dto.CRM.CreateTicketRequest;
import com.smalltrend.dto.CRM.TicketResponse;
import com.smalltrend.dto.CRM.UpdateTicketRequest;
import com.smalltrend.entity.Role;
import com.smalltrend.entity.User;
import com.smalltrend.repository.UserRepository;
import com.smalltrend.service.CRM.TicketService;
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
class TicketControllerTest {

    @Mock
    private TicketService ticketService;
    @Mock
    private UserRepository userRepository;

    private TicketController controller;

    @BeforeEach
    void setUp() {
        controller = new TicketController(ticketService, userRepository);
    }

    @Test
    void getAllTickets_shouldReturnOk() {
        List<TicketResponse> expected = List.of(new TicketResponse());
        when(ticketService.getAllTickets()).thenReturn(expected);

        ResponseEntity<List<TicketResponse>> response = controller.getAllTickets();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void createTicket_shouldReturnCreated() {
        CreateTicketRequest request = new CreateTicketRequest();
        TicketResponse expected = new TicketResponse();
        when(ticketService.createTicket(request)).thenReturn(expected);

        ResponseEntity<?> response = controller.createTicket(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void createTicket_shouldReturnBadRequestOnException() {
        CreateTicketRequest request = new CreateTicketRequest();
        when(ticketService.createTicket(request)).thenThrow(new RuntimeException("invalid"));

        ResponseEntity<?> response = controller.createTicket(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("invalid", ((Map<?, ?>) response.getBody()).get("message"));
    }

    @Test
    void getUsersByRole_shouldMapRoleLookup() {
        Role role = Role.builder().id(1).name("ROLE_MANAGER").build();
        User user = User.builder().id(1).fullName("Alice").username("alice").email("alice@test.com").role(role).build();
        when(userRepository.findByRoleId(1)).thenReturn(List.of(user));

        ResponseEntity<List<Map<String, Object>>> response = controller.getUsersByRole(1);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("ROLE_MANAGER", response.getBody().get(0).get("roleName"));
    }

    @Test
    void getVariantBySku_shouldDelegateToService() {
        List<Map<String, Object>> expected = List.of(Map.of("sku", "SKU-1"));
        when(ticketService.lookupVariantBySku("SKU")).thenReturn(expected);

        ResponseEntity<List<Map<String, Object>>> response = controller.getVariantBySku("SKU");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void updateTicket_shouldReturnOk() {
        UpdateTicketRequest request = new UpdateTicketRequest();
        TicketResponse expected = new TicketResponse();
        when(ticketService.updateTicket(2L, request)).thenReturn(expected);

        ResponseEntity<TicketResponse> response = controller.updateTicket(2L, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expected, response.getBody());
    }

    @Test
    void deleteTicket_shouldReturnNoContent() {
        ResponseEntity<Void> response = controller.deleteTicket(2L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(ticketService).deleteTicket(2L);
    }
}