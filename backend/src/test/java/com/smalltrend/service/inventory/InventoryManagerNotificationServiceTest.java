package com.smalltrend.service.inventory;

import com.smalltrend.dto.inventory.purchaseorder.NotifyManagerEmailRequest;
import com.smalltrend.entity.PurchaseOrder;
import com.smalltrend.entity.Role;
import com.smalltrend.entity.User;
import com.smalltrend.repository.UserRepository;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class InventoryManagerNotificationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private InventoryManagerNotificationService service;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "senderEmail", "warehouse@smalltrend.com");
        ReflectionTestUtils.setField(service, "senderPassword", "secret");
        ReflectionTestUtils.setField(service, "overrideRecipients", "manager1@smalltrend.com, manager2@smalltrend.com");

        when(mailSender.createMimeMessage())
                .thenAnswer(invocation -> new MimeMessage(Session.getInstance(new Properties())));
    }

    @Test
    void notifyManagers_shouldUseOverrideRecipientsAndReturnCount() {
        PurchaseOrder order = PurchaseOrder.builder().orderNumber("PO-001").build();
        NotifyManagerEmailRequest request = NotifyManagerEmailRequest.builder()
                .subject("  Cần xử lý đơn thiếu  ")
                .message("Nội dung <b>test</b>")
                .build();

        int sent = service.notifyManagers(order, request);

        assertEquals(2, sent);
        verify(mailSender, times(2)).send(any(MimeMessage.class));
    }

    @Test
    void notifyManagers_shouldUseRepositoryRecipientsWhenOverrideEmpty() {
        ReflectionTestUtils.setField(service, "overrideRecipients", " ");

        User u1 = User.builder().email("manager@smalltrend.com").role(Role.builder().name("MANAGER").build()).build();
        User u2 = User.builder().email(" ").role(Role.builder().name("MANAGER").build()).build();
        User u3 = User.builder().email("manager@smalltrend.com").role(Role.builder().name("ROLE_MANAGER").build()).build();

        when(userRepository.findByRole_NameInAndActiveTrueAndStatusIgnoreCase(anyList(), eq("ACTIVE")))
                .thenReturn(List.of(u1, u2, u3));

        int sent = service.notifyManagers(PurchaseOrder.builder().orderNumber("PO-002").build(),
                NotifyManagerEmailRequest.builder().subject("S").message("M").build());

        assertEquals(1, sent);
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void notifyManagers_shouldThrowWhenSenderEmailMissing() {
        ReflectionTestUtils.setField(service, "senderEmail", " ");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.notifyManagers(PurchaseOrder.builder().build(), NotifyManagerEmailRequest.builder().subject("S").message("M").build()));

        assertTrue(ex.getMessage().contains("spring.mail.username"));
    }

    @Test
    void notifyManagers_shouldThrowWhenSenderPasswordMissing() {
        ReflectionTestUtils.setField(service, "senderPassword", " ");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.notifyManagers(PurchaseOrder.builder().build(), NotifyManagerEmailRequest.builder().subject("S").message("M").build()));

        assertTrue(ex.getMessage().contains("spring.mail.password"));
    }

    @Test
    void notifyManagers_shouldThrowWhenRecipientsEmpty() {
        ReflectionTestUtils.setField(service, "overrideRecipients", " ");
        when(userRepository.findByRole_NameInAndActiveTrueAndStatusIgnoreCase(anyList(), eq("ACTIVE")))
                .thenReturn(List.of());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.notifyManagers(PurchaseOrder.builder().build(), NotifyManagerEmailRequest.builder().subject("S").message("M").build()));

        assertTrue(ex.getMessage().contains("Không tìm thấy email manager hợp lệ"));
    }

    @Test
    void notifyManagers_shouldWrapExceptionWhenMailSendFails() {
        doThrow(new RuntimeException("SMTP down")).when(mailSender).send(any(MimeMessage.class));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.notifyManagers(PurchaseOrder.builder().orderNumber("PO-003").build(),
                        NotifyManagerEmailRequest.builder().subject("S").message("M").build()));

        assertTrue(ex.getMessage().contains("Không thể gửi email đến manager"));
    }
}
