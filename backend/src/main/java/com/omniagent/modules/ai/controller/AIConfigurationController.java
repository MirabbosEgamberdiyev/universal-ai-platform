package com.omniagent.modules.ai.controller;

import com.omniagent.common.security.TenantContext;
import com.omniagent.modules.ai.provider.ClaudeAiProvider;
import com.omniagent.modules.ai.provider.GeminiAiProvider;
import com.omniagent.modules.ai.provider.OpenAiProvider;
import com.omniagent.modules.ai.service.AiProviderRouter;
import com.omniagent.modules.iam.service.OrganizationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/ai")
@Tag(name = "AI Engine Configuration & Testing", description = "AI provayderlarini boshqarish va jonli aloqani tekshirish")
public class AIConfigurationController {

    private static final Logger log = LoggerFactory.getLogger(AIConfigurationController.class);

    private final GeminiAiProvider geminiProvider;
    private final ClaudeAiProvider claudeProvider;
    private final OpenAiProvider openAiProvider;
    private final OrganizationService organizationService;

    public record UpdateAIConfigRequest(String provider, String apiKey, String brandVoicePrompt) {}
    public record TestAIConnectionRequest(String provider, String apiKey) {}

    public AIConfigurationController(
            GeminiAiProvider geminiProvider,
            ClaudeAiProvider claudeProvider,
            OpenAiProvider openAiProvider,
            OrganizationService organizationService) {
        this.geminiProvider = geminiProvider;
        this.claudeProvider = claudeProvider;
        this.openAiProvider = openAiProvider;
        this.organizationService = organizationService;
    }

    private String maskKey(String key) {
        if (key == null || key.isBlank() || key.length() < 8) return "Kiritilmagan";
        return key.substring(0, 6) + "..." + key.substring(key.length() - 4);
    }

    @GetMapping("/config")
    @Operation(summary = "Faol AI provayderi va mavjud modellar holatini olish")
    public ResponseEntity<Map<String, Object>> getAIConfig() {
        UUID orgId = TenantContext.getCurrentTenant();
        if (orgId != null) {
            try {
                return ResponseEntity.ok(organizationService.getAiConfig(orgId));
            } catch (Exception e) {
                log.warn("Could not retrieve org AI config: {}", e.getMessage());
            }
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("geminiConfigured", geminiProvider.isConfigured());
        resp.put("hasCustomGeminiKey", false);
        resp.put("claudeConfigured", claudeProvider.isConfigured());
        resp.put("hasCustomClaudeKey", false);
        resp.put("openaiConfigured", openAiProvider.isConfigured());
        resp.put("hasCustomOpenaiKey", false);
        resp.put("preferredProvider", "GEMINI");
        resp.put("brandVoicePrompt", "");
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/config")
    @Operation(summary = "AI provayderini va API kalitini yangilash")
    public ResponseEntity<Map<String, Object>> updateAIConfig(@RequestBody UpdateAIConfigRequest req) {
        UUID orgId = TenantContext.getCurrentTenant();
        Map<String, String> body = new HashMap<>();
        if (req.provider() != null) {
            body.put("preferredProvider", req.provider());
        }
        if (req.apiKey() != null && !req.apiKey().isBlank()) {
            String p = req.provider() != null ? req.provider().toUpperCase() : "GEMINI";
            if (p.contains("GEMINI")) {
                body.put("geminiApiKey", req.apiKey().trim());
            } else if (p.contains("CLAUDE") || p.contains("ANTHROPIC")) {
                body.put("claudeApiKey", req.apiKey().trim());
            } else if (p.contains("OPENAI") || p.contains("GPT")) {
                body.put("openaiApiKey", req.apiKey().trim());
            }
        }
        if (req.brandVoicePrompt() != null) {
            body.put("brandVoicePrompt", req.brandVoicePrompt());
        }

        if (orgId != null) {
            return ResponseEntity.ok(organizationService.updateAiConfig(orgId, body));
        }
        return getAIConfig();
    }

    @PostMapping("/test")
    @Operation(summary = "AI provayderi bilan aloqani jonli tekshirish (Latency va Test javobi)")
    public ResponseEntity<Map<String, Object>> testAIConnection(@RequestBody(required = false) TestAIConnectionRequest req) {
        UUID orgId = TenantContext.getCurrentTenant();
        String provider = req != null && req.provider() != null ? req.provider() : "GEMINI";
        String apiKey = req != null ? req.apiKey() : null;

        Map<String, Object> result = organizationService.testAiConnection(orgId, provider, apiKey);
        return ResponseEntity.ok(result);
    }
}
