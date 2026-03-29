package com.smalltrend.service.crm;

import com.smalltrend.dto.CRM.CreateTicketRequest;
import com.smalltrend.dto.CRM.TicketResponse;
import com.smalltrend.dto.CRM.UpdateTicketRequest;
import com.smalltrend.entity.Attendance;
import com.smalltrend.entity.InventoryStock;
import com.smalltrend.entity.Product;
import com.smalltrend.entity.ProductVariant;
import com.smalltrend.entity.Ticket;
import com.smalltrend.entity.Unit;
import com.smalltrend.entity.User;
import com.smalltrend.entity.WorkShift;
import com.smalltrend.entity.WorkShiftAssignment;
import com.smalltrend.entity.enums.TicketPriority;
import com.smalltrend.entity.enums.TicketStatus;
import com.smalltrend.entity.enums.TicketType;
import com.smalltrend.repository.AttendanceRepository;
import com.smalltrend.repository.ProductVariantRepository;
import com.smalltrend.repository.TicketRepository;
import com.smalltrend.repository.UserRepository;
import com.smalltrend.repository.WorkShiftAssignmentRepository;
import com.smalltrend.service.CRM.TicketService;
import com.smalltrend.service.inventory.shared.InventoryStockService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private InventoryStockService inventoryStockService;
    @Mock
    private ProductVariantRepository productVariantRepository;
    @Mock
    private WorkShiftAssignmentRepository workShiftAssignmentRepository;
    @Mock
    private AttendanceRepository attendanceRepository;

    @InjectMocks
    private TicketService ticketService;

    @Test
    void getAllTickets_shouldMapTicketList() {
        Ticket ticket = Ticket.builder()
                .id(1L)
                .ticketCode("TCK-ORD-001")
                .ticketType(TicketType.ORDER)
                .title("Order issue")
                .status(TicketStatus.IN_PROGRESS)
                .priority(TicketPriority.NORMAL)
                .build();

        when(ticketRepository.findAll()).thenReturn(List.of(ticket));

        List<TicketResponse> responses = ticketService.getAllTickets();

        assertEquals(1, responses.size());
        assertEquals("TCK-ORD-001", responses.get(0).getTicketCode());
    }

    @Test
    void createTicket_shouldGenerateNextUniqueCodeAndAssignUsers() {
        User createdBy = User.builder().id(1).fullName("Creator").build();
        User assignedTo = User.builder().id(2).fullName("Assignee").build();
        CreateTicketRequest request = new CreateTicketRequest();
        request.setTicketType("ORDER");
        request.setTitle("Need review");
        request.setDescription("Review order");
        request.setCreatedById(1);
        request.setAssignedToUserId(2);

        when(ticketRepository.countByTicketType(TicketType.ORDER)).thenReturn(0L);
        when(ticketRepository.findByTicketCode("TCK-ORD-001")).thenReturn(List.of(new Ticket()));
        when(ticketRepository.findByTicketCode("TCK-ORD-002")).thenReturn(List.of());
        when(userRepository.findById(1)).thenReturn(Optional.of(createdBy));
        when(userRepository.findById(2)).thenReturn(Optional.of(assignedTo));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket ticket = invocation.getArgument(0);
            ticket.setId(9L);
            return ticket;
        });

        TicketResponse response = ticketService.createTicket(request);

        assertEquals("TCK-ORD-002", response.getTicketCode());
        assertEquals("IN_PROGRESS", response.getStatus());
        assertEquals("NORMAL", response.getPriority());
        assertEquals(1, response.getCreatedByUserId());
        assertEquals(2, response.getAssignedToUserId());
    }

    @Test
    void createTicket_shouldRejectShiftSwapToSelf() {
        User requester = User.builder().id(1).fullName("Requester").build();
        WorkShift shift = WorkShift.builder().id(1).shiftName("Morning").build();
        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .id(10)
                .user(requester)
                .workShift(shift)
                .shiftDate(LocalDate.now().plusDays(1))
                .build();

        CreateTicketRequest request = new CreateTicketRequest();
        request.setTicketType("SHIFT_CHANGE");
        request.setRelatedEntityType("SHIFT_SWAP");
        request.setRequesterUserId(1);
        request.setSwapRequesterAssignmentId(10);
        request.setSwapTargetUserId(1);

        when(workShiftAssignmentRepository.findByIdAndDeletedFalse(10)).thenReturn(Optional.of(assignment));
        when(attendanceRepository.findByUserIdAndDate(1, assignment.getShiftDate())).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> ticketService.createTicket(request));

        assertEquals("Không thể gửi yêu cầu đổi ca cho chính mình", exception.getMessage());
    }

    @Test
    void createTicket_shouldRejectWhenRequesterAttendanceCompleted() {
        User requester = User.builder().id(1).fullName("Requester").build();
        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .id(11)
                .user(requester)
                .shiftDate(LocalDate.now())
                .workShift(WorkShift.builder().id(1).build())
                .build();
        Attendance attendance = Attendance.builder().user(requester).date(LocalDate.now()).status("PRESENT").build();

        CreateTicketRequest request = new CreateTicketRequest();
        request.setTicketType("SHIFT_CHANGE");
        request.setRelatedEntityType("SHIFT_SWAP");
        request.setRequesterUserId(1);
        request.setSwapRequesterAssignmentId(11);
        request.setSwapTargetUserId(2);

        when(workShiftAssignmentRepository.findByIdAndDeletedFalse(11)).thenReturn(Optional.of(assignment));
        when(attendanceRepository.findByUserIdAndDate(1, LocalDate.now())).thenReturn(Optional.of(attendance));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> ticketService.createTicket(request));

        assertEquals("Ca này đã chấm công, không thể tạo ticket đổi ca", exception.getMessage());
    }

    @Test
    void lookupVariantBySku_shouldReturnAggregatedStock() {
        Product product = Product.builder().id(1).name("Coffee").build();
        Unit unit = Unit.builder().id(1).name("Box").build();
        ProductVariant variant = ProductVariant.builder()
                .id(1)
                .product(product)
                .unit(unit)
                .sku("SKU-ABC")
                .barcode("BAR-1")
                .sellPrice(new BigDecimal("25000"))
                .build();
        InventoryStock stockA = InventoryStock.builder().id(1).variant(variant).quantity(3).build();
        InventoryStock stockB = InventoryStock.builder().id(2).variant(variant).quantity(7).build();
        variant.setInventoryStocks(List.of(stockA, stockB));

        when(productVariantRepository.findBySkuContainingIgnoreCaseOrProduct_NameContainingIgnoreCase("SKU", "SKU"))
                .thenReturn(List.of(variant));

        List<java.util.Map<String, Object>> result = ticketService.lookupVariantBySku("SKU");

        assertEquals(1, result.size());
        assertEquals(10, result.get(0).get("totalStock"));
        assertEquals("Coffee", result.get(0).get("productName"));
    }

    @Test
    void updateTicket_shouldResolveAndAssignUser() {
        Ticket ticket = Ticket.builder()
                .id(5L)
                .ticketCode("TCK-ISS-001")
                .ticketType(TicketType.ISSUE)
                .title("Old title")
                .status(TicketStatus.OPEN)
                .priority(TicketPriority.LOW)
                .build();
        User assignedTo = User.builder().id(3).fullName("Resolver").build();
        UpdateTicketRequest request = new UpdateTicketRequest();
        request.setTitle("New title");
        request.setPriority("HIGH");
        request.setStatus("RESOLVED");
        request.setAssignedToUserId(3);
        request.setResolution("Fixed");

        when(ticketRepository.findById(5L)).thenReturn(Optional.of(ticket));
        when(userRepository.findById(3)).thenReturn(Optional.of(assignedTo));
        when(ticketRepository.save(ticket)).thenReturn(ticket);

        TicketResponse response = ticketService.updateTicket(5L, request);

        assertEquals("New title", response.getTitle());
        assertEquals("RESOLVED", response.getStatus());
        assertEquals("HIGH", response.getPriority());
        assertEquals(3, response.getAssignedToUserId());
        assertNotNull(response.getResolvedAt());
    }

    @Test
    void updateTicket_shouldSetAssignmentOnLeave_whenResolvingShiftCancelTicket() {
        User employee = User.builder().id(10).fullName("Employee").build();
        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .id(50)
                .user(employee)
                .shiftDate(LocalDate.now().plusDays(1))
                .status("ASSIGNED")
                .build();

        Ticket ticket = Ticket.builder()
                .id(20L)
                .ticketCode("TCK-SHF-001")
                .ticketType(TicketType.SHIFT_CHANGE)
                .title("Yeu cau nghi ca: 2026-05-01")
                .relatedEntityType("SHIFT_ASSIGNMENT")
                .relatedEntityId(50L)
                .status(TicketStatus.OPEN)
                .priority(TicketPriority.NORMAL)
                .build();

        UpdateTicketRequest request = new UpdateTicketRequest();
        request.setStatus("RESOLVED");
        request.setResolution("Approved leave");

        when(ticketRepository.findById(20L)).thenReturn(Optional.of(ticket));
        when(workShiftAssignmentRepository.findByIdAndDeletedFalse(50)).thenReturn(Optional.of(assignment));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(inv -> inv.getArgument(0));

        ticketService.updateTicket(20L, request);

        ArgumentCaptor<WorkShiftAssignment> captor = ArgumentCaptor.forClass(WorkShiftAssignment.class);
        verify(workShiftAssignmentRepository).save(captor.capture());
        assertEquals("ON_LEAVE", captor.getValue().getStatus());
    }

    @Test
    void updateTicket_shouldSetAssignmentOnLeave_whenRelatedTypeIsShiftCancel() {
        User employee = User.builder().id(11).fullName("Employee2").build();
        WorkShiftAssignment assignment = WorkShiftAssignment.builder()
                .id(51)
                .user(employee)
                .shiftDate(LocalDate.now().plusDays(2))
                .status("ASSIGNED")
                .build();

        Ticket ticket = Ticket.builder()
                .id(21L)
                .ticketCode("TCK-SHF-002")
                .ticketType(TicketType.SHIFT_CHANGE)
                .title("Xin nghi phep")
                .relatedEntityType("SHIFT_CANCEL")
                .relatedEntityId(51L)
                .status(TicketStatus.IN_PROGRESS)
                .priority(TicketPriority.HIGH)
                .build();

        UpdateTicketRequest request = new UpdateTicketRequest();
        request.setStatus("RESOLVED");
        request.setResolution("Leave approved");

        when(ticketRepository.findById(21L)).thenReturn(Optional.of(ticket));
        when(workShiftAssignmentRepository.findByIdAndDeletedFalse(51)).thenReturn(Optional.of(assignment));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(inv -> inv.getArgument(0));

        ticketService.updateTicket(21L, request);

        ArgumentCaptor<WorkShiftAssignment> captor = ArgumentCaptor.forClass(WorkShiftAssignment.class);
        verify(workShiftAssignmentRepository).save(captor.capture());
        assertEquals("ON_LEAVE", captor.getValue().getStatus());
    }

    @Test
    void updateTicket_shouldNotSetOnLeave_whenTicketIsSwapType() {
        Ticket ticket = Ticket.builder()
                .id(22L)
                .ticketCode("TCK-SHF-003")
                .ticketType(TicketType.SHIFT_CHANGE)
                .title("Yeu cau doi ca")
                .relatedEntityType("SHIFT_SWAP")
                .relatedEntityId(52L)
                .status(TicketStatus.OPEN)
                .priority(TicketPriority.NORMAL)
                .build();

        UpdateTicketRequest request = new UpdateTicketRequest();
        request.setStatus("RESOLVED");
        request.setResolution("Swap done");

        when(ticketRepository.findById(22L)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(inv -> inv.getArgument(0));

        ticketService.updateTicket(22L, request);

        // Should NOT call workShiftAssignmentRepository.save for ON_LEAVE
        verify(workShiftAssignmentRepository, org.mockito.Mockito.never()).save(any());
    }

    @Test
    void deleteTicket_shouldThrowWhenMissing() {
        when(ticketRepository.existsById(88L)).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> ticketService.deleteTicket(88L));

        assertEquals("Ticket not found", exception.getMessage());
    }
}
