package com.omniagent.modules.inbox.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.omniagent.common.exception.BusinessRuleException;
import com.omniagent.common.exception.ResourceNotFoundException;
import com.omniagent.modules.ai.provider.AiProvider.AiProviderResult;
import com.omniagent.modules.ai.service.AiProviderRouter;
import com.omniagent.modules.inbox.domain.Conversation;
import com.omniagent.modules.inbox.domain.Message;
import com.omniagent.modules.inbox.repository.ConversationRepository;
import com.omniagent.modules.inbox.repository.MessageRepository;
import com.omniagent.modules.social.domain.Channel;
import com.omniagent.modules.social.domain.ConnectedAccount;
import com.omniagent.modules.social.repository.ChannelRepository;
import com.omniagent.modules.social.repository.ConnectedAccountRepository;
import com.omniagent.modules.social.service.SocialAccountService;
import com.omniagent.modules.telegram.service.TelegramAdapter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class InboxService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final ChannelRepository channelRepository;
    private final ConnectedAccountRepository accountRepository;
    private final SocialAccountService socialAccountService;
    private final TelegramAdapter telegramAdapter;
    private final AiProviderRouter aiRouter;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public InboxService(
            ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            ChannelRepository channelRepository,
            ConnectedAccountRepository accountRepository,
            SocialAccountService socialAccountService,
            TelegramAdapter telegramAdapter,
            AiProviderRouter aiRouter) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.channelRepository = channelRepository;
        this.accountRepository = accountRepository;
        this.socialAccountService = socialAccountService;
        this.telegramAdapter = telegramAdapter;
        this.aiRouter = aiRouter;
    }

    @Transactional(readOnly = true)
    public List<Conversation> listConversations(UUID orgId) {
        return conversationRepository.findByOrganizationIdAndDeletedAtIsNullOrderByLastMessageAtDesc(orgId);
    }

    @Transactional(readOnly = true)
    public List<Message> getConversationMessages(UUID orgId, UUID conversationId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        if (!conv.getOrganizationId().equals(orgId)) {
            throw new BusinessRuleException("Unauthorized");
        }
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    @Transactional
    public Message recordInboundMessage(UUID orgId, UUID channelId, String externalSenderId, String senderName, String messageText) {
        Conversation conversation = conversationRepository
                .findByOrganizationIdAndChannelIdAndExternalSenderId(orgId, channelId, externalSenderId)
                .orElseGet(() -> {
                    Conversation c = new Conversation();
                    c.setOrganizationId(orgId);
                    c.setChannelId(channelId);
                    c.setExternalSenderId(externalSenderId);
                    c.setSenderName(senderName);
                    return c;
                });

        conversation.setLastMessageAt(Instant.now());
        conversation.setMessagingWindowExpiresAt(Instant.now().plus(24, ChronoUnit.HOURS)); // 24-hr window

        // AI Sentiment & Priority Triage
        try {
            String triagePrompt = "Analyze customer message sentiment (POSITIVE, NEUTRAL, NEGATIVE) and priority (LOW, MEDIUM, HIGH, URGENT):\n" + messageText;
            String schema = "{\"sentiment\": \"STRING\", \"priority\": \"STRING\"}";
            AiProviderResult triageResult = aiRouter.generateStructuredJson("You are a customer service triage analyzer.", triagePrompt, schema);
            JsonNode node = objectMapper.readTree(triageResult.content());
            conversation.setSentiment(node.path("sentiment").asText("NEUTRAL").toUpperCase());
            conversation.setPriority(node.path("priority").asText("MEDIUM").toUpperCase());
        } catch (Exception ignored) {}

        conversation = conversationRepository.save(conversation);

        Message message = new Message();
        message.setOrganizationId(orgId);
        message.setConversationId(conversation.getId());
        message.setDirection("INBOUND");
        message.setContentText(messageText);
        message.setAiGenerated(false);
        return messageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public String generateSuggestedReply(UUID orgId, UUID conversationId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        List<Message> history = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        StringBuilder chatContext = new StringBuilder();
        for (Message m : history) {
            chatContext.append(m.getDirection()).append(": ").append(m.getContentText()).append("\n");
        }

        String prompt = "Generate a polite, helpful customer service reply in the same language as the customer:\n" + chatContext;
        AiProviderResult result = aiRouter.generateText("You are an expert customer support agent.", prompt);
        return result.content();
    }

    @Transactional
    public Message sendReply(UUID orgId, UUID userId, UUID conversationId, String replyText) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conv.getOrganizationId().equals(orgId)) {
            throw new BusinessRuleException("Unauthorized");
        }

        Channel channel = channelRepository.findById(conv.getChannelId())
                .orElseThrow(() -> new ResourceNotFoundException("Channel not found"));

        ConnectedAccount account = accountRepository.findById(channel.getConnectedAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        // If Telegram, send message to chat_id
        if ("TELEGRAM".equalsIgnoreCase(account.getPlatform())) {
            String botToken = socialAccountService.getDecryptedToken(account.getId());
            // In Telegram bot private chat, externalSenderId is user chat ID
            Channel targetChat = new Channel();
            targetChat.setExternalChannelId(conv.getExternalSenderId());
            telegramAdapter.publishPost(targetChat, botToken, new com.omniagent.modules.social.adapter.SocialPlatformAdapter.PublishPayload(replyText, List.of(), "TEXT"));
        }

        Message outbound = new Message();
        outbound.setOrganizationId(orgId);
        outbound.setConversationId(conv.getId());
        outbound.setDirection("OUTBOUND");
        outbound.setContentText(replyText);
        outbound.setSentByUserId(userId);
        outbound.setApprovalStatus("APPROVED");
        outbound = messageRepository.save(outbound);

        conv.setLastMessageAt(Instant.now());
        conversationRepository.save(conv);

        return outbound;
    }
}
