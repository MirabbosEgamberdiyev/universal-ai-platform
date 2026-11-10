package com.omniagent.modules.telegram.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.omniagent.modules.social.adapter.SocialPlatformAdapter;
import com.omniagent.modules.social.domain.Channel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class TelegramAdapter implements SocialPlatformAdapter {

    private static final Logger log = LoggerFactory.getLogger(TelegramAdapter.class);
    private static final String TELEGRAM_API_BASE = "https://api.telegram.org/bot";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getPlatform() {
        return "TELEGRAM";
    }

    @Override
    public PublishResult publishPost(Channel channel, String botToken, PublishPayload payload) {
        String url;
        Map<String, Object> body = new HashMap<>();
        body.put("chat_id", channel.getExternalChannelId());

        try {
            if (payload.mediaUrls() != null && !payload.mediaUrls().isEmpty()) {
                if (payload.mediaUrls().size() == 1) {
                    String mediaUrl = payload.mediaUrls().get(0);
                    if ("VIDEO".equalsIgnoreCase(payload.mediaType())) {
                        url = TELEGRAM_API_BASE + botToken + "/sendVideo";
                        body.put("video", mediaUrl);
                    } else {
                        url = TELEGRAM_API_BASE + botToken + "/sendPhoto";
                        body.put("photo", mediaUrl);
                    }
                    body.put("caption", payload.text());
                } else {
                    // Media group (album)
                    url = TELEGRAM_API_BASE + botToken + "/sendMediaGroup";
                    List<Map<String, Object>> mediaList = new ArrayList<>();
                    for (int i = 0; i < payload.mediaUrls().size(); i++) {
                        Map<String, Object> item = new HashMap<>();
                        item.put("type", "photo");
                        item.put("media", payload.mediaUrls().get(i));
                        if (i == 0) {
                            item.put("caption", payload.text());
                        }
                        mediaList.add(item);
                    }
                    body.put("media", mediaList);
                }
            } else {
                // Pure text
                url = TELEGRAM_API_BASE + botToken + "/sendMessage";
                body.put("text", payload.text());
                body.put("parse_mode", "HTML");
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());

            if (root.path("ok").asBoolean(false)) {
                String messageId = root.path("result").path("message_id").asText();
                String chatUsername = root.path("result").path("chat").path("username").asText("");
                String postUrl = !chatUsername.isEmpty() 
                        ? "https://t.me/" + chatUsername + "/" + messageId
                        : null;

                return new PublishResult(true, messageId, postUrl, response.getBody(), null);
            } else {
                String errorDescription = root.path("description").asText("Telegram publication failed");
                return new PublishResult(false, null, null, response.getBody(), errorDescription);
            }
        } catch (Exception e) {
            log.error("Failed to publish to Telegram channel: {}", e.getMessage());
            return new PublishResult(false, null, null, null, e.getMessage());
        }
    }

    @Override
    public boolean verifyHealth(String botToken) {
        try {
            String url = TELEGRAM_API_BASE + botToken + "/getMe";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("ok").asBoolean(false);
        } catch (Exception e) {
            return false;
        }
    }

    public BotInfo getBotInfo(String botToken) {
        try {
            String url = TELEGRAM_API_BASE + botToken + "/getMe";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            if (root.path("ok").asBoolean(false)) {
                JsonNode res = root.path("result");
                return new BotInfo(
                        res.path("id").asText(),
                        res.path("first_name").asText(),
                        res.path("username").asText(),
                        true
                );
            }
        } catch (Exception ignored) {}
        return new BotInfo(null, null, null, false);
    }

    @Override
    public List<DiscoveredChannel> fetchChannels(String botToken) {
        // Telegram Bot API does not expose getMyChannels directly,
        // channels are added when the bot is made administrator or receives an update.
        return Collections.emptyList();
    }

    public record BotInfo(String id, String firstName, String username, boolean valid) {}
}
