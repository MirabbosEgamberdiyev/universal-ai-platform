package com.omniagent.modules.knowledge.controller;

import com.omniagent.common.security.TenantContext;
import com.omniagent.modules.knowledge.domain.KnowledgeArticle;
import com.omniagent.modules.knowledge.domain.KnowledgeBase;
import com.omniagent.modules.knowledge.service.KnowledgeService;
import com.omniagent.modules.knowledge.service.KnowledgeService.RagResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/knowledge")
public class KnowledgeController {

    private final KnowledgeService knowledgeService;

    public KnowledgeController(KnowledgeService knowledgeService) {
        this.knowledgeService = knowledgeService;
    }

    @GetMapping("/bases")
    public ResponseEntity<List<KnowledgeBase>> listBases() {
        UUID orgId = TenantContext.getOrganizationId();
        return ResponseEntity.ok(knowledgeService.listBases(orgId));
    }

    @PostMapping("/bases")
    public ResponseEntity<KnowledgeBase> createBase(@RequestBody Map<String, String> request) {
        UUID orgId = TenantContext.getOrganizationId();
        String name = request.get("name");
        String desc = request.getOrDefault("description", "");
        String scope = request.getOrDefault("scope", "ORGANIZATION");
        return ResponseEntity.ok(knowledgeService.createBase(orgId, name, desc, scope));
    }

    @GetMapping("/articles")
    public ResponseEntity<List<KnowledgeArticle>> listArticles() {
        UUID orgId = TenantContext.getOrganizationId();
        return ResponseEntity.ok(knowledgeService.listArticles(orgId));
    }

    @PostMapping("/articles")
    public ResponseEntity<KnowledgeArticle> createArticle(@RequestBody Map<String, Object> request) {
        UUID orgId = TenantContext.getOrganizationId();
        UUID baseId = UUID.fromString((String) request.get("knowledgeBaseId"));
        String title = (String) request.get("title");
        String content = (String) request.get("content");
        String citation = (String) request.getOrDefault("sourceCitation", "Internal Doc");
        String[] tags = request.containsKey("tags") ? ((List<?>) request.get("tags")).toArray(new String[0]) : new String[0];

        return ResponseEntity.ok(knowledgeService.createArticle(orgId, baseId, title, content, citation, tags));
    }

    @PostMapping("/search")
    public ResponseEntity<RagResponse> searchKnowledge(@RequestBody Map<String, String> request) {
        UUID orgId = TenantContext.getOrganizationId();
        String query = request.getOrDefault("query", "");
        return ResponseEntity.ok(knowledgeService.queryRag(orgId, query));
    }
}
