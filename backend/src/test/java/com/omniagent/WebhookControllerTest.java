package com.omniagent;

import com.omniagent.modules.inbox.service.InboxService;
import com.omniagent.modules.social.domain.Channel;
import com.omniagent.modules.social.repository.ChannelRepository;
import com.omniagent.modules.webhooks.controller.MetaWebhookController;
import com.omniagent.modules.webhooks.controller.TelegramWebhookController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

public class WebhookControllerTest {

    private ChannelRepository channelRepository;
    private InboxService inboxService;
    private MetaWebhookController metaController;
    private TelegramWebhookController telegramController;

    @BeforeEach
    void setup() {
        channelRepository = Mockito.mock(ChannelRepository.class);
        inboxService = Mockito.mock(InboxService.class);
        metaController = new MetaWebhookController(channelRepository, inboxService);
        telegramController = new TelegramWebhookController(channelRepository, inboxService);

        ReflectionTestUtils.setField(metaController, "configuredVerifyToken", "test_meta_token");
        ReflectionTestUtils.setField(telegramController, "configuredSecretToken", "test_secret_token");
    }

    @Test
    void testMetaSubscriptionHandshakeSuccess() {
        ResponseEntity<String> res = metaController.verifySubscription("subscribe", "test_meta_token", "challenge_12345");
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertEquals("challenge_12345", res.getBody());
    }

    @Test
    void testMetaSubscriptionHandshakeFailOnTokenMismatch() {
        ResponseEntity<String> res = metaController.verifySubscription("subscribe", "wrong_token", "challenge_12345");
        assertEquals(HttpStatus.FORBIDDEN, res.getStatusCode());
    }

    @Test
    void testTelegramWebhookUnauthorizedWhenSecretTokenWrong() {
        ResponseEntity<Map<String, Object>> res = telegramController.handleUpdate("invalid_secret", "{}");
        assertEquals(HttpStatus.UNAUTHORIZED, res.getStatusCode());
    }

    @Test
    void testTelegramWebhookProcessesMessage() {
        UUID orgId = UUID.randomUUID();
        UUID channelId = UUID.randomUUID();
        Channel channel = new Channel();
        channel.setId(channelId);
        channel.setOrganizationId(orgId);
        channel.setTitle("Test Telegram Channel");

        Mockito.when(channelRepository.findFirstByExternalChannelId("123456789"))
                .thenReturn(Optional.of(channel));

        String payload = """
        {
            "update_id": 999123,
            "message": {
                "message_id": 42,
                "chat": {"id": 123456789},
                "from": {"id": 5555, "first_name": "Aziz"},
                "text": "Salom, bu test xabari!"
            }
        }
        """;

        ResponseEntity<Map<String, Object>> res = telegramController.handleUpdate("test_secret_token", payload);
        assertEquals(HttpStatus.OK, res.getStatusCode());
        assertEquals(true, res.getBody().get("ok"));

        verify(inboxService, times(1)).recordInboundMessage(
                eq(orgId),
                eq(channelId),
                eq("5555"),
                eq("Aziz"),
                eq("Salom, bu test xabari!")
        );
    }
}
