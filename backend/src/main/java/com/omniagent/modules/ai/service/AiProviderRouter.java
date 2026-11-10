package com.omniagent.modules.ai.service;

import com.omniagent.modules.ai.provider.AiProvider;
import com.omniagent.modules.ai.provider.AiProvider.AiProviderResult;
import com.omniagent.modules.ai.provider.ClaudeAiProvider;
import com.omniagent.modules.ai.provider.GeminiAiProvider;
import com.omniagent.modules.ai.provider.OpenAiProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AiProviderRouter {

    private static final Logger log = LoggerFactory.getLogger(AiProviderRouter.class);

    private final GeminiAiProvider geminiProvider;
    private final ClaudeAiProvider claudeProvider;
    private final OpenAiProvider openAiProvider;
    private final String configuredPrimary;

    public AiProviderRouter(
            GeminiAiProvider geminiProvider,
            ClaudeAiProvider claudeProvider,
            OpenAiProvider openAiProvider,
            @Value("${omniagent.ai.primary-provider:GEMINI}") String configuredPrimary) {
        this.geminiProvider = geminiProvider;
        this.claudeProvider = claudeProvider;
        this.openAiProvider = openAiProvider;
        this.configuredPrimary = (configuredPrimary != null) ? configuredPrimary.toUpperCase() : "GEMINI";
    }

    public List<AiProvider> getOrderedProviders() {
        List<AiProvider> ordered = new ArrayList<>();
        if ("CLAUDE".equals(configuredPrimary)) {
            ordered.add(claudeProvider);
            ordered.add(geminiProvider);
            ordered.add(openAiProvider);
        } else if ("OPENAI".equals(configuredPrimary)) {
            ordered.add(openAiProvider);
            ordered.add(geminiProvider);
            ordered.add(claudeProvider);
        } else {
            // Default GEMINI first
            ordered.add(geminiProvider);
            ordered.add(claudeProvider);
            ordered.add(openAiProvider);
        }
        return ordered;
    }

    public AiProviderResult generateText(String systemInstruction, String userPrompt) {
        List<AiProvider> providers = getOrderedProviders();

        for (AiProvider provider : providers) {
            if (provider.isConfigured()) {
                AiProviderResult result = provider.generateText(systemInstruction, userPrompt);
                if (result.success()) {
                    return result;
                }
                log.warn("AI Provider {} failed: {}. Trying next provider.", provider.getProviderName(), result.errorMessage());
            }
        }

        log.warn("No active AI provider configured or available. Returning PROVIDER_NOT_CONFIGURED.");
        return new AiProviderResult(false, null, 0, 0, null, "AI_PROVIDER_NOT_CONFIGURED: Please configure GEMINI_API_KEY, CLAUDE_API_KEY, or OPENAI_API_KEY in Settings.");
    }

    public AiProviderResult generateStructuredJson(String systemInstruction, String userPrompt, String schema) {
        List<AiProvider> providers = getOrderedProviders();

        for (AiProvider provider : providers) {
            if (provider.isConfigured()) {
                AiProviderResult result = provider.generateStructuredJson(systemInstruction, userPrompt, schema);
                if (result.success()) {
                    return result;
                }
                log.warn("AI Provider {} structured JSON failed: {}. Trying next provider.", provider.getProviderName(), result.errorMessage());
            }
        }

        log.warn("No active AI provider configured for structured JSON. Returning PROVIDER_NOT_CONFIGURED.");
        return new AiProviderResult(false, null, 0, 0, null, "AI_PROVIDER_NOT_CONFIGURED: Please configure GEMINI_API_KEY, CLAUDE_API_KEY, or OPENAI_API_KEY in Settings.");
    }

    public AiProviderResult generateStructuredJson(
            String systemInstruction,
            String userPrompt,
            String schema,
            String tenantGeminiKey,
            String tenantClaudeKey,
            String tenantOpenaiKey,
            String tenantPreferredProvider) {

        String primary = (tenantPreferredProvider != null && !tenantPreferredProvider.isBlank())
                ? tenantPreferredProvider.toUpperCase() : configuredPrimary;

        List<ProviderWithKey> list = new ArrayList<>();
        if ("CLAUDE".equals(primary)) {
            list.add(new ProviderWithKey(claudeProvider, tenantClaudeKey));
            list.add(new ProviderWithKey(geminiProvider, tenantGeminiKey));
            list.add(new ProviderWithKey(openAiProvider, tenantOpenaiKey));
        } else if ("OPENAI".equals(primary)) {
            list.add(new ProviderWithKey(openAiProvider, tenantOpenaiKey));
            list.add(new ProviderWithKey(geminiProvider, tenantGeminiKey));
            list.add(new ProviderWithKey(claudeProvider, tenantClaudeKey));
        } else {
            list.add(new ProviderWithKey(geminiProvider, tenantGeminiKey));
            list.add(new ProviderWithKey(claudeProvider, tenantClaudeKey));
            list.add(new ProviderWithKey(openAiProvider, tenantOpenaiKey));
        }

        for (ProviderWithKey item : list) {
            boolean hasCustomKey = item.key != null && !item.key.isBlank();
            boolean hasPlatformDefault = item.provider.isConfigured();
            if (hasCustomKey || hasPlatformDefault) {
                AiProviderResult result = item.provider.generateStructuredJson(systemInstruction, userPrompt, schema, item.key);
                if (result.success()) {
                    return result;
                }
                log.warn("AI Provider {} failed for tenant: {}. Trying next provider.", item.provider.getProviderName(), result.errorMessage());
            }
        }

        return generateStructuredJson(systemInstruction, userPrompt, schema);
    }

    private record ProviderWithKey(AiProvider provider, String key) {}

    public boolean isAnyProviderConfigured() {
        return geminiProvider.isConfigured() || claudeProvider.isConfigured() || openAiProvider.isConfigured();
    }
}
