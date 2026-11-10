package com.omniagent.modules.meta.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.omniagent.modules.social.adapter.SocialPlatformAdapter;
import com.omniagent.modules.social.domain.Channel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.*;

@Service
public class MetaAdapter implements SocialPlatformAdapter {

    private static final Logger log = LoggerFactory.getLogger(MetaAdapter.class);
    private static final String GRAPH_API_BASE = "https://graph.facebook.com/v19.0/";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getPlatform() {
        return "META"; // Handles both INSTAGRAM and FACEBOOK
    }

    @Override
    public PublishResult publishPost(Channel channel, String accessToken, PublishPayload payload) {
        if ("IG_FEED".equalsIgnoreCase(channel.getChannelType())) {
            return publishToInstagram(channel.getExternalChannelId(), accessToken, payload);
        } else {
            return publishToFacebookPage(channel.getExternalChannelId(), accessToken, payload);
        }
    }

    private PublishResult publishToInstagram(String igUserId, String pageAccessToken, PublishPayload payload) {
        try {
            // Step 1: Create Container
            String containerUrl = GRAPH_API_BASE + igUserId + "/media";
            Map<String, Object> body = new HashMap<>();
            body.put("caption", payload.text());
            body.put("access_token", pageAccessToken);

            if (payload.mediaUrls() != null && !payload.mediaUrls().isEmpty()) {
                String mediaUrl = payload.mediaUrls().get(0);
                if ("VIDEO".equalsIgnoreCase(payload.mediaType())) {
                    body.put("media_type", "REELS");
                    body.put("video_url", mediaUrl);
                } else {
                    body.put("image_url", mediaUrl);
                }
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<String> containerResp = restTemplate.postForEntity(containerUrl, request, String.class);
            JsonNode containerJson = objectMapper.readTree(containerResp.getBody());
            String creationId = containerJson.path("id").asText();

            if (creationId.isEmpty()) {
                return new PublishResult(false, null, null, containerResp.getBody(), "Failed to create Instagram container");
            }

            // Step 2: Publish Container
            String publishUrl = GRAPH_API_BASE + igUserId + "/media_publish";
            Map<String, Object> pubBody = new HashMap<>();
            pubBody.put("creation_id", creationId);
            pubBody.put("access_token", pageAccessToken);

            ResponseEntity<String> pubResp = restTemplate.postForEntity(publishUrl, new HttpEntity<>(pubBody, headers), String.class);
            JsonNode pubJson = objectMapper.readTree(pubResp.getBody());
            String mediaId = pubJson.path("id").asText();

            if (!mediaId.isEmpty()) {
                return new PublishResult(true, mediaId, "https://www.instagram.com/p/" + mediaId, pubResp.getBody(), null);
            } else {
                return new PublishResult(false, null, null, pubResp.getBody(), "Instagram media_publish failed");
            }
        } catch (Exception e) {
            log.error("Meta Instagram publishing error: {}", e.getMessage());
            return new PublishResult(false, null, null, null, e.getMessage());
        }
    }

    private PublishResult publishToFacebookPage(String pageId, String pageAccessToken, PublishPayload payload) {
        try {
            String url = GRAPH_API_BASE + pageId + "/feed";
            Map<String, Object> body = new HashMap<>();
            body.put("message", payload.text());
            body.put("access_token", pageAccessToken);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            String postId = root.path("id").asText();

            if (!postId.isEmpty()) {
                return new PublishResult(true, postId, "https://www.facebook.com/" + postId, response.getBody(), null);
            } else {
                return new PublishResult(false, null, null, response.getBody(), "Facebook post creation failed");
            }
        } catch (Exception e) {
            log.error("Meta Facebook Page publishing error: {}", e.getMessage());
            return new PublishResult(false, null, null, null, e.getMessage());
        }
    }

    @Override
    public boolean verifyHealth(String accessToken) {
        try {
            String url = GRAPH_API_BASE + "me?access_token=" + accessToken;
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public List<DiscoveredChannel> fetchChannels(String userAccessToken) {
        List<DiscoveredChannel> channels = new ArrayList<>();
        try {
            // Query Facebook Pages & linked Instagram Accounts
            String url = GRAPH_API_BASE + "me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&access_token=" + userAccessToken;
            ResponseEntity<String> response = restTemplate.getForEntity(URI.create(url), String.class);
            JsonNode root = objectMapper.readTree(response.getBody());

            JsonNode data = root.path("data");
            if (data.isArray()) {
                for (JsonNode page : data) {
                    String pageId = page.path("id").asText();
                    String pageName = page.path("name").asText();
                    channels.add(new DiscoveredChannel(pageId, pageName, "FB_PAGE", page.toString()));

                    JsonNode ig = page.path("instagram_business_account");
                    if (!ig.isMissingNode() && !ig.path("id").asText().isEmpty()) {
                        String igId = ig.path("id").asText();
                        String igUsername = ig.path("username").asText(pageName + " (IG)");
                        channels.add(new DiscoveredChannel(igId, igUsername, "IG_FEED", ig.toString()));
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Could not fetch Meta channels: {}", e.getMessage());
        }
        return channels;
    }
}
