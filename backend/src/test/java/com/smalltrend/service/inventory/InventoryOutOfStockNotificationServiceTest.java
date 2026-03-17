package com.smalltrend.service.inventory;

import com.smalltrend.entity.*;
import com.smalltrend.repository.InventoryStockRepository;
import com.smalltrend.repository.ProductBatchRepository;
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

import java.time.LocalDate;
import java.util.List;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class InventoryOutOfStockNotificationServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private UserRepository userRepository;

    @Mock
    private InventoryStockRepository inventoryStockRepository;

    @Mock
    private ProductBatchRepository productBatchRepository;

    @InjectMocks
    private InventoryOutOfStockNotificationService service;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "senderEmail", "inventory@smalltrend.com");
        ReflectionTestUtils.setField(service, "senderPassword", "secret");
        ReflectionTestUtils.setField(service, "overrideRecipients", "manager1@smalltrend.com, manager2@smalltrend.com");
        ReflectionTestUtils.setField(service, "dailyEnabled", true);
        ReflectionTestUtils.setField(service, "expiredBatchDailyEnabled", true);

        when(mailSender.createMimeMessage())
                .thenAnswer(invocation -> new MimeMessage(Session.getInstance(new Properties())));
    }

    @Test
    void sendDailyOutOfStockSummary_shouldReturnWhenDisabled() {
        ReflectionTestUtils.setField(service, "dailyEnabled", false);

        service.sendDailyOutOfStockSummary();

        verify(inventoryStockRepository, never()).findOutOfStockWithDetails();
    }

    @Test
    void sendDailyOutOfStockSummary_shouldReturnWhenMailConfigInvalid() {
        ReflectionTestUtils.setField(service, "senderPassword", " ");

        service.sendDailyOutOfStockSummary();

        verify(inventoryStockRepository, never()).findOutOfStockWithDetails();
    }

    @Test
    void sendDailyOutOfStockSummary_shouldReturnWhenRecipientsEmpty() {
        ReflectionTestUtils.setField(service, "overrideRecipients", " ");
        when(userRepository.findByRole_NameInAndActiveTrueAndStatusIgnoreCase(anyList(), eq("ACTIVE")))
                .thenReturn(List.of());

        service.sendDailyOutOfStockSummary();

        verify(inventoryStockRepository, never()).findOutOfStockWithDetails();
    }

    @Test
    void sendDailyOutOfStockSummary_shouldReturnWhenNoOutOfStockItems() {
        when(inventoryStockRepository.findOutOfStockWithDetails()).thenReturn(List.of());

        service.sendDailyOutOfStockSummary();

        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    void sendDailyOutOfStockSummary_shouldSendAndContinueWhenOneRecipientFails() {
        when(inventoryStockRepository.findOutOfStockWithDetails()).thenReturn(List.of(buildOutOfStock()));
        doThrow(new RuntimeException("smtp down")).doNothing().when(mailSender).send(any(MimeMessage.class));

        service.sendDailyOutOfStockSummary();

        verify(mailSender, times(2)).send(any(MimeMessage.class));
    }

    @Test
    void sendDailyOutOfStockSummary_shouldUseRepositoryRecipientsWhenOverrideBlank() {
        ReflectionTestUtils.setField(service, "overrideRecipients", " ");
        User u1 = User.builder().email("repo_manager@smalltrend.com").build();
        User u2 = User.builder().email("repo_manager@smalltrend.com").build();
        when(userRepository.findByRole_NameInAndActiveTrueAndStatusIgnoreCase(anyList(), eq("ACTIVE")))
                .thenReturn(List.of(u1, u2));
        when(inventoryStockRepository.findOutOfStockWithDetails()).thenReturn(List.of(buildOutOfStock()));

        service.sendDailyOutOfStockSummary();

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    void sendDailyExpiredBatchSummary_shouldReturnWhenDisabled() {
        ReflectionTestUtils.setField(service, "expiredBatchDailyEnabled", false);

        service.sendDailyExpiredBatchSummary();

        verify(productBatchRepository, never()).findExpiredBatches(any(LocalDate.class));
    }

    @Test
    void sendDailyExpiredBatchSummary_shouldReturnWhenMailConfigInvalid() {
        ReflectionTestUtils.setField(service, "senderEmail", " ");

        service.sendDailyExpiredBatchSummary();

        verify(productBatchRepository, never()).findExpiredBatches(any(LocalDate.class));
    }

    @Test
    void sendDailyExpiredBatchSummary_shouldReturnWhenRecipientsEmpty() {
        ReflectionTestUtils.setField(service, "overrideRecipients", " ");
        when(userRepository.findByRole_NameInAndActiveTrueAndStatusIgnoreCase(anyList(), eq("ACTIVE")))
                .thenReturn(List.of());

        service.sendDailyExpiredBatchSummary();

        verify(productBatchRepository, never()).findExpiredBatches(any(LocalDate.class));
    }

    @Test
    void sendDailyExpiredBatchSummary_shouldReturnWhenNoExpiredBatches() {
        when(productBatchRepository.findExpiredBatches(any(LocalDate.class))).thenReturn(List.of());

        service.sendDailyExpiredBatchSummary();

        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    void sendDailyExpiredBatchSummary_shouldSendSummary() {
        ProductBatch batch = ProductBatch.builder()
                .batchNumber("B-001")
                .expiryDate(LocalDate.now().minusDays(2))
                .variant(ProductVariant.builder().sku("SKU-1").product(Product.builder().name("Milk").build()).build())
                .build();
        when(productBatchRepository.findExpiredBatches(any(LocalDate.class))).thenReturn(List.of(batch));

        service.sendDailyExpiredBatchSummary();

        verify(mailSender, times(2)).send(any(MimeMessage.class));
    }

    @Test
    void handleStockTransition_shouldIgnoreNullStock() {
        service.handleStockTransition(null, 1, 0, "TEST");
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    void handleStockTransition_shouldRemoveActiveKeyWhenRestocked() {
        InventoryStock stock = buildOutOfStock();
        @SuppressWarnings("unchecked")
        ConcurrentHashMap<String, Boolean> map = (ConcurrentHashMap<String, Boolean>) ReflectionTestUtils.getField(service, "activeOutOfStockKeys");
        map.put("1:10:100", true);

        service.handleStockTransition(stock, 0, 5, "IMPORT_STOCK");

        assertFalse(map.containsKey("1:10:100"));
    }

    @Test
    void handleStockTransition_shouldAddKeyWhenAlertDelivered() {
        InventoryStock stock = buildOutOfStock();

        service.handleStockTransition(stock, 5, 0, "SALE_ORDER");

        @SuppressWarnings("unchecked")
        ConcurrentHashMap<String, Boolean> map = (ConcurrentHashMap<String, Boolean>) ReflectionTestUtils.getField(service, "activeOutOfStockKeys");
        assertTrue(Boolean.TRUE.equals(map.get("1:10:100")));
        verify(mailSender, times(2)).send(any(MimeMessage.class));
    }

    @Test
    void handleStockTransition_shouldNotDuplicateAlertWhenAlreadyActive() {
        InventoryStock stock = buildOutOfStock();
        @SuppressWarnings("unchecked")
        ConcurrentHashMap<String, Boolean> map = (ConcurrentHashMap<String, Boolean>) ReflectionTestUtils.getField(service, "activeOutOfStockKeys");
        map.put("1:10:100", true);

        service.handleStockTransition(stock, 3, 0, "SALE_ORDER");

        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    void handleStockTransition_shouldNotStoreKeyWhenDeliveryFails() {
        InventoryStock stock = buildOutOfStock();
        doThrow(new RuntimeException("smtp down")).when(mailSender).send(any(MimeMessage.class));

        service.handleStockTransition(stock, 5, 0, "SALE_ORDER");

        @SuppressWarnings("unchecked")
        ConcurrentHashMap<String, Boolean> map = (ConcurrentHashMap<String, Boolean>) ReflectionTestUtils.getField(service, "activeOutOfStockKeys");
        assertFalse(map.containsKey("1:10:100"));
    }

    private InventoryStock buildOutOfStock() {
        Product product = Product.builder().id(1).name("Milk <fresh>").build();
        ProductVariant variant = ProductVariant.builder().id(1).sku("SKU&1").product(product).build();
        ProductBatch batch = ProductBatch.builder().id(10).batchNumber("B'01").build();
        Location location = Location.builder().id(100).name("Kho \"A\"").build();

        return InventoryStock.builder()
                .variant(variant)
                .batch(batch)
                .location(location)
                .quantity(0)
                .build();
    }
}
