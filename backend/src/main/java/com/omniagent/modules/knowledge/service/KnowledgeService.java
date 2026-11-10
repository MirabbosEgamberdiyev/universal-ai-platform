package com.omniagent.modules.knowledge.service;

import com.omniagent.modules.ai.provider.AiProvider.AiProviderResult;
import com.omniagent.modules.ai.service.AiProviderRouter;
import com.omniagent.modules.documents.domain.DocumentChunk;
import com.omniagent.modules.documents.repository.DocumentChunkRepository;
import com.omniagent.modules.knowledge.domain.KnowledgeArticle;
import com.omniagent.modules.knowledge.domain.KnowledgeBase;
import com.omniagent.modules.knowledge.repository.KnowledgeArticleRepository;
import com.omniagent.modules.knowledge.repository.KnowledgeBaseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class KnowledgeService {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeService.class);

    private final KnowledgeBaseRepository baseRepository;
    private final KnowledgeArticleRepository articleRepository;
    private final DocumentChunkRepository chunkRepository;
    private final AiProviderRouter aiRouter;

    public KnowledgeService(
            KnowledgeBaseRepository baseRepository,
            KnowledgeArticleRepository articleRepository,
            DocumentChunkRepository chunkRepository,
            AiProviderRouter aiRouter) {
        this.baseRepository = baseRepository;
        this.articleRepository = articleRepository;
        this.chunkRepository = chunkRepository;
        this.aiRouter = aiRouter;
    }

    @Transactional(readOnly = true)
    public List<KnowledgeBase> listBases(UUID orgId) {
        return baseRepository.findByOrganizationIdAndDeletedAtIsNullOrderByNameAsc(orgId);
    }

    @Transactional
    public KnowledgeBase createBase(UUID orgId, String name, String description, String scope) {
        KnowledgeBase kb = new KnowledgeBase();
        kb.setOrganizationId(orgId);
        kb.setName(name);
        kb.setDescription(description);
        kb.setScope(scope != null ? scope.toUpperCase() : "ORGANIZATION");
        return baseRepository.save(kb);
    }

    @Transactional(readOnly = true)
    public List<KnowledgeArticle> listArticles(UUID orgId) {
        return articleRepository.findByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(orgId);
    }

    @Transactional
    public KnowledgeArticle createArticle(UUID orgId, UUID baseId, String title, String content, String citation, String[] tags) {
        KnowledgeArticle article = new KnowledgeArticle();
        article.setOrganizationId(orgId);
        article.setKnowledgeBaseId(baseId);
        article.setTitle(title);
        article.setContent(content);
        article.setSourceCitation(citation);
        article.setTags(tags != null ? tags : new String[0]);
        article.setVerified(true);
        return articleRepository.save(article);
    }

    public record SearchResultItem(String title, String snippet, String source, double relevanceScore) {}
    public record RagResponse(String answer, List<SearchResultItem> sources) {}

    @Transactional(readOnly = true)
    public RagResponse queryRag(UUID orgId, String query) {
        log.info("Executing RAG query for org [{}]: {}", orgId, query);

        List<SearchResultItem> candidates = new ArrayList<>();
        String[] queryTerms = query.toLowerCase().split("\\s+");

        // 1. Search Knowledge Articles
        List<KnowledgeArticle> articles = articleRepository.findByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(orgId);
        for (KnowledgeArticle art : articles) {
            double score = scoreText(art.getTitle() + " " + art.getContent(), queryTerms);
            if (score > 0.1) {
                candidates.add(new SearchResultItem(
                        art.getTitle(),
                        art.getContent().length() > 300 ? art.getContent().substring(0, 300) + "..." : art.getContent(),
                        art.getSourceCitation() != null ? art.getSourceCitation() : "Internal Knowledge Base",
                        score
                ));
            }
        }

        // 2. Search Document Chunks
        List<DocumentChunk> chunks = chunkRepository.findByOrganizationIdAndDeletedAtIsNull(orgId);
        for (DocumentChunk ch : chunks) {
            double score = scoreText(ch.getChunkText(), queryTerms);
            if (score > 0.1) {
                candidates.add(new SearchResultItem(
                        "Document Chunk #" + ch.getChunkIndex(),
                        ch.getChunkText(),
                        "Document ID: " + ch.getDocumentId(),
                        score
                ));
            }
        }

        candidates.sort((a, b) -> Double.compare(b.relevanceScore(), a.relevanceScore()));
        List<SearchResultItem> topSources = candidates.stream().limit(4).toList();

        if (topSources.isEmpty()) {
            return new RagResponse("I could not find verified information matching your query in the organization knowledge base.", List.of());
        }

        // Build context with safe XML delimiter wrappers
        StringBuilder contextBuilder = new StringBuilder();
        for (SearchResultItem item : topSources) {
            contextBuilder.append("<untrusted_document_context source=\"")
                    .append(item.source()).append("\">\n")
                    .append(item.snippet()).append("\n")
                    .append("</untrusted_document_context>\n\n");
        }

        String prompt = "Answer the user question using ONLY the provided verified context. Cite your sources explicitly. If the answer cannot be determined from the context, state that the information is unavailable.\n\n" +
                "Context:\n" + contextBuilder +
                "Question: " + query;

        AiProviderResult aiResult = aiRouter.generateText(
                "You are an enterprise knowledge base assistant. Provide factual, cited answers without fabricating unstated claims.",
                prompt
        );

        return new RagResponse(aiResult.content(), topSources);
    }

    private double scoreText(String text, String[] terms) {
        if (text == null) return 0.0;
        String lower = text.toLowerCase();
        int matches = 0;
        for (String term : terms) {
            if (lower.contains(term)) {
                matches++;
            }
        }
        return (double) matches / Math.max(terms.length, 1);
    }
}
