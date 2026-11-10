package com.omniagent.modules.documents.controller;

import com.omniagent.common.security.TenantContext;
import com.omniagent.modules.documents.domain.Document;
import com.omniagent.modules.documents.domain.DocumentChunk;
import com.omniagent.modules.documents.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    public ResponseEntity<List<Document>> listDocuments(@RequestParam(required = false) String fileType) {
        UUID orgId = TenantContext.getOrganizationId();
        return ResponseEntity.ok(documentService.listDocuments(orgId, fileType));
    }

    @PostMapping
    public ResponseEntity<Document> uploadDocument(@RequestBody Map<String, Object> request) {
        UUID orgId = TenantContext.getOrganizationId();
        String fileName = (String) request.get("fileName");
        String fileType = (String) request.getOrDefault("fileType", "TXT");
        long fileSizeBytes = ((Number) request.getOrDefault("fileSizeBytes", 1024)).longValue();
        String storageUrl = (String) request.getOrDefault("storageUrl", "https://storage.novasphere.ai/docs/" + fileName);
        String textContent = (String) request.getOrDefault("textContent", "");

        Document doc = documentService.ingestDocument(orgId, null, fileName, fileType, fileSizeBytes, storageUrl, textContent);
        return ResponseEntity.ok(doc);
    }

    @GetMapping("/{id}/chunks")
    public ResponseEntity<List<DocumentChunk>> getDocumentChunks(@PathVariable UUID id) {
        UUID orgId = TenantContext.getOrganizationId();
        return ResponseEntity.ok(documentService.getDocumentChunks(orgId, id));
    }
}
