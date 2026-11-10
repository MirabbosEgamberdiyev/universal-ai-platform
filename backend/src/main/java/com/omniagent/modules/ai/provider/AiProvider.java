package com.omniagent.modules.ai.provider;

public interface AiProvider {

    String getProviderName();

    boolean isConfigured();

    AiProviderResult generateText(String systemInstruction, String userPrompt);

    default AiProviderResult generateText(String systemInstruction, String userPrompt, String apiKeyOverride) {
        return generateText(systemInstruction, userPrompt);
    }

    AiProviderResult generateStructuredJson(String systemInstruction, String userPrompt, String jsonSchemaDescription);

    default AiProviderResult generateStructuredJson(String systemInstruction, String userPrompt, String jsonSchemaDescription, String apiKeyOverride) {
        return generateStructuredJson(systemInstruction, userPrompt, jsonSchemaDescription);
    }

    record AiProviderResult(
            boolean success,
            String content,
            int promptTokens,
            int completionTokens,
            String modelUsed,
            String errorMessage
    ) {}
}
