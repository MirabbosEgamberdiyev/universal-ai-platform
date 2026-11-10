package com.omniagent.modules.social.adapter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.omniagent.modules.social.domain.Channel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class YouTubeAdapter implements SocialPlatformAdapter {

    private static final Logger log = LoggerFactory.getLogger(YouTubeAdapter.class);
    private static final String YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3/";
    private static final String YOUTUBE_UPLOAD_BASE = "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String getPlatform() {
        return "YOUTUBE";
    }

    @Override
    public PublishResult publishPost(Channel channel, String accessToken, PublishPayload payload) {
        if (payload.mediaUrls() == null || payload.mediaUrls().isEmpty()) {
            return new PublishResult(false, null, null, null, "YouTube requires a video attachment for publication");
        }

        try {
            // Prepare snippet & status
            String videoTitle = extractTitle(payload.text());
            String videoDescription = payload.text();

            Map<String, Object> snippet = new HashMap<>();
            snippet.put("title", videoTitle);
            snippet.put("description", videoDescription);
            snippet.put("categoryId", "22"); // People & Blogs default
            snippet.put("tags", extractTags(payload.text()));

            Map<String, Object> status = new HashMap<>();
            status.put("privacyStatus", "public"); // public, unlisted, private

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("snippet", snippet);
            requestBody.put("status", status);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.info("Initializing YouTube resumable upload for channel: {}", channel.getTitle());

            ResponseEntity<String> response = restTemplate.postForEntity(YOUTUBE_UPLOAD_BASE, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());

            String videoId = root.path("id").asText();
            if (!videoId.isEmpty()) {
                String videoUrl = "https://www.youtube.com/watch?v=" + videoId;
                return new PublishResult(true, videoId, videoUrl, response.getBody(), null);
            } else {
                List<String> locationHeader = response.getHeaders().get("Location");
                if (locationHeader != null && !locationHeader.isEmpty()) {
                    String location = locationHeader.get(0);
                    return new PublishResult(false, null, null, response.getBody(), "Resumable session created at " + location + ", binary stream pending");
                }
                return new PublishResult(false, null, null, response.getBody(), "YouTube upload initiation failed: No video ID returned");
            }
        } catch (Exception e) {
            log.error("YouTube publication failed: {}", e.getMessage());
            return new PublishResult(false, null, null, null, "YouTube publication error: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyHealth(String accessToken) {
        try {
            String url = YOUTUBE_API_BASE + "channels?part=snippet&mine=true";
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<?> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public List<DiscoveredChannel> fetchChannels(String accessToken) {
        List<DiscoveredChannel> channels = new ArrayList<>();
        try {
            String url = YOUTUBE_API_BASE + "channels?part=snippet,contentDetails&mine=true";
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            HttpEntity<?> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode items = root.path("items");

            if (items.isArray()) {
                for (JsonNode item : items) {
                    String channelId = item.path("id").asText();
                    String title = item.path("snippet").path("title").asText("My YouTube Channel");
                    channels.add(new DiscoveredChannel(channelId, title, "YOUTUBE_CHANNEL", item.toString()));
                }
            }
        } catch (Exception e) {
            log.warn("Could not fetch YouTube channels: {}", e.getMessage());
        }
        return channels;
    }

    private String extractTitle(String text) {
        if (text == null || text.isBlank()) return "New Video";
        String firstLine = text.split("\n")[0];
        if (firstLine.length() > 95) {
            return firstLine.substring(0, 95) + "...";
        }
        return firstLine;
    }

    private List<String> extractTags(String text) {
        List<String> tags = new ArrayList<>();
        if (text == null) return tags;
        for (String word : text.split("\\s+")) {
            if (word.startsWith("#") && word.length() > 1) {
                tags.add(word.substring(1).replaceAll("[^a-zA-Z0-9_]", ""));
            }
        }
        return tags;
    }
}
