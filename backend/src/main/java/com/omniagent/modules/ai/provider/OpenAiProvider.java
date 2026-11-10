package com.omniagent.modules.ai.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Component
public class OpenAiProvider implements AiProvider {

    private static final Logger log = LoggerFactory.getLogger(OpenAiProvider.class);
    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    private final String apiKey;
    private final String model;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OpenAiProvider(
            @Value("${omniagent.ai.openai.api-key:}") String apiKey,
            @Value("${omniagent.ai.openai.model:gpt-4o}") String model) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.model = model;
    }

    @Override
    public String getProviderName() {
        return "OPENAI";
    }

    @Override
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isEmpty() && !apiKey.startsWith("test-");
    }

    @Override
    public AiProviderResult generateText(String systemInstruction, String userPrompt) {
        return executeOpenAi(systemInstruction, userPrompt, false);
    }

    @Override
    public AiProviderResult generateStructuredJson(String systemInstruction, String userPrompt, String jsonSchemaDescription) {
        String enrichedPrompt = userPrompt + "\n\nOutput MUST be valid JSON adhering strictly to:\n" + jsonSchemaDescription;
        return executeOpenAi(systemInstruction, enrichedPrompt, true);
    }

    private AiProviderResult executeOpenAi(String systemInstruction, String prompt, boolean jsonMode) {
        if (!isConfigured()) {
            return new AiProviderResult(false, null, 0, 0, model, "OpenAI API key is not configured");
        }

        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("temperature", 0.7);

            List<Map<String, String>> messages = new ArrayList<>();
            if (systemInstruction != null && !systemInstruction.isBlank()) {
                messages.add(Map.of("role", "system", "content", systemInstruction));
            }
            messages.add(Map.of("role", "user", "content", prompt));
            requestBody.put("messages", messages);

            if (jsonMode) {
                requestBody.put("response_format", Map.of("type", "json_object"));
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(OPENAI_API_URL, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());

            JsonNode choices = root.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                String content = choices.get(0).path("message").path("content").asText();
                int promptTokens = root.path("usage").path("prompt_tokens").asInt(0);
                int completionTokens = root.path("usage").path("completion_tokens").asInt(0);

                return new AiProviderResult(true, content, promptTokens, completionTokens, model, null);
            } else {
                return new AiProviderResult(false, null, 0, 0, model, "OpenAI returned empty choices");
            }
        } catch (Exception e) {
            log.error("OpenAI API call failed: {}", e.getMessage());
            return new AiProviderResult(false, null, 0, 0, model, e.getMessage());
        }
    }
}
