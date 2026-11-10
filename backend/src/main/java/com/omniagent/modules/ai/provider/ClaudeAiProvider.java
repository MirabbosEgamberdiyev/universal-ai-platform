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
public class ClaudeAiProvider implements AiProvider {

    private static final Logger log = LoggerFactory.getLogger(ClaudeAiProvider.class);
    private static final String ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

    private final String apiKey;
    private final String model;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ClaudeAiProvider(
            @Value("${omniagent.ai.claude.api-key:}") String apiKey,
            @Value("${omniagent.ai.claude.model:claude-3-5-sonnet-20241022}") String model) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.model = model;
    }

    @Override
    public String getProviderName() {
        return "CLAUDE";
    }

    @Override
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isEmpty() && !apiKey.startsWith("test-");
    }

    public boolean isKeyValid(String key) {
        return key != null && !key.trim().isEmpty() && !key.startsWith("test-");
    }

    @Override
    public AiProviderResult generateText(String systemInstruction, String userPrompt) {
        return generateText(systemInstruction, userPrompt, null);
    }

    @Override
    public AiProviderResult generateText(String systemInstruction, String userPrompt, String apiKeyOverride) {
        String effectiveKey = (apiKeyOverride != null && !apiKeyOverride.isBlank()) ? apiKeyOverride.trim() : this.apiKey;
        return executeClaude(systemInstruction, userPrompt, false, effectiveKey);
    }

    @Override
    public AiProviderResult generateStructuredJson(String systemInstruction, String userPrompt, String jsonSchemaDescription) {
        return generateStructuredJson(systemInstruction, userPrompt, jsonSchemaDescription, null);
    }

    @Override
    public AiProviderResult generateStructuredJson(String systemInstruction, String userPrompt, String jsonSchemaDescription, String apiKeyOverride) {
        String effectiveKey = (apiKeyOverride != null && !apiKeyOverride.isBlank()) ? apiKeyOverride.trim() : this.apiKey;
        String enrichedPrompt = userPrompt + "\n\nCRITICAL: Respond ONLY with valid, parseable JSON conforming to this schema. Do not include markdown codeblocks or extra text:\n" + jsonSchemaDescription;
        return executeClaude(systemInstruction, enrichedPrompt, true, effectiveKey);
    }

    private AiProviderResult executeClaude(String systemInstruction, String prompt, boolean jsonMode, String effectiveKey) {
        if (!isKeyValid(effectiveKey)) {
            return new AiProviderResult(false, null, 0, 0, model, "Claude API key is not configured for this organization");
        }

        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("max_tokens", 2048);
            requestBody.put("temperature", 0.7);

            if (systemInstruction != null && !systemInstruction.isBlank()) {
                requestBody.put("system", systemInstruction);
            }

            requestBody.put("messages", List.of(
                    Map.of("role", "user", "content", prompt)
            ));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", effectiveKey);
            headers.set("anthropic-version", "2023-06-01");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(ANTHROPIC_API_URL, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());

            JsonNode contentArr = root.path("content");
            if (contentArr.isArray() && !contentArr.isEmpty()) {
                String text = contentArr.get(0).path("text").asText();
                if (jsonMode) {
                    text = cleanJsonMarkdown(text);
                }
                int inputTokens = root.path("usage").path("input_tokens").asInt(0);
                int outputTokens = root.path("usage").path("output_tokens").asInt(0);

                return new AiProviderResult(true, text, inputTokens, outputTokens, model, null);
            } else {
                return new AiProviderResult(false, null, 0, 0, model, "Claude returned empty content");
            }
        } catch (Exception e) {
            log.error("Claude API call failed: {}", e.getMessage());
            return new AiProviderResult(false, null, 0, 0, model, e.getMessage());
        }
    }

    private String cleanJsonMarkdown(String raw) {
        if (raw == null) return "{}";
        String trimmed = raw.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }
}
