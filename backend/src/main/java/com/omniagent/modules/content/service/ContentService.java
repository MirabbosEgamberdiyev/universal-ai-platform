package com.omniagent.modules.content.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.omniagent.common.exception.BusinessRuleException;
import com.omniagent.common.exception.ResourceNotFoundException;
import com.omniagent.modules.ai.provider.AiProvider.AiProviderResult;
import com.omniagent.modules.ai.service.AiProviderRouter;
import com.omniagent.modules.content.domain.Content;
import com.omniagent.modules.content.repository.ContentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ContentService {

    private final ContentRepository contentRepository;
    private final AiProviderRouter aiRouter;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ContentService(ContentRepository contentRepository, AiProviderRouter aiRouter) {
        this.contentRepository = contentRepository;
        this.aiRouter = aiRouter;
    }

    @Transactional
    public Content createDraft(UUID orgId, UUID userId, String title, String bodyText, String locale, List<String> tags) {
        Content content = new Content();
        content.setOrganizationId(orgId);
        content.setAuthorId(userId);
        content.setTitle(title);
        content.setBodyText(bodyText);
        content.setLocale(locale != null ? locale : "en");
        if (tags != null) {
            content.setTags(tags.toArray(new String[0]));
        }
        content.setStatus("DRAFT");
        return contentRepository.save(content);
    }

    @Transactional
    public Content updateDraft(UUID orgId, UUID contentId, String title, String bodyText, List<String> tags) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content draft not found"));

        if (!content.getOrganizationId().equals(orgId)) {
            throw new BusinessRuleException("Unauthorized");
        }

        if (title != null) content.setTitle(title);
        if (bodyText != null) content.setBodyText(bodyText);
        if (tags != null) content.setTags(tags.toArray(new String[0]));
        return contentRepository.save(content);
    }

    @Transactional(readOnly = true)
    public List<Content> listContent(UUID orgId) {
        return contentRepository.findByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(orgId);
    }

    @Transactional(readOnly = true)
    public Content getContent(UUID orgId, UUID contentId) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found"));
        if (!content.getOrganizationId().equals(orgId)) {
            throw new BusinessRuleException("Unauthorized");
        }
        return content;
    }

    @Transactional
    public void deleteDraft(UUID orgId, UUID contentId) {
        Content content = getContent(orgId, contentId);
        content.setDeletedAt(Instant.now());
        contentRepository.save(content);
    }

    public GeneratedContentResponse generateAiContent(UUID orgId, ContentGenRequest request) {
        String systemInstruction = """
                You are a world-class AI Social Media Copywriter and Strategist.
                Generate engaging, viral social media copy tailored to the specified platform, audience, language, and tone.
                Languages supported: English, Russian, Uzbek Latin (O'zbekcha), Uzbek Cyrillic (Ўзбекча).
                Always include relevant trending hashtags and a strong call-to-action (CTA).
                """;

        String jsonSchema = """
                {
                  "headline": "STRING",
                  "bodyText": "STRING (The full formatted post text with emojis)",
                  "hashtags": ["ARRAY of STRINGS, e.g. #omniagent, #biznes"],
                  "platformNotes": "STRING (Specific advice for the target network)"
                }
                """;

        String userPrompt = String.format(
                "Topic: %s\nTarget Platform: %s\nTone: %s\nLanguage: %s\nAudience: %s",
                request.topic(), request.platform(), request.tone(), request.language(), request.targetAudience()
        );

        AiProviderResult result = aiRouter.generateStructuredJson(systemInstruction, userPrompt, jsonSchema);
        if (!result.success()) {
            throw new BusinessRuleException(result.errorMessage() != null ? result.errorMessage() : "AI_PROVIDER_NOT_CONFIGURED: Iltimos, Gemini yoki OpenAI API kalitini sozlang.");
        }

        String headline = request.topic();
        String body = "";
        String notes = "";
        List<String> hashtags = List.of();

        try {
            JsonNode node = objectMapper.readTree(result.content());
            headline = node.path("headline").asText(headline);
            body = node.path("bodyText").asText("");
            notes = node.path("platformNotes").asText("");
            if (node.path("hashtags").isArray()) {
                hashtags = objectMapper.convertValue(node.path("hashtags"), List.class);
            }
        } catch (Exception ignored) {
            body = result.content();
        }

        return new GeneratedContentResponse(headline, body, hashtags, notes, result.modelUsed());
    }

    public record ContentGenRequest(
            String topic,
            String platform,
            String tone,
            String language,
            String targetAudience
    ) {}

    public record GeneratedContentResponse(
            String headline,
            String bodyText,
            List<String> hashtags,
            String platformNotes,
            String modelUsed
    ) {}
}
