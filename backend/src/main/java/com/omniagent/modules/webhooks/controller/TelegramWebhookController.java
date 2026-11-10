package com.omniagent.modules.webhooks.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.omniagent.modules.inbox.service.InboxService;
import com.omniagent.modules.social.domain.Channel;
import com.omniagent.modules.social.repository.ChannelRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * Enterprise Telegram Bot Webhook Controller.
 * Ingests inbound updates (channel posts, member messages, commands) with secret token verification.
 */
@RestController
@RequestMapping("/api/v1/webhooks/telegram")
public class TelegramWebhookController {

    private static final Logger log = LoggerFactory.getLogger(TelegramWebhookController.class);

    private final ChannelRepository channelRepository;
    private final InboxService inboxService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${omniagent.telegram.secret-token:}")
    private String configuredSecretToken;

    public TelegramWebhookController(ChannelRepository channelRepository, InboxService inboxService) {
        this.channelRepository = channelRepository;
        this.inboxService = inboxService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> handleUpdate(
            @RequestHeader(value = "X-Telegram-Bot-Api-Secret-Token", required = false) String secretToken,
            @RequestBody String rawPayload) {

        // 1. Verify Secret Token if configured
        if (configuredSecretToken != null && !configuredSecretToken.isBlank()) {
            if (secretToken == null || !configuredSecretToken.equals(secretToken)) {
                log.warn("Unauthorized Telegram webhook update received: invalid secret token!");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("ok", false, "error", "Invalid secret token"));
            }
        }

        // 2. Parse update
        try {
            JsonNode root = objectMapper.readTree(rawPayload);
            long updateId = root.path("update_id").asLong(0);

            // Handle direct user message or group message
            JsonNode message = root.path("message");
            if (!message.isMissingNode()) {
                processMessage(message, false);
            }

            // Handle channel post
            JsonNode channelPost = root.path("channel_post");
            if (!channelPost.isMissingNode()) {
                processMessage(channelPost, true);
            }

            return ResponseEntity.ok(Map.of("ok", true, "update_id", updateId));
        } catch (Exception e) {
            log.error("Failed to parse Telegram webhook update: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("ok", false, "error", "Malformed payload"));
        }
    }

    private void processMessage(JsonNode msgNode, boolean isChannelPost) {
        long chatId = msgNode.path("chat").path("id").asLong(0);
        String chatIdStr = String.valueOf(chatId);
        String text = msgNode.path("text").asText("");
        
        JsonNode from = msgNode.path("from");
        String senderId = from.isMissingNode() ? chatIdStr : String.valueOf(from.path("id").asLong());
        String senderName = from.isMissingNode() 
                ? (isChannelPost ? "Channel Post" : "Telegram User") 
                : (from.path("first_name").asText("") + " " + from.path("last_name").asText("")).trim();

        if (text.isBlank()) {
            text = msgNode.path("caption").asText("");
        }

        if (chatId != 0 && !text.isBlank()) {
            Optional<Channel> channelOpt = channelRepository.findFirstByExternalChannelId(chatIdStr);
            if (channelOpt.isPresent()) {
                Channel channel = channelOpt.get();
                inboxService.recordInboundMessage(
                        channel.getOrganizationId(),
                        channel.getId(),
                        senderId,
                        senderName.isBlank() ? "Telegram User " + senderId : senderName,
                        text
                );
                log.info("Telegram {} inbound message recorded for channel: {}", isChannelPost ? "channel" : "chat", channel.getTitle());
            } else {
                log.debug("Telegram update for unmapped chat ID: {}", chatIdStr);
            }
        }
    }
}
