package com.omniagent.modules.ai.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Component
public class GeminiAiProvider implements AiProvider {

    private static final Logger log = LoggerFactory.getLogger(GeminiAiProvider.class);
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/";

    private static final List<String> CANDIDATE_MODELS = List.of(
            "gemini-flash-lite-latest",
            "gemini-3.5-flash-lite",
            "gemini-3.5-flash",
            "gemini-flash-latest",
            "gemini-3.8-flash"
    );

    private final String defaultApiKey;
    private final String defaultModel;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GeminiAiProvider(
            @Value("${omniagent.ai.gemini.api-key:}") String defaultApiKey,
            @Value("${omniagent.ai.gemini.model:gemini-flash-lite-latest}") String defaultModel) {
        this.defaultApiKey = defaultApiKey != null ? defaultApiKey.trim() : "";
        this.defaultModel = (defaultModel != null && !defaultModel.isBlank()) ? defaultModel : "gemini-flash-lite-latest";
    }

    @Override
    public String getProviderName() {
        return "GEMINI";
    }

    @Override
    public boolean isConfigured() {
        return defaultApiKey != null && !defaultApiKey.isEmpty() && !defaultApiKey.startsWith("test-");
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
        String effectiveKey = (apiKeyOverride != null && !apiKeyOverride.isBlank()) ? apiKeyOverride.trim() : this.defaultApiKey;
        return executeGeminiWithFailover(systemInstruction, userPrompt, false, effectiveKey);
    }

    @Override
    public AiProviderResult generateStructuredJson(String systemInstruction, String userPrompt, String jsonSchemaDescription) {
        return generateStructuredJson(systemInstruction, userPrompt, jsonSchemaDescription, null);
    }

    @Override
    public AiProviderResult generateStructuredJson(String systemInstruction, String userPrompt, String jsonSchemaDescription, String apiKeyOverride) {
        String effectiveKey = (apiKeyOverride != null && !apiKeyOverride.isBlank()) ? apiKeyOverride.trim() : this.defaultApiKey;
        String enrichedPrompt = userPrompt + "\n\nCRITICAL: Respond ONLY with valid, parseable JSON conforming strictly to this schema. Do not enclose in markdown blocks:\n" + jsonSchemaDescription;
        return executeGeminiWithFailover(systemInstruction, enrichedPrompt, true, effectiveKey);
    }

    private AiProviderResult executeGeminiWithFailover(String systemInstruction, String prompt, boolean jsonMode, String apiKey) {
        if (!isKeyValid(apiKey)) {
            return new AiProviderResult(false, null, 0, 0, defaultModel, "Gemini API key is not configured for this organization");
        }

        List<String> modelsToTry = new ArrayList<>();
        if (!CANDIDATE_MODELS.contains(defaultModel)) {
            modelsToTry.add(defaultModel);
        }
        modelsToTry.addAll(CANDIDATE_MODELS);

        String lastError = "No response from Gemini";

        for (int i = 0; i < modelsToTry.size(); i++) {
            String model = modelsToTry.get(i);
            try {
                return callSingleGemini(systemInstruction, prompt, jsonMode, apiKey, model);
            } catch (HttpClientErrorException.NotFound | HttpServerErrorException.ServiceUnavailable ex) {
                lastError = ex.getMessage();
                log.warn("Gemini model {} returned {}. Trying alternative model ({}/{})...",
                        model, ex.getStatusCode(), i + 1, modelsToTry.size());
                try {
                    Thread.sleep(400); // 400ms pause before failover
                } catch (InterruptedException ignored) {}
            } catch (Exception e) {
                lastError = e.getMessage();
                log.error("Gemini API invocation error on model {}: {}", model, e.getMessage());
                // Non-network / client errors break failover
                if (e.getMessage() != null && e.getMessage().contains("400")) {
                    return new AiProviderResult(false, null, 0, 0, model, e.getMessage());
                }
            }
        }

        return new AiProviderResult(false, null, 0, 0, defaultModel, "Gemini failover exhausted: " + lastError);
    }

    private AiProviderResult callSingleGemini(String systemInstruction, String prompt, boolean jsonMode, String apiKey, String targetModel) {
        String cleanModel = targetModel.replace("models/", "");
        String endpoint = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", cleanModel, apiKey);

        Map<String, Object> requestBody = new HashMap<>();

        // Combined prompt text (guarantees universal compatibility across all Gemini tiers)
        String combinedText = (systemInstruction != null && !systemInstruction.isBlank() ? systemInstruction + "\n\n" : "") + prompt;
        requestBody.put("contents", List.of(
                Map.of("role", "user", "parts", List.of(Map.of("text", combinedText)))
        ));

        // Generation Config
        Map<String, Object> genConfig = new HashMap<>();
        genConfig.put("temperature", 0.5);
        genConfig.put("topK", 40);
        genConfig.put("topP", 0.95);
        genConfig.put("maxOutputTokens", 8192);
        if (jsonMode) {
            genConfig.put("responseMimeType", "application/json");
        }
        requestBody.put("generationConfig", genConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-goog-api-key", apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);
        try {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                StringBuilder sb = new StringBuilder();
                if (parts.isArray()) {
                    for (JsonNode part : parts) {
                        if (part.hasNonNull("thought") && part.path("thought").asBoolean()) {
                            continue;
                        }
                        if (part.hasNonNull("text")) {
                            sb.append(part.path("text").asText());
                        }
                    }
                }
                String outputText = sb.toString().trim();
                if (outputText.isEmpty()) {
                    outputText = candidates.get(0).path("content").path("parts").get(0).path("text").asText();
                }
                if (jsonMode) {
                    outputText = cleanJsonMarkdown(outputText);
                }
                int promptTokens = root.path("usageMetadata").path("promptTokenCount").asInt(0);
                int candidateTokens = root.path("usageMetadata").path("candidatesTokenCount").asInt(0);

                return new AiProviderResult(true, outputText, promptTokens, candidateTokens, targetModel, null);
            } else {
                throw new IllegalStateException("Gemini returned empty candidates");
            }
        } catch (Exception parseEx) {
            throw new RuntimeException("Failed to parse Gemini response: " + parseEx.getMessage(), parseEx);
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
