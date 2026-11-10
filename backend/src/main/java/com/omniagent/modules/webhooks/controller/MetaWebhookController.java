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

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Optional;

/**
 * Enterprise Meta Webhook Controller for Instagram Graph & Facebook Webhooks.
 * Implements Hub Challenge Handshake and HMAC-SHA256 Payload Signature Verification.
 */
@RestController
@RequestMapping("/api/v1/webhooks/meta")
public class MetaWebhookController {

    private static final Logger log = LoggerFactory.getLogger(MetaWebhookController.class);

    private final ChannelRepository channelRepository;
    private final InboxService inboxService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${omniagent.meta.webhook-verify-token:omniagent_meta_verify_2026}")
    private String configuredVerifyToken;

    @Value("${omniagent.meta.app-secret:}")
    private String metaAppSecret;

    public MetaWebhookController(ChannelRepository channelRepository, InboxService inboxService) {
        this.channelRepository = channelRepository;
        this.inboxService = inboxService;
    }

    /**
     * Meta Webhook Subscription Verification Handshake (GET).
     */
    @GetMapping
    public ResponseEntity<String> verifySubscription(
            @RequestParam(value = "hub.mode", required = false) String mode,
            @RequestParam(value = "hub.verify_token", required = false) String verifyToken,
            @RequestParam(value = "hub.challenge", required = false) String challenge) {

        log.info("Meta webhook verification challenge received: mode={}, token={}", mode, verifyToken);

        if ("subscribe".equals(mode) && configuredVerifyToken.equals(verifyToken)) {
            log.info("Meta webhook verification successful. Returning hub.challenge.");
            return ResponseEntity.ok(challenge);
        }

        log.warn("Meta webhook verification rejected: token mismatch or invalid mode.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Verification token mismatch");
    }

    /**
     * Inbound Meta Event Delivery (POST).
     */
    @PostMapping
    public ResponseEntity<String> handleInboundEvent(
            @RequestHeader(value = "X-Hub-Signature-256", required = false) String signatureHeader,
            @RequestBody String rawPayload) {

        // 1. Verify HMAC-SHA256 signature if App Secret is configured
        if (metaAppSecret != null && !metaAppSecret.isBlank()) {
            if (signatureHeader == null || !isValidSignature(rawPayload, signatureHeader, metaAppSecret)) {
                log.warn("Rejected Meta webhook with invalid HMAC-SHA256 signature!");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid signature");
            }
        }

        // 2. Parse payload
        try {
            JsonNode root = objectMapper.readTree(rawPayload);
            String objectType = root.path("object").asText("");
            log.info("Processing Meta webhook payload for object type: {}", objectType);

            JsonNode entries = root.path("entry");
            if (entries.isArray()) {
                for (JsonNode entry : entries) {
                    processEntry(entry);
                }
            }

            return ResponseEntity.ok("EVENT_RECEIVED");
        } catch (Exception e) {
            log.error("Failed to parse Meta webhook payload: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Malformed payload");
        }
    }

    private void processEntry(JsonNode entry) {
        // Handle messaging events (Instagram Direct or Messenger)
        JsonNode messaging = entry.path("messaging");
        if (messaging.isArray()) {
            for (JsonNode msgEvent : messaging) {
                String senderId = msgEvent.path("sender").path("id").asText(null);
                String recipientId = msgEvent.path("recipient").path("id").asText(null);
                String text = msgEvent.path("message").path("text").asText(null);

                if (recipientId != null && senderId != null && text != null) {
                    Optional<Channel> channelOpt = channelRepository.findFirstByExternalChannelId(recipientId);
                    if (channelOpt.isPresent()) {
                        Channel channel = channelOpt.get();
                        inboxService.recordInboundMessage(
                                channel.getOrganizationId(),
                                channel.getId(),
                                senderId,
                                "Instagram User " + senderId.substring(Math.max(0, senderId.length() - 4)),
                                text
                        );
                        log.info("Inbound Meta direct message logged for channel: {}", channel.getTitle());
                    }
                }
            }
        }

        // Handle changes events (Feed comments / mentions)
        JsonNode changes = entry.path("changes");
        if (changes.isArray()) {
            for (JsonNode change : changes) {
                String field = change.path("field").asText("");
                JsonNode value = change.path("value");
                if ("comments".equals(field) || "feed".equals(field)) {
                    log.info("Meta change event: field={}, value={}", field, value.toPrettyString());
                }
            }
        }
    }

    private boolean isValidSignature(String payload, String signatureHeader, String appSecret) {
        if (!signatureHeader.startsWith("sha256=")) {
            return false;
        }
        String expectedHash = signatureHeader.substring("sha256=".length());
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(appSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] calculated = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : calculated) {
                sb.append(String.format("%02x", b));
            }
            return MessageDigest.isEqual(sb.toString().getBytes(StandardCharsets.UTF_8), expectedHash.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            log.error("HMAC verification calculation error: {}", e.getMessage());
            return false;
        }
    }
}
