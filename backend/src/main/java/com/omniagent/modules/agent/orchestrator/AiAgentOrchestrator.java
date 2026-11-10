package com.omniagent.modules.agent.orchestrator;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.omniagent.common.exception.BusinessRuleException;
import com.omniagent.modules.agent.approval.AiApproval;
import com.omniagent.modules.agent.approval.AiApprovalService;
import com.omniagent.modules.ai.provider.AiProvider.AiProviderResult;
import com.omniagent.modules.ai.service.AiProviderRouter;
import com.omniagent.modules.iam.domain.Organization;
import com.omniagent.modules.iam.repository.OrganizationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
public class AiAgentOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(AiAgentOrchestrator.class);

    private final AiProviderRouter aiRouter;
    private final AiExecutionRepository executionRepository;
    private final AiApprovalService approvalService;
    private final OrganizationRepository organizationRepository;
    private final com.omniagent.modules.vault.service.TokenVaultService tokenVaultService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiAgentOrchestrator(
            AiProviderRouter aiRouter,
            AiExecutionRepository executionRepository,
            AiApprovalService approvalService,
            OrganizationRepository organizationRepository,
            com.omniagent.modules.vault.service.TokenVaultService tokenVaultService) {
        this.aiRouter = aiRouter;
        this.executionRepository = executionRepository;
        this.approvalService = approvalService;
        this.organizationRepository = organizationRepository;
        this.tokenVaultService = tokenVaultService;
    }

    private String decryptKeySafely(String encryptedOrPlain) {
        if (encryptedOrPlain == null || encryptedOrPlain.isBlank()) return null;
        try {
            byte[] bytes = java.util.Base64.getDecoder().decode(encryptedOrPlain);
            String decrypted = tokenVaultService.decrypt(bytes);
            return decrypted != null ? decrypted : encryptedOrPlain;
        } catch (Exception e) {
            return encryptedOrPlain;
        }
    }

    @Transactional
    public AgentChatResponse processInstruction(UUID orgId, UUID userId, String instruction) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new BusinessRuleException("Organization not found"));

        String autonomyMode = org.getAutonomyMode() != null ? org.getAutonomyMode() : "OPERATOR";

        // 1. Build prompt for Intent Classification & Plan Generation
        String systemPrompt = """
                You are NovaSphere AI, the Smart Social Media Assistant.
                Your task is to analyze the user's natural language instruction (in Uzbek Latin, Uzbek Cyrillic, Russian, or English).
                Extract the intent, plan the multi-step execution, formulate high-quality social copy/content if required, identify target channels (Telegram, Instagram, YouTube), and determine if human approval is required.
                Supported intents: PUBLISH_POST, DRAFT_POST, CREATE_CAPTION, GENERATE_HASHTAGS, SCHEDULE_POST, ANALYZE_METRICS.
                Always preserve the linguistic tone, native script, and language of the user.
                """;

        String jsonSchema = """
                {
                  "intent": "STRING (e.g. PUBLISH_POST, DRAFT_REPLIES)",
                  "confidence": "FLOAT (0.0 to 1.0)",
                  "actionSummary": "STRING (human-readable summary of what will be done)",
                  "proposedContent": "STRING (the text or caption proposed for publication or reply)",
                  "targetPlatforms": ["ARRAY of STRINGS, e.g. TELEGRAM, INSTAGRAM, LINKEDIN"],
                  "scheduledTime": "STRING (ISO-8601 or null if immediate)",
                  "requiresApproval": "BOOLEAN"
                }
                """;

        String geminiKey = decryptKeySafely(org.getGeminiApiKey());
        String claudeKey = decryptKeySafely(org.getClaudeApiKey());
        String openaiKey = decryptKeySafely(org.getOpenaiApiKey());

        String brandGuidance = (org.getBrandVoicePrompt() != null && !org.getBrandVoicePrompt().isBlank())
                ? "\nSpecial Brand Voice Guidance: " + org.getBrandVoicePrompt() : "";

        AiProviderResult aiResult = aiRouter.generateStructuredJson(
                systemPrompt + brandGuidance,
                instruction,
                jsonSchema,
                geminiKey,
                claudeKey,
                openaiKey,
                org.getPreferredAiProvider()
        );

        if (aiResult == null || !aiResult.success() || aiResult.content() == null) {
            log.info("AI Provider is not configured or returned error. Providing helpful setup guidance.");
            String safeInstruction = instruction != null ? instruction.replace("\"", "\\\"") : "";
            String guidancePlan = "{\"status\":\"PROVIDER_NOT_CONFIGURED\",\"instruction\":\"" + safeInstruction + "\"}";

            AiExecution execution = new AiExecution();
            execution.setOrganizationId(orgId);
            execution.setUserId(userId);
            execution.setPromptText(instruction);
            execution.setDetectedIntent("AI_SETUP_GUIDANCE");
            execution.setExecutionPlan(guidancePlan);
            execution.setStatus("COMPLETED");
            execution.setTokensConsumed(0);
            execution.setEstimatedCostUsd(BigDecimal.ZERO);
            execution.setCompletedAt(Instant.now());
            execution = executionRepository.save(execution);

            String guidanceMsg = "NovaSphere AI: AI provayder kaliti (GEMINI_API_KEY yoki OPENAI_API_KEY) hali sozlanmagan. " +
                    "Iltimos, Sozlamalar (Settings) bo'limi orqali API kalitni kiriting.\n\n" +
                    "Ayni paytda siz 'Post Yaratish' (Create Post) bo'limi orqali Telegram, Instagram va YouTube kanallaringizga bevosita post chiqarishingiz yoki rejalashtirishingiz mumkin.";

            return new AgentChatResponse(
                    execution.getId(),
                    "AI_SETUP_GUIDANCE",
                    guidanceMsg,
                    guidancePlan,
                    "COMPLETED",
                    null
            );
        }

        String intent = "UNKNOWN";
        String actionSummary = "Analyzed user instruction";
        String proposedContent = "";
        boolean requiresApproval = true;

        try {
            JsonNode planJson = objectMapper.readTree(aiResult.content());
            intent = planJson.path("intent").asText("GENERAL_TASK");
            actionSummary = planJson.path("actionSummary").asText(actionSummary);
            proposedContent = planJson.path("proposedContent").asText("");
            requiresApproval = planJson.path("requiresApproval").asBoolean(true);
        } catch (Exception e) {
            log.warn("Failed to parse structured JSON from AI result, using raw text: {}", e.getMessage());
        }

        // 2. Persist Execution Record
        AiExecution execution = new AiExecution();
        execution.setOrganizationId(orgId);
        execution.setUserId(userId);
        execution.setPromptText(instruction);
        execution.setDetectedIntent(intent);
        execution.setExecutionPlan(aiResult.content());
        execution.setTokensConsumed(aiResult.promptTokens() + aiResult.completionTokens());
        execution.setEstimatedCostUsd(BigDecimal.valueOf(execution.getTokensConsumed() * 0.000002)); // ~$2 per 1M tokens approx

        UUID approvalId = null;

        // 3. Apply 4-Mode Autonomy Governance
        if ("ADVISOR".equalsIgnoreCase(autonomyMode)) {
            // Mode 1: Read-only advice
            execution.setStatus("COMPLETED");
            execution.setCompletedAt(Instant.now());
            executionRepository.save(execution);

            return new AgentChatResponse(
                    execution.getId(),
                    intent,
                    "Advisor Mode Active: I analyzed your request and prepared recommendations. In Advisor mode, no automated modifications or drafts are initiated.",
                    aiResult.content(),
                    "COMPLETED",
                    null
            );
        } else if ("CREATOR".equalsIgnoreCase(autonomyMode) || ("OPERATOR".equalsIgnoreCase(autonomyMode) && requiresApproval)) {
            // Mode 2/3: Operator requires explicit human-in-the-loop approval
            execution.setStatus("AWAITING_APPROVAL");
            execution = executionRepository.save(execution);

            AiApproval approval = approvalService.createPendingApproval(
                    orgId,
                    execution.getId(),
                    intent,
                    aiResult.content()
            );
            approvalId = approval.getId();

            String humanMessage;
            if (proposedContent != null && !proposedContent.isBlank()) {
                humanMessage = actionSummary + ":\n\n" + proposedContent;
            } else {
                humanMessage = String.format(
                        "Action planned: %s. An approval gate has been created (ID: %s). Please review and approve before publication.",
                        actionSummary, approval.getId()
                );
            }

            return new AgentChatResponse(
                    execution.getId(),
                    intent,
                    humanMessage,
                    aiResult.content(),
                    "AWAITING_APPROVAL",
                    approvalId
            );
        } else {
            // Mode 4: Autopilot
            execution.setStatus("COMPLETED");
            execution.setCompletedAt(Instant.now());
            execution = executionRepository.save(execution);

            String autoMessage = (proposedContent != null && !proposedContent.isBlank())
                    ? actionSummary + ":\n\n" + proposedContent
                    : "Autopilot Execution: " + actionSummary;

            return new AgentChatResponse(
                    execution.getId(),
                    intent,
                    autoMessage,
                    aiResult.content(),
                    "COMPLETED",
                    null
            );
        }
    }

    public record AgentChatResponse(
            UUID executionId,
            String intent,
            String responseMessage,
            String executionPlanJson,
            String status,
            UUID pendingApprovalId
    ) {}
}
