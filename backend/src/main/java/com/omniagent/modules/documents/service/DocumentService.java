package com.omniagent.modules.documents.service;

import com.omniagent.common.exception.BusinessRuleException;
import com.omniagent.common.exception.ResourceNotFoundException;
import com.omniagent.modules.ai.provider.AiProvider.AiProviderResult;
import com.omniagent.modules.ai.service.AiProviderRouter;
import com.omniagent.modules.documents.domain.Document;
import com.omniagent.modules.documents.domain.DocumentChunk;
import com.omniagent.modules.documents.repository.DocumentChunkRepository;
import com.omniagent.modules.documents.repository.DocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class DocumentService {

    private static final Logger log = LoggerFactory.getLogger(DocumentService.class);

    private final DocumentRepository documentRepository;
    private final DocumentChunkRepository chunkRepository;
    private final AiProviderRouter aiRouter;

    // Prompt injection heuristic patterns
    private static final List<Pattern> INJECTION_PATTERNS = List.of(
            Pattern.compile("ignore\\s+(all\\s+)?(previous|prior)\\s+instructions", Pattern.CASE_INSENSITIVE),
            Pattern.compile("you\\s+are\\s+now\\s+(in\\s+developer\\s+mode|dan|unfiltered)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("system\\s+override", Pattern.CASE_INSENSITIVE),
            Pattern.compile("reveal\\s+(all\\s+)?api\\s+keys", Pattern.CASE_INSENSITIVE),
            Pattern.compile("disregard\\s+(all\\s+)?safety\\s+guidelines", Pattern.CASE_INSENSITIVE)
    );

    public DocumentService(DocumentRepository documentRepository, DocumentChunkRepository chunkRepository, AiProviderRouter aiRouter) {
        this.documentRepository = documentRepository;
        this.chunkRepository = chunkRepository;
        this.aiRouter = aiRouter;
    }

    @Transactional(readOnly = true)
    public List<Document> listDocuments(UUID orgId, String fileType) {
        if (fileType != null && !fileType.isBlank() && !"ALL".equalsIgnoreCase(fileType)) {
            return documentRepository.findByOrganizationIdAndFileTypeAndDeletedAtIsNullOrderByCreatedAtDesc(orgId, fileType.toUpperCase());
        }
        return documentRepository.findByOrganizationIdAndDeletedAtIsNullOrderByCreatedAtDesc(orgId);
    }

    @Transactional
    public Document ingestDocument(UUID orgId, UUID userId, String fileName, String fileType, long fileSizeBytes, String storageUrl, String textContent) {
        Document doc = new Document();
        doc.setOrganizationId(orgId);
        doc.setUploadedByUserId(userId);
        doc.setFileName(fileName);
        doc.setFileType(fileType.toUpperCase());
        doc.setFileSizeBytes(fileSizeBytes);
        doc.setStorageUrl(storageUrl);
        doc.setExtractedText(textContent);

        // Security: Heuristic Prompt Injection Scan
        double injectionScore = calculateInjectionScore(textContent);
        doc.setPromptInjectionScore(BigDecimal.valueOf(injectionScore));

        if (injectionScore >= 0.70) {
            doc.setScanStatus("QUARANTINED");
            log.warn("Document [{}] QUARANTINED for prompt injection score {}", fileName, injectionScore);
            return documentRepository.save(doc);
        } else {
            doc.setScanStatus("CLEAN");
        }

        // Generate AI Summary
        try {
            String prompt = "Provide a 2-3 sentence executive summary of the following document:\n\n" +
                    (textContent.length() > 3000 ? textContent.substring(0, 3000) : textContent);
            AiProviderResult result = aiRouter.generateText("You are an executive document intelligence summarizer.", prompt);
            doc.setAiSummary(result.content());
        } catch (Exception e) {
            doc.setAiSummary("Executive summary unavailable.");
        }

        Document savedDoc = documentRepository.save(doc);

        // Chunk document into 500-char windows with 100-char overlap
        chunkAndIndex(savedDoc, textContent);

        return savedDoc;
    }

    private double calculateInjectionScore(String text) {
        if (text == null || text.isBlank()) return 0.0;
        int matches = 0;
        for (Pattern p : INJECTION_PATTERNS) {
            if (p.matcher(text).find()) {
                matches++;
            }
        }
        return Math.min(1.0, matches * 0.40);
    }

    private void chunkAndIndex(Document doc, String text) {
        if (text == null || text.isBlank()) return;

        List<DocumentChunk> chunks = new ArrayList<>();
        int chunkSize = 500;
        int overlap = 100;
        int start = 0;
        int chunkIdx = 0;

        while (start < text.length()) {
            int end = Math.min(start + chunkSize, text.length());
            String chunkText = text.substring(start, end).trim();

            if (!chunkText.isBlank()) {
                DocumentChunk chunk = new DocumentChunk();
                chunk.setOrganizationId(doc.getOrganizationId());
                chunk.setDocumentId(doc.getId());
                chunk.setChunkIndex(chunkIdx++);
                chunk.setChunkText(chunkText);
                chunk.setTokenCount(chunkText.length() / 4); // Heuristic token estimation
                chunks.add(chunk);
            }

            if (end == text.length()) break;
            start += (chunkSize - overlap);
        }

        chunkRepository.saveAll(chunks);
        log.info("Indexed document [{}] into {} chunks", doc.getFileName(), chunks.size());
    }

    @Transactional(readOnly = true)
    public List<DocumentChunk> getDocumentChunks(UUID orgId, UUID documentId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));
        if (!doc.getOrganizationId().equals(orgId)) {
            throw new BusinessRuleException("Unauthorized document access");
        }
        return chunkRepository.findByDocumentIdOrderByChunkIndexAsc(documentId);
    }
}
