package com.omniagent;

import com.omniagent.modules.ai.provider.AiProvider.AiProviderResult;
import com.omniagent.modules.ai.service.AiProviderRouter;
import com.omniagent.modules.inbox.domain.Conversation;
import com.omniagent.modules.inbox.domain.Message;
import com.omniagent.modules.inbox.repository.ConversationRepository;
import com.omniagent.modules.inbox.repository.MessageRepository;
import com.omniagent.modules.inbox.service.InboxService;
import com.omniagent.modules.social.repository.ChannelRepository;
import com.omniagent.modules.social.repository.ConnectedAccountRepository;
import com.omniagent.modules.social.service.SocialAccountService;
import com.omniagent.modules.telegram.service.TelegramAdapter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

public class InboxServiceTest {

    private ConversationRepository conversationRepository;
    private MessageRepository messageRepository;
    private ChannelRepository channelRepository;
    private ConnectedAccountRepository accountRepository;
    private SocialAccountService socialAccountService;
    private TelegramAdapter telegramAdapter;
    private AiProviderRouter aiRouter;
    private InboxService inboxService;

    private UUID orgId;
    private UUID channelId;

    @BeforeEach
    void setUp() {
        conversationRepository = mock(ConversationRepository.class);
        messageRepository = mock(MessageRepository.class);
        channelRepository = mock(ChannelRepository.class);
        accountRepository = mock(ConnectedAccountRepository.class);
        socialAccountService = mock(SocialAccountService.class);
        telegramAdapter = mock(TelegramAdapter.class);
        aiRouter = mock(AiProviderRouter.class);

        inboxService = new InboxService(
                conversationRepository,
                messageRepository,
                channelRepository,
                accountRepository,
                socialAccountService,
                telegramAdapter,
                aiRouter
        );

        orgId = UUID.randomUUID();
        channelId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Should ingest inbound message, set 24h window, and classify sentiment via AI triage")
    void testRecordInboundMessageWithAiTriage() {
        String triageJson = "{\"sentiment\": \"POSITIVE\", \"priority\": \"HIGH\"}";
        AiProviderResult mockAiResult = new AiProviderResult(
                true, triageJson, 40, 20, "gemini-1.5-pro", null
        );

        when(aiRouter.generateStructuredJson(anyString(), anyString(), anyString()))
                .thenReturn(mockAiResult);

        when(conversationRepository.findByOrganizationIdAndChannelIdAndExternalSenderId(any(), any(), any()))
                .thenReturn(Optional.empty());

        when(conversationRepository.save(any(Conversation.class)))
                .thenAnswer(invocation -> {
                    Conversation c = invocation.getArgument(0);
                    c.setId(UUID.randomUUID());
                    return c;
                });

        when(messageRepository.save(any(Message.class)))
                .thenAnswer(invocation -> {
                    Message m = invocation.getArgument(0);
                    m.setId(UUID.randomUUID());
                    return m;
                });

        Message recorded = inboxService.recordInboundMessage(
                orgId, channelId, "tg_user_12345", "Azizbek", "Salom, mahsulot narxi va yetkazib berish shartlari qanday?"
        );

        assertNotNull(recorded);
        assertEquals("INBOUND", recorded.getDirection());
        assertEquals("Salom, mahsulot narxi va yetkazib berish shartlari qanday?", recorded.getContentText());

        ArgumentCaptor<Conversation> convCaptor = ArgumentCaptor.forClass(Conversation.class);
        verify(conversationRepository).save(convCaptor.capture());

        Conversation savedConv = convCaptor.getValue();
        assertEquals("POSITIVE", savedConv.getSentiment());
        assertEquals("HIGH", savedConv.getPriority());
        assertNotNull(savedConv.getMessagingWindowExpiresAt());
        assertTrue(savedConv.getMessagingWindowExpiresAt().isAfter(Instant.now()));
    }
}
