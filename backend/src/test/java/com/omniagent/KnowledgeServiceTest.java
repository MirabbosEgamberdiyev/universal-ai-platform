package com.omniagent;

import com.omniagent.modules.ai.provider.AiProvider.AiProviderResult;
import com.omniagent.modules.ai.service.AiProviderRouter;
import com.omniagent.modules.documents.repository.DocumentChunkRepository;
import com.omniagent.modules.knowledge.domain.KnowledgeArticle;
import com.omniagent.modules.knowledge.domain.KnowledgeBase;
import com.omniagent.modules.knowledge.repository.KnowledgeArticleRepository;
import com.omniagent.modules.knowledge.repository.KnowledgeBaseRepository;
import com.omniagent.modules.knowledge.service.KnowledgeService;
import com.omniagent.modules.knowledge.service.KnowledgeService.RagResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

public class KnowledgeServiceTest {

    private KnowledgeBaseRepository baseRepository;
    private KnowledgeArticleRepository articleRepository;
    private DocumentChunkRepository chunkRepository;
    private AiProviderRouter aiRouter;
    private KnowledgeService knowledgeService;
    private UUID orgId;

    @BeforeEach
    void setUp() {
        baseRepository = mock(KnowledgeBaseRepository.class);
        articleRepository = mock(KnowledgeArticleRepository.class);
        chunkRepository = mock(DocumentChunkRepository.class);
        aiRouter = mock(AiProviderRouter.class);

        knowledgeService = new KnowledgeService(baseRepository, articleRepository, chunkRepository, aiRouter);
        orgId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Should query knowledge base and synthesize factual RAG response with citations")
    void testQueryRag() {
        KnowledgeArticle article = new KnowledgeArticle();
        article.setId(UUID.randomUUID());
        article.setTitle("Refund Policy and Customer Guarantee");
        article.setContent("Customers are entitled to a full refund within 30 days of purchase if service standards are not met.");
        article.setSourceCitation("Corporate Policy Handbook 2026, Section 4.2");

        when(articleRepository.findByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(orgId))
                .thenReturn(List.of(article));
        when(chunkRepository.findByOrganizationIdAndDeletedAtIsNull(orgId))
                .thenReturn(List.of());

        AiProviderResult mockAiResult = new AiProviderResult(
                true,
                "According to Section 4.2 of the Corporate Policy Handbook 2026, full refunds are issued within 30 days of purchase.",
                120, 35, "gemini-1.5-pro", null
        );
        when(aiRouter.generateText(anyString(), anyString())).thenReturn(mockAiResult);

        RagResponse response = knowledgeService.queryRag(orgId, "What is our customer refund policy?");

        assertNotNull(response);
        assertTrue(response.answer().contains("30 days"));
        assertEquals(1, response.sources().size());
        assertEquals("Corporate Policy Handbook 2026, Section 4.2", response.sources().get(0).source());
    }
}
